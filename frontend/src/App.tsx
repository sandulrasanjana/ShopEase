import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Customer Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public Storefront Routes */}
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="admin/login" element={<AdminLogin />} />

              {/* Protected Customer Routes */}
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="order-success/:id"
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/products"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/products/new"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/products/edit/:id"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/orders"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/orders/:id"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminOrderDetail />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route
                path="*"
                element={
                  <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                      404
                    </h1>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Page Not Found
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                      The requested route does not exist in ShopEase.
                    </p>
                    <a href="/" className="btn btn-primary">
                      Return to Homepage
                    </a>
                  </div>
                }
              />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

