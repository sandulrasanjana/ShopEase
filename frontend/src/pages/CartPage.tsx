import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Alert } from '../components/Alert';

export const CartPage: React.FC = () => {
  const { cart, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <ShoppingBag size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Your Shopping Cart</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please sign in to view your items, update quantities, and proceed to checkout.
          </p>
          <Link to="/login?redirect=/cart" className="btn btn-primary btn-block" data-testid="cart-login-btn">
            Sign In to View Cart
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && !cart) {
    return <LoadingSpinner message="Loading your shopping cart..." />;
  }

  const items = cart?.items || [];

  const handleQuantityChange = async (itemId: number, currentQty: number, delta: number, maxStock: number) => {
    const targetQty = currentQty + delta;
    if (targetQty < 1) return;
    if (targetQty > maxStock) {
      setErrorMsg(`Cannot increase beyond available stock (${maxStock} items available)`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    try {
      setErrorMsg(null);
      await updateQuantity(itemId, targetQty);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update quantity');
    }
  };

  const promptRemoveItem = (itemId: number, productName: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Remove Item',
      message: `Are you sure you want to remove "${productName}" from your cart?`,
      onConfirm: async () => {
        try {
          await removeItem(itemId);
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to remove item');
        }
      },
    });
  };

  const promptClearCart = () => {
    setModalConfig({
      isOpen: true,
      title: 'Clear Entire Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      onConfirm: async () => {
        try {
          await clearCart();
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to clear cart');
        }
      },
    });
  };

  return (
    <div className="container" data-testid="cart-container">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Shopping Cart</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review your selected items before checkout</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={promptClearCart}
            className="btn btn-outline btn-sm"
            data-testid="cart-clear-btn"
          >
            Clear Cart
          </button>
        )}
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} testId="cart-error-alert" onClose={() => setErrorMsg(null)} />}

      {items.length === 0 ? (
        <div className="empty-state" data-testid="cart-empty-state">
          <ShoppingBag className="empty-state-icon" />
          <h2 className="empty-state-title">Your Cart is Empty</h2>
          <p className="empty-state-text">
            Looks like you haven't added any products to your shopping cart yet. Start exploring our catalog now!
          </p>
          <Link to="/products" className="btn btn-primary" data-testid="cart-browse-products-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Cart Items List */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <span>Items ({cart?.totalItems || 0})</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  data-testid="cart-item"
                  data-item-id={item.id}
                  data-product-id={item.productId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', background: '#f8fafc' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={`/products/${item.productId}`}
                      style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem' }}
                      data-testid="cart-item-title"
                    >
                      {item.product.name}
                    </Link>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Unit: ${item.product.price.toFixed(2)} | Stock: {item.product.stock}
                    </span>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.product.stock)}
                          disabled={item.quantity <= 1}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.55rem', borderRadius: '6px 0 0 6px', border: 'none' }}
                          data-testid="cart-item-decrease"
                        >
                          -
                        </button>
                        <span style={{ padding: '0 0.6rem', fontSize: '0.875rem', fontWeight: 600 }} data-testid="cart-item-quantity">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.product.stock)}
                          disabled={item.quantity >= item.product.stock}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.55rem', borderRadius: '0 6px 6px 0', border: 'none' }}
                          data-testid="cart-item-increase"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => promptRemoveItem(item.id, item.product.name)}
                        className="btn btn-sm"
                        style={{ color: 'var(--danger)', background: 'transparent', border: 'none', padding: '0.25rem' }}
                        data-testid="cart-item-remove"
                        title="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-dark)' }} data-testid="cart-item-price">
                      ${item.subtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer" style={{ justifyContent: 'space-between' }}>
              <Link to="/products" className="btn btn-secondary btn-sm">
                <ArrowLeft size={15} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Order Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }} data-testid="cart-subtotal">
                ${(cart?.subtotal || 0).toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Shipping</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 800,
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--primary-dark)' }} data-testid="cart-total">
                ${(cart?.total || 0).toFixed(2)}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
              * Final total and inventory reservations are computed securely on the backend at checkout.
            </p>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg btn-block"
              data-testid="cart-checkout-button"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        isDanger={true}
      />
    </div>
  );
};

