import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/Alert';

export const AdminLogin: React.FC = () => {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@shopease.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both admin email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid administrator credentials';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card" style={{ padding: '2rem', borderTop: '4px solid var(--primary)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Admin Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Restricted management area for ShopEase catalog and orders
            </p>
          </div>

          {error && <Alert type="danger" message={error} testId="admin-login-error" onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} data-testid="admin-login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                data-testid="login-email"
                className="form-control"
                placeholder="admin@shopease.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                data-testid="login-password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block"
              style={{ marginTop: '0.75rem' }}
              data-testid="login-submit"
            >
              {isLoading ? 'Authenticating Admin...' : 'Access Admin Dashboard'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)' }}>
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

