import type { ProductCategory } from '../../types/product';

export type AdminProductStatus = 'Active' | 'Inactive';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: AdminProductStatus;
  images: string[];
  sizes: string[];
  colors: string[];
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: { name: string; variant: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  address: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
  status: 'Active' | 'New';
}
