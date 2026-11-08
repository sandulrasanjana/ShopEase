import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Eye, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [loading, setLoading] = useState<boolean>(!order);

  useEffect(() => {
    if (!order && id) {
      orderService
        .getOrderById(id)
        .then(setOrder)
        .catch((err) => console.error('Failed to load order confirmation', err))
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  if (loading) {
    return <LoadingSpinner message="Fetching order confirmation..." />;
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '580px', width: '100%' }} data-testid="order-success-container">
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '4.5rem',
              height: '4.5rem',
              borderRadius: '50%',
              background: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={40} />
          </div>

          <span
            style={{
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '0.75rem',
            }}
            data-testid="order-success-status"
          >
            ORDER PLACED SUCCESSFULLY
          </span>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Thank You for Your Order!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Your order has been recorded in our database and stock has been automatically deducted.
          </p>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order Number:</span>
              <strong style={{ fontSize: '0.95rem' }} data-testid="order-success-id">
                #{order?.id || id}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Amount:</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--primary-dark)' }} data-testid="order-success-total">
                ${order?.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Payment Method:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{order?.paymentMethod || 'Simulated Card'}</span>
            </div>

            {order?.shippingAddress && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Delivering to:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500, textAlign: 'right' }}>
                  {order.shippingName}, {order.shippingCity}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={`/orders/${order?.id || id}`}
              className="btn btn-outline"
              data-testid="order-success-view-order-btn"
            >
              <Eye size={16} /> View Order Details
            </Link>
            <Link
              to="/products"
              className="btn btn-primary"
              data-testid="order-success-continue-shopping-btn"
            >
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

