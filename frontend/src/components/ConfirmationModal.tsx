import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" data-testid="confirm-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            {isDanger && <AlertTriangle size={18} color="var(--danger)" />}
            <span data-testid="confirm-modal-title">{title}</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            data-testid="confirm-modal-close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }} data-testid="confirm-modal-message">
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary btn-sm"
            data-testid="confirm-modal-cancel-btn"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            data-testid="confirm-modal-confirm-btn"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

