import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      
      // Determine destination
      const destination = (location.state as any)?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setFieldErrors({});
    setError(null);
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <LogIn size={26} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sign in to your ShopEase customer or admin account
            </p>
          </div>

          {error && <Alert type="danger" message={error} testId="login-error" onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} data-testid="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  data-testid="login-email"
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <span className="form-error" data-testid="login-email-error">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type="password"
                  data-testid="login-password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {fieldErrors.password && (
                <span className="form-error" data-testid="login-password-error">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block"
              style={{ marginTop: '0.5rem' }}
              data-testid="login-submit"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }} data-testid="login-register-link">
              Create an account
            </Link>
          </div>

          {/* QA Quick Test Helper */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              border: '1px dashed var(--border-color)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>
              <ShieldAlert size={14} />
              <span>QA Test Credentials Helper</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => quickFill('customer1@shopease.com', 'Customer@123')}
                className="btn btn-secondary btn-sm"
                data-testid="qa-fill-customer"
                style={{ fontSize: '0.75rem' }}
              >
                Customer 1
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@shopease.com', 'Admin@123')}
                className="btn btn-secondary btn-sm"
                data-testid="qa-fill-admin"
                style={{ fontSize: '0.75rem' }}
              >
                Admin User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

