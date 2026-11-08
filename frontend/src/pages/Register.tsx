import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    try {
      setIsLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage('Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '460px', width: '100%' }}>
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
              <UserPlus size={26} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Register for a new ShopEase customer shopping account
            </p>
          </div>

          {error && <Alert type="danger" message={error} testId="register-error" onClose={() => setError(null)} />}
          {successMessage && <Alert type="success" message={successMessage} testId="register-success" />}

          <form onSubmit={handleSubmit} data-testid="register-form">
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                data-testid="register-name"
                className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {fieldErrors.name && (
                <span className="form-error" data-testid="register-name-error">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email Address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                data-testid="register-email"
                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <span className="form-error" data-testid="register-email-error">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password (min 6 characters)
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                data-testid="register-password"
                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {fieldErrors.password && (
                <span className="form-error" data-testid="register-password-error">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                data-testid="register-confirm-password"
                className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <span className="form-error" data-testid="register-confirm-password-error">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block"
              style={{ marginTop: '0.75rem' }}
              data-testid="register-submit"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }} data-testid="register-login-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

