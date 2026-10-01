import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface OrderItemInput {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  size: string;
  color: string;
}

interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total: number;
  items: OrderItemInput[];
}

interface CreatedOrderResponse {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

function validateOrderRequest(body: unknown): CreateOrderRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  const req = body as Record<string, unknown>;

  const customer_name = req.customer_name;
  const customer_email = req.customer_email;
  const customer_phone = req.customer_phone;
  const shipping_address = req.shipping_address;
  const total = req.total;
  const items = req.items;

  if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
    throw new Error('customer_name is required');
  }
  if (!customer_email || typeof customer_email !== 'string' || !customer_email.trim()) {
    throw new Error('customer_email is required');
  }
  if (!customer_phone || typeof customer_phone !== 'string' || !customer_phone.trim()) {
    throw new Error('customer_phone is required');
  }
  if (!shipping_address || typeof shipping_address !== 'string' || !shipping_address.trim()) {
    throw new Error('shipping_address is required');
  }
  if (typeof total !== 'number' || !Number.isFinite(total) || total <= 0) {
    throw new Error('total must be a positive number');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }

  for (const item of items) {
    if (!item || typeof item !== 'object') throw new Error('Each item must be an object');
    if (!item.product_id || typeof item.product_id !== 'string') throw new Error('item.product_id is required');
    if (!item.product_name || typeof item.product_name !== 'string') throw new Error('item.product_name is required');
    if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error('item.quantity must be a positive integer');
    }
    if (typeof item.unit_price !== 'number' || !Number.isFinite(item.unit_price) || item.unit_price < 0) {
      throw new Error('item.unit_price must be a non-negative number');
    }
    if (!item.size || typeof item.size !== 'string') throw new Error('item.size is required');
    if (!item.color || typeof item.color !== 'string') throw new Error('item.color is required');
  }

  return {
    customer_name: customer_name.trim(),
    customer_email: customer_email.trim(),
    customer_phone: customer_phone.trim(),
    shipping_address: shipping_address.trim(),
    total,
    items: items as OrderItemInput[],
  };
}

async function createOrder(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  orderData: CreateOrderRequest
): Promise<CreatedOrderResponse> {
  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      total: orderData.total,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Insert order items
  const itemsWithOrderId = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    size: item.size,
    color: item.color,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId);

  if (itemsError) {
    // Clean up the order if items failed
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return order as CreatedOrderResponse;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create Supabase client with service role key (server-side only)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a client to verify the user's JWT and get their user ID
    const authClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Verify the user's session and get their ID
    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const orderData = validateOrderRequest(body);

    // Create a client with service role for database operations
    const dbClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Create the order
    const createdOrder = await createOrder(dbClient, user.id, orderData);

    return new Response(JSON.stringify(createdOrder), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const status = message.includes('required') || message.includes('must be') || message.includes('Invalid request') ? 400 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});