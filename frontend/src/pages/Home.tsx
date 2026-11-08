import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ limit: 8 }),
          productService.getCategories(),
        ]);
        setFeaturedProducts(prodRes.products);
        setCategories(catRes);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '4rem 0',
          marginBottom: '3rem',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1rem',
              letterSpacing: '0.05em',
            }}
          >
            SOFTWARE QUALITY ASSURANCE PORTFOLIO BENCHMARK
          </span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem', maxWidth: '750px' }}>
            Elevate Your Everyday Shopping Experience
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#e0e7ff', maxWidth: '620px', marginBottom: '2rem' }}>
            Explore premium laptops, smartphones, gaming gear, and tech accessories with real-time stock tracking and secure transactions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-lg" style={{ backgroundColor: '#ffffff', color: '#1e3a8a' }} data-testid="hero-shop-btn">
              <ShoppingBag size={20} />
              <span>Browse Catalog</span>
            </Link>
            <Link to="/admin/login" className="btn btn-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }} data-testid="hero-admin-btn">
              <span>Admin Portal</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Value Highlights */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '8px', color: 'var(--primary)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Fast Delivery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track order status seamlessly from pending to delivered.</p>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--success-light)', padding: '0.75rem', borderRadius: '8px', color: 'var(--success)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Deterministic QA</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Data-testid attributes designed for Playwright & Postman.</p>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '8px', color: '#b45309' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Inventory Guards</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Server-enforced stock verification and rollbacks.</p>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Shop by Category</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/products"
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem' }}
              data-testid="category-chip-all"
            >
              All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem' }}
                data-testid={`category-chip-${cat.toLowerCase()}`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Featured Products</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Top picks ready for cart addition and order testing</p>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading products..." />
          ) : (
            <div className="products-grid">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

