import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { WishlistPage } from './pages/WishlistPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLayout } from './components/AdminLayout';
import { AdminDataProvider } from './features/admin/AdminDataContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminProductEditor } from './pages/AdminProductEditor';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminCustomersPage } from './pages/AdminCustomersPage';
import { AdminAIAssistantPage } from './pages/AdminAIAssistantPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { useCatalog } from './features/catalog/CatalogContext';
import { SignInPage, RegisterPage, AccountPage } from './pages/AuthPages';
import { AdminAccessGate } from './components/AdminAccessGate';

function CatalogConnectionNotice() {
  const { error } = useCatalog();
  if (!error) return null;
  return <div className="catalog-connection-notice" role="status">Supabase catalogue is unavailable. Showing the existing local preview catalogue. <span>{error}</span></div>;
}

function StorefrontLayout() {
  return <div className="app-shell"><Navbar /><CatalogConnectionNotice /><main><Routes><Route path="/" element={<HomePage />} /><Route path="/shop" element={<ShopPage />} /><Route path="/product/:productId" element={<ProductPage />} /><Route path="/wishlist" element={<WishlistPage />} /><Route path="/cart" element={<CartPage />} /><Route path="/checkout" element={<CheckoutPage />} /><Route path="/login" element={<SignInPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/account" element={<AccountPage />} /><Route path="*" element={<NotFoundPage />} /></Routes></main><Footer /></div>;
}

export default function App() {
  return <Routes>
    <Route path="/admin" element={<AdminAccessGate><AdminDataProvider><AdminLayout /></AdminDataProvider></AdminAccessGate>}>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="products/new" element={<AdminProductEditor mode="create" />} />
      <Route path="products/:id/edit" element={<AdminProductEditor mode="edit" />} />
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="customers" element={<AdminCustomersPage />} />
      <Route path="ai-assistant" element={<AdminAIAssistantPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
      <Route path="*" element={<AdminDashboard />} />
    </Route>
    <Route path="/*" element={<StorefrontLayout />} />
  </Routes>;
}
