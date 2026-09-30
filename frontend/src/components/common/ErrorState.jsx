import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading content. Please try again.',
  onRetry,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`error-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        color: 'var(--text-secondary)',
        minHeight: '260px',
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--status-danger)',
          marginBottom: '16px',
        }}
      >
        <AlertCircle size={32} />
      </div>
      <h3
        style={{
          color: 'var(--text-primary)',
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          maxWidth: '440px',
          marginBottom: onRetry ? '20px' : 0,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
