import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Bot, ChevronRight, CircleHelp, LayoutDashboard, LogOut, Menu, Package, Plus, Settings, ShoppingCart, Users, X } from 'lucide-react';
import { brand } from '../config/brand';
import { useAuth } from '../features/auth/AuthContext';

const navigation = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package, end: true },
  { label: 'Add product', to: '/admin/products/new', icon: Plus },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'AI Product Assistant', to: '/admin/ai-assistant', icon: Bot },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];
const titles: Record<string, string> = { '/admin': 'Dashboard', '/admin/products': 'Products', '/admin/products/new': 'Add product', '/admin/orders': 'Orders', '/admin/customers': 'Customers', '/admin/ai-assistant': 'AI Product Assistant', '/admin/settings': 'Settings' };

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const title = location.pathname.endsWith('/edit') ? 'Edit product' : titles[location.pathname] ?? 'Admin';
  const handleSignOut = async () => { setLogoutError(''); try { await signOut(); navigate('/login', { replace: true }); } catch (reason) { setLogoutError(reason instanceof Error ? reason.message : 'Unable to sign out.'); } };
  return <div className="admin-shell">
    <button className="admin-mobile-toggle" aria-label={mobileOpen ? 'Close admin navigation' : 'Open admin navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={19} /> : <Menu size={19} />}<span>Menu</span></button>
    {mobileOpen && <button className="admin-mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`admin-sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <div className="admin-brand"><span className="brand-monogram">{brand.monogram}</span><div><strong>{brand.name}</strong><small>STORE ADMIN</small></div><button className="admin-sidebar-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="admin-nav-label">WORKSPACE</div>
      <nav className="admin-nav" aria-label="Admin navigation">{navigation.map(({ label, to, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}><Icon size={17} strokeWidth={1.7} /><span>{label}</span>{label === 'AI Product Assistant' && <span className="admin-new-tag">NEW</span>}</NavLink>)}</nav>
      <div className="admin-sidebar-bottom"><div className="admin-help-card"><span className="admin-help-icon"><CircleHelp size={17} /></span><strong>Need a hand?</strong><span>Visit the help center</span><ChevronRight size={15} /></div><NavLink to="/" className="admin-store-link"><ArrowLeft size={15} /> Back to storefront</NavLink>{logoutError&&<p className="admin-logout-error" role="alert">{logoutError}</p>}<div className="admin-profile"><div className="admin-avatar">{(profile?.full_name||'Admin').split(' ').map((part)=>part[0]).join('').slice(0,2)}</div><div className="admin-profile-text"><strong>{profile?.full_name||'Store admin'}</strong><span>{profile?.email||'Administrator'}</span></div><button className="admin-logout" title="Sign out" aria-label="Sign out" onClick={handleSignOut}><LogOut size={16} /></button></div></div>
    </aside>
    <section className="admin-workspace"><header className="admin-topbar"><div><span className="admin-breadcrumb">Workspace <ChevronRight size={13} /> <strong>{title}</strong></span></div><div className="admin-topbar-right"><span className="admin-preview-badge"><Activity size={13} /> LOCAL PREVIEW</span><span className="admin-top-avatar">VA</span></div></header><main className="admin-main"><Outlet /></main><footer className="admin-footer"><span>© {new Date().getFullYear()} {brand.name}</span><span>Admin preview · Data is stored in this session only</span></footer></section>
  </div>;
}
