import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, Ban } from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Alert } from '../components/Alert';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = async () => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access forbidden: You cannot view orders that belong to another customer.');
      } else if (err.response?.status === 404) {
        setError('Order not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to load order details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setIsCancelling(true);
      await orderService.cancelOrder(order.id);
      setShowCancelModal(false);
      setSuccessMsg('Order cancelled successfully. Product stock has been restored.');
      await fetchOrder();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--danger)' }}>Error Loading Order</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/orders" className="btn btn-primary" data-testid="back-to-orders-btn">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>
      </div>
    );
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
    <div className="container" data-testid="order-details-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/orders" className="btn btn-secondary btn-sm" data-testid="order-back-btn">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Order <span data-testid="order-details-id">#{order.id}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className={`status-badge ${getStatusBadgeClass(order.status)}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }} data-testid="order-details-status">
            {order.status}
          </span>

          {order.status === 'PENDING' && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              disabled={isCancelling}
              className="btn btn-danger btn-sm"
              data-testid="order-cancel-btn"
            >
              <Ban size={15} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {successMsg && <Alert type="success" message={successMsg} testId="order-cancel-success" onClose={() => setSuccessMsg(null)} />}
      {error && <Alert type="danger" message={error} testId="order-details-error" onClose={() => setError(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Order Items Table */}
        <div className="card">
          <div className="card-header">
            <span>Ordered Items</span>
            <span>{order.items?.length || 0} Products</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price at Purchase</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} data-testid="order-item-row" data-item-id={item.id}>
                    <td>
                      {item.productId ? (
                        <Link to={`/products/${item.productId}`} style={{ fontWeight: 600 }}>
                          {item.productName}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 600 }}>{item.productName}</span>
                      )}
                    </td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-footer" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Total: <span style={{ color: 'var(--primary-dark)' }} data-testid="order-details-total">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }} data-testid="order-shipping-info">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" />
              Shipping Destination
            </h3>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.shippingName}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{order.shippingAddress}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {order.shippingCity}, {order.shippingPostalCode}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Phone: {order.shippingPhone}</p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--primary)" />
              Payment & Security
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              Method: <strong>{order.paymentMethod}</strong>
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Order price captured at timestamp of checkout.
            </p>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showCancelModal}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This will release reserved stock back into inventory."
        confirmLabel="Yes, Cancel Order"
        isDanger={true}
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

