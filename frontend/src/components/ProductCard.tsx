import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/products/${product.id}`;
      return;
    }

    try {
      setIsAdding(true);
      setAddError(null);
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add');
      setTimeout(() => setAddError(null), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="product-card" data-testid="product-card" data-product-id={product.id}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            data-testid="product-card-image"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <span
            className={`product-badge ${isOutOfStock ? 'badge-out-of-stock' : 'badge-in-stock'}`}
            data-testid="product-card-stock-badge"
          >
            {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>

        <div className="product-info">
          <div className="product-category" data-testid="product-card-category">
            {product.category}
          </div>
          <h3 className="product-title" data-testid="product-card-title" title={product.name}>
            {product.name}
          </h3>
          <p className="product-description">{product.description}</p>

          <div className="product-footer">
            <span className="product-price" data-testid="product-card-price">
              ${product.price.toFixed(2)}
            </span>

            {!isAdmin && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`btn btn-sm ${justAdded ? 'btn-secondary' : 'btn-primary'}`}
                data-testid="product-card-add-btn"
                title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              >
                {justAdded ? (
                  <>
                    <Check size={14} /> Added
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} /> {isOutOfStock ? 'Sold Out' : 'Add'}
                  </>
                )}
              </button>
            )}
          </div>

          {addError && (
            <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.35rem' }} data-testid="product-card-add-error">
              {addError}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

