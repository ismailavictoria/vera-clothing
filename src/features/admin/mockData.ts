import { products } from '../../data/products';
import type { AdminCustomer, AdminOrder, AdminProduct, OrderStatus } from './types';

const descriptions: Record<string, string> = {
  'p-01': 'Cut on the bias from fluid satin, Solene moves with a soft, considered ease. A refined neckline and delicate adjustable straps make it an evening piece you will return to.',
  'p-02': 'A clean, elongated line in breathable European linen. Finished with a discreet side fastening and a subtle back slit for natural movement.',
  'p-03': 'An easy, slightly oversized shirt with a beautifully crisp handfeel. Wear it buttoned, open, or tucked into your favorite tailoring.',
};

export const initialAdminProducts: AdminProduct[] = products.map((product, index) => ({
  id: product.id,
  name: product.name,
  description: descriptions[product.id] ?? product.description,
  shortDescription: product.description.split('.')[0] + '.',
  category: product.category,
  price: product.price,
  stock: product.stock,
  status: index === 9 ? 'Inactive' : 'Active',
  images: [...product.images],
  sizes: [...product.availableSizes],
  colors: product.availableColors.map((color) => color.name),
  updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
}));

export const mockOrders: AdminOrder[] = [
  { id: 'VC-1048', customer: 'Amelia Rose', email: 'amelia.rose@example.com', date: '2026-10-01T09:42:00', items: [{ name: 'The Solene Slip Dress', variant: 'S · Oat', quantity: 1, price: 148 }, { name: 'Soft Structure Tote', variant: 'One size · Cognac', quantity: 1, price: 124 }], total: 272, status: 'Pending', address: '18 Willow Lane, Portland, OR 97205, United States' },
  { id: 'VC-1047', customer: 'Maya Bennett', email: 'maya.b@example.com', date: '2026-09-30T16:18:00', items: [{ name: 'Everyday Poplin Shirt', variant: 'M · Cloud', quantity: 2, price: 96 }], total: 192, status: 'Processing', address: '204 Grove Street, Brooklyn, NY 11211, United States' },
  { id: 'VC-1046', customer: 'Olivia Chen', email: 'olivia.chen@example.com', date: '2026-09-30T11:03:00', items: [{ name: 'Linen Column Skirt', variant: 'S · Stone', quantity: 1, price: 112 }], total: 120, status: 'Shipped', address: '51 Clement Road, San Francisco, CA 94118, United States' },
  { id: 'VC-1045', customer: 'Ella Williams', email: 'ella.w@example.com', date: '2026-09-29T14:32:00', items: [{ name: 'Relaxed Tailored Trouser', variant: 'M · Espresso', quantity: 1, price: 164 }], total: 172, status: 'Delivered', address: '9 Park Avenue, Austin, TX 78701, United States' },
  { id: 'VC-1044', customer: 'Sofia Martin', email: 'sofia.m@example.com', date: '2026-09-28T10:15:00', items: [{ name: 'The Sunday Jumpsuit', variant: 'S · Olive', quantity: 1, price: 188 }], total: 196, status: 'Confirmed', address: '77 Orchard Street, Seattle, WA 98101, United States' },
  { id: 'VC-1043', customer: 'Nina Patel', email: 'nina.patel@example.com', date: '2026-09-27T12:20:00', items: [{ name: 'Sculpted Knit Tank', variant: 'XS · Ivory', quantity: 1, price: 68 }], total: 76, status: 'Cancelled', address: '300 Market Street, Denver, CO 80202, United States' },
  { id: 'VC-1042', customer: 'Grace Taylor', email: 'grace.t@example.com', date: '2026-09-26T08:45:00', items: [{ name: 'The Weekend Midi', variant: 'M · Cream', quantity: 1, price: 138 }], total: 146, status: 'Delivered', address: '14 Lakeview Drive, Chicago, IL 60611, United States' },
];

export const mockCustomers: AdminCustomer[] = [
  { id: 'C-2001', name: 'Amelia Rose', email: 'amelia.rose@example.com', orders: 4, spent: 684, joined: '2025-11-14', status: 'Active' },
  { id: 'C-2002', name: 'Maya Bennett', email: 'maya.b@example.com', orders: 3, spent: 482, joined: '2026-01-09', status: 'Active' },
  { id: 'C-2003', name: 'Olivia Chen', email: 'olivia.chen@example.com', orders: 2, spent: 296, joined: '2026-03-22', status: 'Active' },
  { id: 'C-2004', name: 'Ella Williams', email: 'ella.w@example.com', orders: 5, spent: 921, joined: '2025-08-02', status: 'Active' },
  { id: 'C-2005', name: 'Sofia Martin', email: 'sofia.m@example.com', orders: 1, spent: 196, joined: '2026-09-28', status: 'New' },
  { id: 'C-2006', name: 'Nina Patel', email: 'nina.patel@example.com', orders: 1, spent: 76, joined: '2026-09-27', status: 'New' },
  { id: 'C-2007', name: 'Grace Taylor', email: 'grace.t@example.com', orders: 3, spent: 514, joined: '2026-02-17', status: 'Active' },
];

export const orderStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
