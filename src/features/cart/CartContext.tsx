import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartLine } from '../../types/product';
import { readStoredValue, writeStoredValue } from '../../lib/storage';
import { useCatalog } from '../catalog/CatalogContext';

interface AddCartLine { productId: string; size: string; color: string; quantity?: number }
interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: AddCartLine) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'vera.cart';
const STORAGE_VERSION = 1;
const loadCart = () => readStoredValue<CartLine[]>(STORAGE_KEY, STORAGE_VERSION, []).filter((line) => line && typeof line.lineId === 'string' && Number.isFinite(line.quantity) && line.quantity > 0);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>(loadCart);
  useEffect(() => writeStoredValue(STORAGE_KEY, STORAGE_VERSION, lines), [lines]);
  const add = useCallback(({ productId, size, color, quantity = 1 }: AddCartLine) => {
    const lineId = `${productId}:${size}:${color}`;
    setLines((current) => {
      const existing = current.find((line) => line.lineId === lineId);
      if (existing) return current.map((line) => line.lineId === lineId ? { ...line, quantity: line.quantity + quantity } : line);
      return [...current, { lineId, productId, size, color, quantity }];
    });
  }, []);
  const setQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) return;
    setLines((current) => current.map((line) => line.lineId === lineId ? { ...line, quantity } : line));
  }, []);
  const remove = useCallback((lineId: string) => setLines((current) => current.filter((line) => line.lineId !== lineId)), []);
  const clear = useCallback(() => setLines([]), []);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => {
    const product = products.find((entry) => entry.id === line.productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);
  const value = useMemo(() => ({ lines, count, subtotal, add, setQuantity, remove, clear }), [lines, count, subtotal, add, setQuantity, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
