import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (err: any) {
        console.error('Failed to load orders', err);
        setError('Failed to fetch your order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your order history..." />;
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PROCESSING':
        return 'status-processing';
      case 'SHIPPED':
        return 'status-shipped';
      case 'DELIVERED':
        return 'status-delivered';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="container" data-testid="orders-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Orders</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track past purchases, delivery statuses, and historical receipts</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state" data-testid="orders-empty-state">
          <Package className="empty-state-icon" />
          <h2 className="empty-state-title">No Orders Yet</h2>
          <p className="empty-state-text">
            You haven't placed any orders yet. Discover our latest items and make your first simulated order!
          </p>
          <Link to="/products" className="btn btn-primary" data-testid="orders-shop-now-btn">
            Shop Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} data-testid="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="card" data-testid="order-card" data-order-id={order.id}>
              <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }} data-testid="order-card-id">
                    Order #{order.id}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`} data-testid="order-status-badge">
                    {order.status}
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="btn btn-outline btn-sm"
                    data-testid="order-card-view-btn"
                  >
                    <Eye size={14} /> Details
                  </Link>
                </div>
              </div>

              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      Delivering to: <strong style={{ color: 'var(--text-main)' }}>{order.shippingName}</strong>, {order.shippingCity}
                    </p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Payment: {order.paymentMethod}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Paid</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)' }} data-testid="order-card-total">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

