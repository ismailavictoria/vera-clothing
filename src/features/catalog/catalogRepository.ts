import type { Product, ProductCategory, ProductVariant } from '../../types/product';
import { products as sampleProducts } from '../../data/products';
import { validateProductImages } from '../../lib/productImages';
import { getSupabaseClient } from '../../lib/supabase';

export type CatalogSource = 'local-preview' | 'supabase';
export interface CatalogResult {
  products: Product[];
  source: CatalogSource;
}

type RemoteProduct = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  category?: unknown;
  price?: unknown;
  stock?: unknown;
  is_active?: unknown;
  product_variants?: RemoteVariant[];
  product_images?: RemoteImage[];
};

type RemoteVariant = {
  id?: unknown;
  product_id?: unknown;
  size?: unknown;
  color?: unknown;
  stock?: unknown;
};

type RemoteImage = {
  image_url?: unknown;
  sort_order?: unknown;
};

function categoryValue(value: unknown): ProductCategory {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  const mappings: Record<string, ProductCategory> = {
    dress: 'Dresses', dresses: 'Dresses',
    top: 'Tops', tops: 'Tops',
    trouser: 'Trousers', trousers: 'Trousers', pants: 'Trousers',
    skirt: 'Skirts', skirts: 'Skirts',
    jumpsuit: 'Jumpsuits', jumpsuits: 'Jumpsuits',
    accessory: 'Accessories', accessories: 'Accessories',
  };
  return mappings[normalized] ?? 'Accessories';
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    black: '#272624',
    white: '#FFFFFF',
    oat: '#c6b9a3',
    stone: '#aaa18f',
    ink: '#333b40',
    cloud: '#efeee9',
    'blue stripe': '#8190a1',
    espresso: '#51483f',
    ivory: '#e9e2d5',
    moss: '#72715b',
    olive: '#66654e',
    cognac: '#93684e',
    tan: '#a57b58',
    chalk: '#e8e4d9',
    merlot: '#70494a',
    terracotta: '#a05c47',
    cream: '#e7dfd2',
    sand: '#b7aa95',
    rosewood: '#9a716c',
  };
  return map[color.toLowerCase()] ?? '#000000';
}

function generateSku(productId: string, size: string, color: string): string {
  return `${productId.toUpperCase()}-${size}-${color.toUpperCase().replace(/\s+/g, '-')}`;
}

function mapVariants(variants: RemoteVariant[] | undefined, productId: string): ProductVariant[] {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((v) => ({
      id: String(v.id ?? ''),
      productId: String(v.product_id ?? productId),
      sku: generateSku(productId, String(v.size ?? ''), String(v.color ?? '')),
      size: String(v.size ?? ''),
      color: String(v.color ?? ''),
      hex: colorToHex(String(v.color ?? '')),
      priceOverride: undefined,
      stockQuantity: Number(v.stock ?? 0),
      isActive: true,
    }));
}

function mapImages(images: RemoteImage[] | undefined): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .filter((i) => typeof i.image_url === 'string' && i.image_url.trim().length > 0)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((i) => String(i.image_url));
}

/** Map the joined Supabase row to the storefront Product contract. */
function mapSupabaseProduct(row: RemoteProduct): Product {
  const price = Number(row.price ?? 0);
  const stock = Number(row.stock ?? 0);
  const productId = String(row.id ?? '');
  const variants = mapVariants(row.product_variants, productId);
  const images = validateProductImages(mapImages(row.product_images));

  const availableSizes = [...new Set(variants.map((v) => v.size))];
  const colorMap = new Map<string, { name: string; hex: string }>();
  variants.forEach((v) => {
    if (!colorMap.has(v.color)) colorMap.set(v.color, { name: v.color, hex: v.hex });
  });
  const availableColors = Array.from(colorMap.values());

  return {
    id: productId,
    name: typeof row.name === 'string' ? row.name : 'Untitled product',
    description: typeof row.description === 'string' ? row.description : '',
    category: categoryValue(row.category),
    price: Number.isFinite(price) ? price : 0,
    images,
    availableSizes: availableSizes.length > 0 ? availableSizes : ['One size'],
    availableColors,
    stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
    featured: false,
    variants,
  };
}

/** Fetch public catalogue rows with variants and images. With no configured client, retain the existing local preview. */
export async function loadCatalog(): Promise<CatalogResult> {
  const supabase = await getSupabaseClient();
  if (!supabase) return { products: sampleProducts, source: 'local-preview' };

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, description, category, price, stock, is_active,
      product_variants(id, product_id, size, color, stock),
      product_images(id, product_id, sort_order, image_url)
    `)
    .eq('is_active', true)
    .order('sort_order', { foreignTable: 'product_images' });

  if (error) throw new Error(`Unable to load the Supabase product catalogue: ${error.message}`);
  return { products: (data ?? []).map((row) => mapSupabaseProduct(row as RemoteProduct)), source: 'supabase' };
}