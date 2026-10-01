import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { initialAdminProducts, mockCustomers, mockOrders } from './mockData';
import type { AdminCustomer, AdminOrder, AdminProduct, OrderStatus } from './types';
import { validateProductImages } from '../../lib/productImages';

type ProductInput = Omit<AdminProduct, 'id' | 'updatedAt'>;
interface AdminDataContextValue {
  products: AdminProduct[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  saveProduct: (input: ProductInput, id?: string) => AdminProduct;
  deleteProduct: (id: string) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
}
const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(initialAdminProducts);
  const [orders, setOrders] = useState(mockOrders);
  const saveProduct = useCallback((input: ProductInput, id?: string) => {
    const safeInput = { ...input, images: validateProductImages(input.images) };
    const existing = id ? products.find((product) => product.id === id) : undefined;
    const saved: AdminProduct = { ...safeInput, id: existing?.id ?? `local-${Date.now()}`, updatedAt: new Date().toISOString() };
    setProducts((current) => existing ? current.map((product) => product.id === existing.id ? saved : product) : [saved, ...current]);
    return saved;
  }, [products]);
  const deleteProduct = useCallback((id: string) => setProducts((current) => current.filter((product) => product.id !== id)), []);
  const setOrderStatus = useCallback((id: string, status: OrderStatus) => setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order)), []);
  const value = useMemo(() => ({ products, orders, customers: mockCustomers, saveProduct, deleteProduct, setOrderStatus }), [products, orders, saveProduct, deleteProduct, setOrderStatus]);
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider');
  return context;
}
