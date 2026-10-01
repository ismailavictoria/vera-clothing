import type { Product, ProductCategory } from '../../types/product';
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

/** Map the existing flat public.products columns to the storefront contract. */
export function mapSupabaseProduct(row: RemoteProduct): Product {
  const price = Number(row.price ?? 0);
  const stock = Number(row.stock ?? 0);

  return {
    id: String(row.id ?? ''),
    name: typeof row.name === 'string' ? row.name : 'Untitled product',
    description: typeof row.description === 'string' ? row.description : '',
    category: categoryValue(row.category),
    price: Number.isFinite(price) ? price : 0,
    images: validateProductImages([]),
    availableSizes: ['One size'],
    availableColors: [],
    stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
    featured: false,
  };
}

/** Fetch public catalogue rows only. With no configured client, retain the existing local preview. */
export async function loadCatalog(): Promise<CatalogResult> {
  const supabase = await getSupabaseClient();
  if (!supabase) return { products: sampleProducts, source: 'local-preview' };

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, category, price, stock, is_active')
    .eq('is_active', true);

  if (error) throw new Error(`Unable to load the Supabase product catalogue: ${error.message}`);
  return { products: (data ?? []).map((row) => mapSupabaseProduct(row as RemoteProduct)), source: 'supabase' };
}
