import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { useCurrency } from '../features/currency/CurrencyContext';
import { WishlistButton } from './WishlistButton';
import { Button } from './ui';
import { QuickAddDialog } from './QuickAddDialog';
import { ProductPhoto } from './ProductPhoto';
import { getMainProductImage } from '../lib/productImages';

export function ProductCard({ product }: { product: Product }) {
  const { formatPrice } = useCurrency();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  return (
    <article className="product-card">
      <div className="product-image-wrap"><Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}><ProductPhoto className="product-image" src={getMainProductImage(product.images)} alt={product.name} /></Link>{product.badge && <span className="product-badge">{product.badge}</span>}<WishlistButton productId={product.id} className="product-heart" /></div>
      <div className="product-card-info"><div className="product-card-heading"><div><span className="product-category">{product.category}</span><h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3></div><span className="product-price">{formatPrice(product.price)}</span></div><p className="product-sizes">Available sizes · {product.availableSizes.join(' / ')}</p><div className="product-card-actions"><Button variant="secondary" onClick={() => setQuickAddOpen(true)}>Add to cart</Button><Link className="view-product-link" to={`/product/${product.id}`} aria-label={`View ${product.name} details`}><span>View</span><ArrowUpRight size={15} /></Link></div></div>
      {quickAddOpen && <QuickAddDialog product={product} onClose={() => setQuickAddOpen(false)} />}
    </article>
  );
}
