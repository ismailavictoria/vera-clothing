import { useState } from 'react';
import { Heart, Menu, ShoppingBag, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { brand } from '../config/brand';
import { useCart } from '../features/cart/CartContext';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useAuth } from '../features/auth/AuthContext';
import { useAnnouncements } from '../features/storeSettings/AnnouncementContext';
import { useCatalog } from '../features/catalog/CatalogContext';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();
  const { products } = useCatalog();
  const visibleWishlistCount = new Set(
    wishlist.productIds.filter((id) => products.some((product) => product.id === id)),
  ).size;
  const { user, profile, loading, signOut } = useAuth();
  const { deliveryAnnouncement, brandAnnouncement } = useAnnouncements();
  const [authError, setAuthError] = useState('');
  const closeMenu = () => setMenuOpen(false);
  const handleSignOut = async () => { setAuthError(''); try { await signOut(); closeMenu(); } catch (reason) { setAuthError(reason instanceof Error ? reason.message : 'Unable to sign out.'); } };
  return <header className="site-header"><div className="announcement-bar">{deliveryAnnouncement && <span className="announcement-message">{deliveryAnnouncement}</span>}{deliveryAnnouncement && brandAnnouncement && <span className="announcement-separator" aria-hidden="true">✳</span>}{brandAnnouncement && <span className="announcement-message">{brandAnnouncement}</span>}</div><div className="nav-shell"><button className="icon-button mobile-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button><Link to="/" className="brand-lockup" aria-label={`${brand.name} home`}><span className="brand-monogram">{brand.monogram}</span><span>{brand.name}</span></Link><nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation"><NavLink to="/" onClick={closeMenu}>Home</NavLink><NavLink to="/shop" onClick={closeMenu}>Shop</NavLink><a href="/#collections" onClick={closeMenu}>Collections</a>{user ? <Link to="/account" onClick={closeMenu}>My account</Link> : !loading && <><Link className="mobile-auth-link" to="/login" onClick={closeMenu}>Sign in</Link><Link className="mobile-auth-link" to="/register" onClick={closeMenu}>Register</Link></>}</nav><div className="nav-actions"><Link to="/wishlist" className="nav-icon-link" aria-label={`Wishlist, ${visibleWishlistCount} items`}><Heart size={19} strokeWidth={1.6} /><span className="nav-label">Wishlist</span>{visibleWishlistCount > 0 && <span className="count-pill">{visibleWishlistCount}</span>}</Link><Link to="/cart" className="nav-icon-link" aria-label={`Shopping bag, ${cart.count} items`}><ShoppingBag size={19} strokeWidth={1.6} /><span className="nav-label">Bag</span>{cart.count > 0 && <span className="count-pill">{cart.count}</span>}</Link>{loading ? <span className="login-link auth-loading-label">Account…</span> : user ? <><Link to="/account" className="login-link account-nav-link" title={user.email ?? 'My account'}>{profile?.full_name || user.email}</Link><button className="login-link" type="button" onClick={handleSignOut}>Sign out</button></> : <><Link to="/login" className="login-link">Sign in</Link><Link to="/register" className="login-link register-nav-link">Register</Link></>}</div></div>{authError&&<div className="nav-auth-error" role="alert">{authError}</div>}</header>;
}
