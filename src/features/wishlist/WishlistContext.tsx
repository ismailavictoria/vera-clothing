import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStoredValue, writeStoredValue } from '../../lib/storage';

interface WishlistContextValue {
  productIds: string[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = 'vera.wishlist';
const STORAGE_VERSION = 1;
const loadWishlist = () => readStoredValue<string[]>(STORAGE_KEY, STORAGE_VERSION, []).filter((id) => typeof id === 'string');

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>(loadWishlist);
  useEffect(() => writeStoredValue(STORAGE_KEY, STORAGE_VERSION, productIds), [productIds]);
  const has = useCallback((productId: string) => productIds.includes(productId), [productIds]);
  const toggle = useCallback((productId: string) => {
    setProductIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
  }, []);
  const remove = useCallback((productId: string) => setProductIds((current) => current.filter((id) => id !== productId)), []);
  const value = useMemo(() => ({ productIds, count: productIds.length, has, toggle, remove }), [productIds, has, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider');
  return context;
}
