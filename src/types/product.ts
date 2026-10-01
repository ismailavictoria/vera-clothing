export type ProductCategory = 'Dresses' | 'Tops' | 'Trousers' | 'Skirts' | 'Jumpsuits' | 'Accessories';

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  hex: string;
  priceOverride?: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: ProductCategory;
  /** Ordered URLs/storage paths; first image is the main image and at most five are allowed. */
  images: string[];
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
  stock: number;
  featured?: boolean;
  badge?: string;
  material?: string;
  /** Active variants from product_variants table */
  variants: ProductVariant[];
}

export interface CartLine {
  lineId: string;
  productId: string;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
}