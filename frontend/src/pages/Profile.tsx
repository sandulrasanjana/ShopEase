import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Shield, Calendar, Package, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }} data-testid="profile-container">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>User Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and verify your registered ShopEase account credentials</p>
        </div>

        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.5rem',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }} data-testid="profile-name">
                {user?.name}
              </h2>
              <span className={`user-badge ${user?.role === 'ADMIN' ? 'admin' : 'customer'}`} data-testid="profile-role">
                {user?.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="var(--text-muted)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }} data-testid="profile-email">
                  {user?.email}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={18} color="var(--text-muted)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Account Role</span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {user?.role === 'ADMIN' ? 'Administrator (Full Access)' : 'Customer (Shopper)'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={18} color="var(--text-muted)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Member Since</span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }} data-testid="profile-created-at">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {user?.role === 'ADMIN' ? (
            <Link to="/admin/dashboard" className="btn btn-primary btn-sm" data-testid="profile-admin-dashboard-btn">
              Go to Admin Dashboard
            </Link>
          ) : (
            <Link to="/orders" className="btn btn-primary btn-sm" data-testid="profile-orders-btn">
              <Package size={16} /> View My Order History
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            data-testid="profile-logout-btn"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

