import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, CreditCard, Shield, Check } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    try {
      setUpdating(true);
      setError(null);
      setSuccessMsg(null);
      await adminService.updateOrderStatus(order.id, selectedStatus);
      setSuccessMsg(`Order #${order.id} status updated to ${selectedStatus} successfully`);
      await fetchOrder();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading customer order..." />;
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/admin/orders" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Admin Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container" data-testid="admin-order-detail-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/orders" className="btn btn-secondary btn-sm" data-testid="admin-back-orders-btn">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Manage Order <span data-testid="admin-order-detail-id">#{order.id}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Placed by <strong>{order.user?.name || order.shippingName}</strong> on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Update Status Bar */}
        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Change Status:</span>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.35rem 0.65rem' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            data-testid="admin-detail-status-select"
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleUpdateStatus}
            disabled={updating || selectedStatus === order.status}
            className="btn btn-primary btn-sm"
            data-testid="admin-detail-status-submit"
          >
            <Check size={15} /> Save
          </button>
        </div>
      </div>

      {successMsg && <Alert type="success" message={successMsg} testId="admin-detail-success-alert" onClose={() => setSuccessMsg(null)} />}
      {error && <Alert type="danger" message={error} testId="admin-detail-error-alert" onClose={() => setError(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Order Items Table */}
        <div className="card">
          <div className="card-header">
            <span>Customer Line Items</span>
            <span>Total: ${order.totalAmount.toFixed(2)}</span>
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
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.productName}</span>
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

          <div className="card-footer" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Payment Method: {order.paymentMethod}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Total: ${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" />
              Customer Information
            </h3>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.user?.name || order.shippingName}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Email: {order.user?.email || 'N/A'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>User ID: #{order.userId}</p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" />
              Delivery Destination
            </h3>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.shippingName}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{order.shippingAddress}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {order.shippingCity}, {order.shippingPostalCode}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Phone: {order.shippingPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

