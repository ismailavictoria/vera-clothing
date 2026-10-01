import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../features/catalog/CatalogContext';
import { ProductGrid } from '../components/ProductGrid';
import { useWishlist } from '../features/wishlist/WishlistContext';

export function WishlistPage() {
  const { products } = useCatalog();
  const wishlist = useWishlist();
  const savedProducts = wishlist.productIds.map((id) => products.find((product) => product.id === id)).filter((product) => product !== undefined);
  return <div className="page-wrap collection-page"><div className="page-intro collection-intro"><span className="eyebrow"><Heart size={13} /> Things you love</span><h1>Your <em>wishlist.</em></h1><p>{savedProducts.length ? `${savedProducts.length} considered ${savedProducts.length === 1 ? 'piece' : 'pieces'}, saved for later.` : 'A little space for the pieces that feel like you.'}</p></div>{savedProducts.length ? <ProductGrid products={savedProducts} /> : <div className="empty-state wishlist-empty"><div className="empty-heart"><Heart size={26} strokeWidth={1.3} /></div><span className="eyebrow">A page of possibility</span><h2>Keep the pieces<br /><em>that speak to you.</em></h2><p>Tap the little heart on anything you love. We’ll keep it here for when you’re ready.</p><Link className="button button-primary" to="/shop">Explore the collection</Link></div>}</div>;
}
