import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type?: 'danger' | 'success' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  testId?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'danger',
  message,
  onClose,
  testId = 'alert-banner',
}) => {
  if (!message) return null;

  const renderIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={18} />;
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`alert alert-${type}`} data-testid={testId} role="alert">
      <div style={{ flexShrink: 0 }}>{renderIcon()}</div>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
          data-testid={`${testId}-close`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

