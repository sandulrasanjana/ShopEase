import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Filter, Check, Clock } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const AdminOrders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = searchParams.get('status') || 'ALL';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Per-order status state for quick inline update
  const [orderStatusMap, setOrderStatusMap] = useState<Record<number, OrderStatus>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllOrders(currentFilter !== 'ALL' ? currentFilter : undefined);
      setOrders(data);

      const statusMap: Record<number, OrderStatus> = {};
      data.forEach((o) => {
        statusMap[o.id] = o.status;
      });
      setOrderStatusMap(statusMap);
    } catch (err: any) {
      console.error('Failed to load admin orders', err);
      setError('Failed to fetch customer orders');
    } finally {
      setLoading(false);
    }
  }, [currentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusFilterChange = (status: string) => {
    if (status === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ status });
    }
  };

  const handleSelectStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrderStatusMap((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleUpdateStatus = async (orderId: number) => {
    const targetStatus = orderStatusMap[orderId];
    if (!targetStatus) return;

    try {
      setUpdatingId(orderId);
      setError(null);
      setSuccessMsg(null);
      await adminService.updateOrderStatus(orderId, targetStatus);
      setSuccessMsg(`Order #${orderId} status updated to ${targetStatus}`);
      await fetchOrders();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

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
    <div className="container" data-testid="admin-orders-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Order Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor customer orders, review payment methods, and update shipment statuses</p>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-control"
            value={currentFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
            data-testid="admin-orders-filter-select"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMsg && <Alert type="success" message={successMsg} testId="admin-order-alert-success" onClose={() => setSuccessMsg(null)} />}
      {error && <Alert type="danger" message={error} testId="admin-order-alert-error" onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Loading customer orders..." />
      ) : orders.length === 0 ? (
        <div className="empty-state" data-testid="admin-orders-empty-state">
          <Clock className="empty-state-icon" />
          <h2 className="empty-state-title">No Orders Found</h2>
          <p className="empty-state-text">
            No orders match the selected filter ({currentFilter}).
          </p>
          <button
            type="button"
            onClick={() => handleStatusFilterChange('ALL')}
            className="btn btn-secondary btn-sm"
          >
            Show All Orders
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <span>Orders List ({orders.length})</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Filter: <strong>{currentFilter}</strong>
            </span>
          </div>

          <div className="table-responsive">
            <table className="table" data-testid="admin-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Current Status</th>
                  <th>Update Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const currentSelectedStatus = orderStatusMap[order.id] || order.status;
                  const hasChanged = currentSelectedStatus !== order.status;

                  return (
                    <tr key={order.id} data-testid="admin-order-row" data-order-id={order.id}>
                      <td data-testid="admin-order-id">
                        <strong>#{order.id}</strong>
                      </td>
                      <td data-testid="admin-order-customer">
                        <div style={{ fontWeight: 600 }}>{order.user?.name || order.shippingName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.items?.length || 0}</td>
                      <td style={{ fontWeight: 700 }} data-testid="admin-order-total">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td data-testid="admin-order-status">
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <select
                            className="form-control"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
                            value={currentSelectedStatus}
                            onChange={(e) => handleSelectStatus(order.id, e.target.value as OrderStatus)}
                            data-testid="admin-order-status-select"
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          {hasChanged && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id)}
                              disabled={updatingId === order.id}
                              className="btn btn-primary btn-sm"
                              data-testid="admin-order-update-submit"
                              title="Save status change"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="btn btn-outline btn-sm"
                          data-testid="admin-order-view-btn"
                        >
                          <Eye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

