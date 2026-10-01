import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartLine, ProductVariant } from '../../types/product';
import { readStoredValue, writeStoredValue } from '../../lib/storage';
import { useCatalog } from '../catalog/CatalogContext';

interface AddCartLine { variantId: string; quantity?: number }
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
const STORAGE_VERSION = 2;

function findVariant(products: { variants: ProductVariant[] }[], variantId: string): ProductVariant | undefined {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return variant;
  }
  return undefined;
}

function validateCartLine(line: CartLine, products: { variants: ProductVariant[] }[]): boolean {
  const variant = findVariant(products, line.variantId);
  return variant !== undefined && variant.productId === line.productId;
}

const loadCart = (products: { variants: ProductVariant[] }[]) => 
  readStoredValue<CartLine[]>(STORAGE_KEY, STORAGE_VERSION, [])
    .filter((line) => line && typeof line.lineId === 'string' && Number.isFinite(line.quantity) && line.quantity > 0)
    .filter((line) => validateCartLine(line, products));

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>(() => loadCart(products));
  useEffect(() => writeStoredValue(STORAGE_KEY, STORAGE_VERSION, lines), [lines]);

  const add = useCallback(({ variantId, quantity = 1 }: AddCartLine) => {
    const variant = findVariant(products, variantId);
    if (!variant) return;
    const lineId = variantId;
    setLines((current) => {
      const existing = current.find((line) => line.lineId === lineId);
      if (existing) return current.map((line) => line.lineId === lineId ? { ...line, quantity: line.quantity + quantity } : line);
      return [...current, { lineId, productId: variant.productId, variantId, size: variant.size, color: variant.color, quantity }];
    });
  }, [products]);

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) return;
    const line = lines.find((l) => l.lineId === lineId);
    const variant = line ? findVariant(products, line.variantId) : undefined;
    const maxStock = variant?.stockQuantity ?? Infinity;
    const clampedQuantity = Math.min(quantity, maxStock);
    setLines((current) => current.map((line) => line.lineId === lineId ? { ...line, quantity: clampedQuantity } : line));
  }, [lines, products]);

  const remove = useCallback((lineId: string) => setLines((current) => current.filter((line) => line.lineId !== lineId)), []);
  const clear = useCallback(() => setLines([]), []);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => {
    const variant = findVariant(products, line.variantId);
    const price = variant?.priceOverride ?? products.find((p) => p.id === line.productId)?.price ?? 0;
    return sum + price * line.quantity;
  }, 0);

  const value = useMemo(() => ({ lines, count, subtotal, add, setQuantity, remove, clear }), [lines, count, subtotal, add, setQuantity, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}