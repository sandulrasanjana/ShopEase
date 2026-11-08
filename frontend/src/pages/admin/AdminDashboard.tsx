import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle, Plus, ArrowRight, Eye } from 'lucide-react';
import { adminService, DashboardStats } from '../../services/adminService';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then(setStats)
      .catch((err) => {
        console.error('Failed to load dashboard stats', err);
        setError('Failed to fetch dashboard metrics');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating dashboard statistics..." />;
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
    <div className="container" data-testid="admin-dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Store performance, inventory monitoring, and fulfillment overview</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm" data-testid="admin-dashboard-add-product-btn">
            <Plus size={16} /> Add Product
          </Link>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm" data-testid="admin-dashboard-orders-btn">
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL REVENUE</span>
            <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.4rem', borderRadius: '6px' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)' }} data-testid="admin-stat-revenue">
            ${(stats?.totalRevenue || 0).toFixed(2)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Excludes cancelled orders</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ORDERS</span>
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.4rem', borderRadius: '6px' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }} data-testid="admin-stat-orders">
            {stats?.totalOrders || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all customer accounts</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PRODUCTS</span>
            <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.4rem', borderRadius: '6px' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }} data-testid="admin-stat-products">
            {stats?.totalProducts || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active in catalog</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>OUT OF STOCK</span>
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.4rem', borderRadius: '6px' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }} data-testid="admin-stat-out-of-stock">
            {stats?.outOfStockCount || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inventory requires restock</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUSTOMERS</span>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '0.4rem', borderRadius: '6px' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }} data-testid="admin-stat-customers">
            {stats?.totalCustomers || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered accounts</span>
        </div>
      </div>

      {/* Orders Breakdown Status Chips */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Order Fulfillment Pipeline</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(stats?.ordersByStatus || {}).map(([st, count]) => (
            <Link
              key={st}
              to={`/admin/orders?status=${st}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
              data-testid={`admin-status-pill-${st.toLowerCase()}`}
            >
              <span className={`status-badge ${getStatusBadgeClass(st)}`}>{st}</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{count}</strong>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div className="card-header">
          <span>Recent Customer Orders</span>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table" data-testid="admin-recent-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((ro) => (
                <tr key={ro.id} data-testid="admin-recent-order-row">
                  <td>
                    <strong>#{ro.id}</strong>
                  </td>
                  <td>{ro.customerName}</td>
                  <td>{new Date(ro.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>${ro.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(ro.status)}`}>{ro.status}</span>
                  </td>
                  <td>
                    <Link to={`/admin/orders/${ro.id}`} className="btn btn-outline btn-sm" data-testid={`admin-view-order-${ro.id}`}>
                      <Eye size={14} /> Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

