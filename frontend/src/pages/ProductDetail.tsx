import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, AlertCircle, ShieldAlert, Package } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || isNaN(Number(id))) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Product not found');
        } else {
          setError(err.response?.data?.message || 'Failed to load product details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (val: number) => {
    if (!product) return;
    if (val < 1) return;
    if (val > product.stock) return;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/products/${product.id}`);
      return;
    }

    try {
      setIsAdding(true);
      setSuccessMsg(null);
      setError(null);
      await addToCart(product.id, quantity);
      setSuccessMsg(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }} data-testid="product-not-found">
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Product Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || 'The requested product could not be located in our inventory.'}
          </p>
          <Link to="/products" className="btn btn-primary" data-testid="back-to-products-btn">
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container" data-testid="product-details-container">
      {/* Breadcrumb / Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/products" className="btn btn-secondary btn-sm" data-testid="back-button">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          padding: '2rem',
        }}
      >
        {/* Product Image */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', maxHeight: '460px', objectFit: 'contain' }}
            data-testid="product-details-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>

        {/* Product Information */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--primary)',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
            data-testid="product-details-category"
          >
            {product.category}
          </span>

          <h1
            style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}
            data-testid="product-details-title"
          >
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span
              style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-dark)' }}
              data-testid="product-details-price"
            >
              ${product.price.toFixed(2)}
            </span>
            <span
              className={`status-badge ${isOutOfStock ? 'status-cancelled' : 'status-delivered'}`}
              data-testid="product-details-stock"
            >
              {isOutOfStock ? 'Out of Stock' : `${product.stock} units available`}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Product Description</h3>
            <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }} data-testid="product-details-description">
              {product.description}
            </p>
          </div>

          {successMsg && <Alert type="success" message={successMsg} testId="product-add-success" />}
          {error && <Alert type="danger" message={error} testId="product-details-error" onClose={() => setError(null)} />}

          {/* Add to Cart Actions */}
          {!isAdmin ? (
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quantity:</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={isOutOfStock || quantity <= 1}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '8px 0 0 8px', border: 'none', padding: '0.5rem 0.85rem' }}
                    data-testid="product-quantity-decrease"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                    disabled={isOutOfStock}
                    style={{ width: '50px', textAlign: 'center', border: 'none', fontWeight: 600, outline: 'none' }}
                    data-testid="product-quantity-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '0 8px 8px 0', border: 'none', padding: '0.5rem 0.85rem' }}
                    data-testid="product-quantity-increase"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="btn btn-primary btn-lg btn-block"
                data-testid="add-to-cart"
              >
                <ShoppingCart size={20} />
                <span>{isOutOfStock ? 'Currently Unavailable' : isAdding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          ) : (
            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <p style={{ color: '#92400e', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} />
                Logged in as Admin. Shopping cart is reserved for Customer roles.
              </p>
              <Link to={`/admin/products`} className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                Manage in Admin Catalog
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

