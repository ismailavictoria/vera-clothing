export type ProductCategory = 'Dresses' | 'Tops' | 'Trousers' | 'Skirts' | 'Jumpsuits' | 'Accessories';

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
}

export interface CartLine {
  lineId: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
}
