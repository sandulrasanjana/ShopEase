import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const spinnerSizeClass = size === 'sm' ? { width: '1.25rem', height: '1.25rem', borderWidth: '2px' } : size === 'lg' ? { width: '3rem', height: '3rem', borderWidth: '4px' } : {};

  return (
    <div className="loading-container" data-testid="loading-spinner">
      <div className="spinner" style={spinnerSizeClass}></div>
      {message && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{message}</p>}
    </div>
  );
};

