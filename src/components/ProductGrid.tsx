import type { Product } from '../types/product';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, emptyMessage = 'No pieces found. Try a different search.' }: { products: Product[]; emptyMessage?: string }) {
  if (!products.length) return <div className="empty-state compact-empty"><span className="eyebrow">Nothing here just yet</span><p>{emptyMessage}</p></div>;
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
