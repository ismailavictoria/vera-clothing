import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../features/cart/CartContext';
import { useCatalog } from '../features/catalog/CatalogContext';
import { CartItem } from '../components/CartItem';
import { OrderSummary } from '../components/OrderSummary';

export function CartPage() {
  const { products } = useCatalog();
  const cart = useCart();
  const lines = cart.lines.filter((line) => products.some((product) => product.id === line.productId));
  return <div className="page-wrap cart-page"><div className="page-intro cart-intro"><span className="eyebrow">Your considered finds</span><h1>Your <em>bag.</em></h1><p>{cart.count} {cart.count === 1 ? 'piece' : 'pieces'} for your everyday.</p></div>{lines.length ? <div className="cart-layout"><section className="cart-list" aria-label="Items in your cart">{lines.map((line) => { const product = products.find((entry) => entry.id === line.productId)!; return <CartItem key={line.lineId} product={product} size={line.size} color={line.color} quantity={line.quantity} variantId={line.variantId} onQuantityChange={(quantity) => cart.setQuantity(line.lineId, quantity)} onRemove={() => cart.remove(line.lineId)} />; })}<Link to="/shop" className="back-link cart-continue"><ArrowLeft size={15} /> Continue shopping</Link></section><aside className="cart-aside"><OrderSummary lines={lines} catalog={products} showDelivery /><Link to="/checkout" className="button button-primary button-full checkout-link">Continue to checkout</Link><p className="secure-note">A calm checkout, coming right up.</p></aside></div> : <div className="empty-state cart-empty"><div className="empty-heart"><ShoppingBag size={26} strokeWidth={1.3} /></div><span className="eyebrow">Nothing in your bag, yet</span><h2>Room for something<br /><em>you’ll love.</em></h2><p>Take your time. The good pieces will be right here.</p><Link className="button button-primary" to="/shop">Find your everyday</Link></div>}</div>;
}