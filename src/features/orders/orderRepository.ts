import { getSupabaseClient } from '../../lib/supabase';

export interface OrderItemInput {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  size: string;
  color: string;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total: number;
  items: OrderItemInput[];
}

export interface CreatedOrder {
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

export async function createOrder(request: CreateOrderRequest): Promise<CreatedOrder> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  // Get the current session's access token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session. Please sign in to place an order.');
  }

  // Call the Edge Function
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!supabaseUrl) throw new Error('Supabase URL not configured.');

  const functionUrl = `${supabaseUrl}/functions/v1/create-order`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || `Order creation failed: ${response.status}`);
  }

  return responseData as CreatedOrder;
}