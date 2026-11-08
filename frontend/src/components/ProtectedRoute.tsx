import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'CUSTOMER' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }} data-testid="forbidden-error">
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>403 - Access Forbidden</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You do not have the required <strong>{requiredRole}</strong> privileges to view this page.
          </p>
          <Link to="/" className="btn btn-primary" data-testid="forbidden-home-btn">
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

