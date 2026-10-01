import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { products as sampleProducts } from '../../data/products';
import { isSupabaseConfigured, supabaseConfigurationIssue } from '../../lib/supabase';
import { loadCatalog, type CatalogSource } from './catalogRepository';
import type { Product } from '../../types/product';

interface CatalogContextValue {
  products: Product[];
  source: CatalogSource;
  loading: boolean;
  error: string | null;
}
const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(sampleProducts);
  const [source, setSource] = useState<CatalogSource>('local-preview');
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(supabaseConfigurationIssue);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    loadCatalog()
      .then((result) => {
        if (cancelled) return;
        setProducts(result.products);
        setSource(result.source);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : 'Unable to connect to the Supabase catalogue.');
        setSource('local-preview');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => ({ products, source, loading, error }), [products, source, loading, error]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used within CatalogProvider');
  return context;
}
