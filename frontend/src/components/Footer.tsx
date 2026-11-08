import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" data-testid="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-col" style={{ maxWidth: '320px' }}>
            <div className="brand" style={{ marginBottom: '0.75rem' }}>
              <ShoppingBag size={22} />
              <span>ShopEase</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Modern, responsive e-commerce web application engineered specifically as a realistic Software Quality Assurance (QA) testing portfolio benchmark.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">Order History</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>QA Test Roles</h4>
            <ul className="footer-links">
              <li><Link to="/login">Customer Login</Link></li>
              <li><Link to="/register">Customer Register</Link></li>
              <li><Link to="/admin/login">Admin Portal</Link></li>
              <li><a href="/api/health" target="_blank" rel="noreferrer">API Health Check</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>QA Readiness</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--success)" />
              Deterministic Selectors Ready
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Playwright & Postman automated testable architecture.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopEase E-Commerce Platform. Built for SQA Portfolio Verification.</p>
        </div>
      </div>
    </footer>
  );
};

