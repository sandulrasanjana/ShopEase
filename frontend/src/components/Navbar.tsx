import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User as UserIcon, LogOut, Package, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar" data-testid="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand" data-testid="nav-brand">
          <ShoppingBag size={26} />
          <span>ShopEase</span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} data-testid="nav-home">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} data-testid="nav-products">
                Products
              </NavLink>
            </li>

            {/* Admin Specific Links */}
            {isAdmin && (
              <>
                <li>
                  <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} data-testid="nav-admin-dashboard">
                    <LayoutDashboard size={17} />
                    <span>Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} data-testid="nav-admin-products">
                    <Package size={17} />
                    <span>Manage Products</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} data-testid="nav-admin-orders">
                    <Shield size={17} />
                    <span>Manage Orders</span>
                  </NavLink>
                </li>
              </>
            )}

            {/* Cart Link (for Customer and Guest) */}
            {!isAdmin && (
              <li>
                <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} data-testid="nav-cart">
                  <div className="cart-badge-wrapper">
                    <ShoppingCart size={19} />
                    {totalItems > 0 && (
                      <span className="badge-count" data-testid="cart-badge-count">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span>Cart</span>
                </NavLink>
              </li>
            )}

            {/* Customer Specific Links */}
            {isAuthenticated && !isAdmin && (
              <li>
                <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} data-testid="nav-orders">
                  <span>My Orders</span>
                </NavLink>
              </li>
            )}

            {/* Auth / Profile Links */}
            {isAuthenticated ? (
              <li className="user-menu">
                <Link to="/profile" className="nav-item" data-testid="nav-profile">
                  <UserIcon size={17} />
                  <span data-testid="user-display-name">{user?.name}</span>
                </Link>
                <span className={`user-badge ${isAdmin ? 'admin' : 'customer'}`} data-testid="user-role-badge">
                  {user?.role}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  data-testid="nav-logout"
                  title="Logout"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" className="btn btn-outline btn-sm" data-testid="nav-login">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary btn-sm" data-testid="nav-register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

