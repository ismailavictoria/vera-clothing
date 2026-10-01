import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './features/cart/CartContext';
import { WishlistProvider } from './features/wishlist/WishlistContext';
import { CatalogProvider } from './features/catalog/CatalogContext';
import { CurrencyProvider } from './features/currency/CurrencyContext';
import { AuthProvider } from './features/auth/AuthContext';
import { AnnouncementProvider } from './features/storeSettings/AnnouncementContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CurrencyProvider>
        <AnnouncementProvider>
          <AuthProvider>
            <CatalogProvider>
              <CartProvider>
                <WishlistProvider>
                  <App />
                </WishlistProvider>
              </CartProvider>
            </CatalogProvider>
          </AuthProvider>
        </AnnouncementProvider>
      </CurrencyProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
