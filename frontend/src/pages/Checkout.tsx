import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, CheckoutData } from '../services/orderService';
import { Alert } from '../components/Alert';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Checkout: React.FC = () => {
  const { cart, isLoading: isCartLoading, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CheckoutData>({
    shippingName: user?.name || '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingPhone: '',
    paymentMethod: 'Credit/Debit Card (Simulated)',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CheckoutData, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name && !formData.shippingName) {
      setFormData((prev) => ({ ...prev, shippingName: user.name }));
    }
  }, [user]);

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!formData.shippingName.trim()) {
      errors.shippingName = 'Full name is required';
    } else if (formData.shippingName.trim().length < 2) {
      errors.shippingName = 'Name must be at least 2 characters';
    }

    if (!formData.shippingAddress.trim()) {
      errors.shippingAddress = 'Shipping address is required';
    } else if (formData.shippingAddress.trim().length < 5) {
      errors.shippingAddress = 'Address must be at least 5 characters';
    }

    if (!formData.shippingCity.trim()) {
      errors.shippingCity = 'City is required';
    }

    if (!formData.shippingPostalCode.trim()) {
      errors.shippingPostalCode = 'Postal code is required';
    } else if (formData.shippingPostalCode.trim().length < 3) {
      errors.shippingPostalCode = 'Please enter a valid postal code';
    }

    if (!formData.shippingPhone.trim()) {
      errors.shippingPhone = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/.test(formData.shippingPhone.trim())) {
      errors.shippingPhone = 'Please enter a valid phone number (e.g. +1-555-0199)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof CheckoutData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cart || cart.items.length === 0) {
      setError('Your shopping cart is empty. Cannot place an empty order.');
      return;
    }

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const placedOrder = await orderService.createOrder(formData);
      await refreshCart();
      navigate(`/order-success/${placedOrder.id}`, { state: { order: placedOrder } });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place order. Please review your details.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading && !cart) {
    return <LoadingSpinner message="Preparing checkout..." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <AlertCircle size={48} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You cannot proceed to checkout with an empty cart. Please add items to your cart first.
          </p>
          <Link to="/products" className="btn btn-primary" data-testid="checkout-back-to-products">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" data-testid="checkout-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/cart" className="btn btn-secondary btn-sm" data-testid="checkout-back-to-cart">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Checkout & Place Order</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter shipping information and review your simulated order</p>
      </div>

      {error && <Alert type="danger" message={error} testId="checkout-error" onClose={() => setError(null)} />}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'flex-start',
        }}
      >
        {/* Shipping & Payment Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} data-testid="checkout-form">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--primary)" />
              Shipping Information
            </h2>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-name">
                Full Name
              </label>
              <input
                id="checkout-name"
                name="shippingName"
                type="text"
                data-testid="checkout-name"
                className={`form-control ${fieldErrors.shippingName ? 'is-invalid' : ''}`}
                placeholder="Jane Doe"
                value={formData.shippingName}
                onChange={handleChange}
              />
              {fieldErrors.shippingName && (
                <span className="form-error" data-testid="checkout-name-error">
                  {fieldErrors.shippingName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-address">
                Street Address
              </label>
              <input
                id="checkout-address"
                name="shippingAddress"
                type="text"
                data-testid="checkout-address"
                className={`form-control ${fieldErrors.shippingAddress ? 'is-invalid' : ''}`}
                placeholder="123 Main St, Apt 4B"
                value={formData.shippingAddress}
                onChange={handleChange}
              />
              {fieldErrors.shippingAddress && (
                <span className="form-error" data-testid="checkout-address-error">
                  {fieldErrors.shippingAddress}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="checkout-city">
                  City
                </label>
                <input
                  id="checkout-city"
                  name="shippingCity"
                  type="text"
                  data-testid="checkout-city"
                  className={`form-control ${fieldErrors.shippingCity ? 'is-invalid' : ''}`}
                  placeholder="New York"
                  value={formData.shippingCity}
                  onChange={handleChange}
                />
                {fieldErrors.shippingCity && (
                  <span className="form-error" data-testid="checkout-city-error">
                    {fieldErrors.shippingCity}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="checkout-postal-code">
                  Postal Code
                </label>
                <input
                  id="checkout-postal-code"
                  name="shippingPostalCode"
                  type="text"
                  data-testid="checkout-postal-code"
                  className={`form-control ${fieldErrors.shippingPostalCode ? 'is-invalid' : ''}`}
                  placeholder="10001"
                  value={formData.shippingPostalCode}
                  onChange={handleChange}
                />
                {fieldErrors.shippingPostalCode && (
                  <span className="form-error" data-testid="checkout-postal-code-error">
                    {fieldErrors.shippingPostalCode}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-phone">
                Phone Number
              </label>
              <input
                id="checkout-phone"
                name="shippingPhone"
                type="tel"
                data-testid="checkout-phone"
                className={`form-control ${fieldErrors.shippingPhone ? 'is-invalid' : ''}`}
                placeholder="+1-555-0199"
                value={formData.shippingPhone}
                onChange={handleChange}
              />
              {fieldErrors.shippingPhone && (
                <span className="form-error" data-testid="checkout-phone-error">
                  {fieldErrors.shippingPhone}
                </span>
              )}
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--primary)" />
                Simulated Payment Method
              </h2>

              <div className="form-group">
                <select
                  id="checkout-payment-method"
                  name="paymentMethod"
                  data-testid="checkout-payment-method"
                  className="form-control"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="Credit/Debit Card (Simulated)">Credit/Debit Card (Simulated Sandbox)</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Bank Transfer (Simulated)">Bank Wire Transfer (Simulated)</option>
                </select>
                <span className="form-hint" style={{ marginTop: '0.25rem' }}>
                  Notice: This is a QA portfolio simulation. No real money or payment provider will be charged.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg btn-block"
              style={{ marginTop: '1.5rem' }}
              data-testid="checkout-submit"
            >
              {isSubmitting ? 'Placing Order...' : `Place Order ($${cart.total.toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Order Items Review Sidebar */}
        <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Order Review</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '1.25rem' }}>
            {cart.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>${item.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span style={{ fontWeight: 600 }}>${cart.subtotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
          </div>

          <div
            style={{
              borderTop: '2px solid var(--border-color)',
              paddingTop: '0.75rem',
              marginTop: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
            }}
          >
            <span>Total to Pay</span>
            <span style={{ color: 'var(--primary-dark)' }}>${cart.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

