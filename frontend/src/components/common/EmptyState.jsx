import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = '',
  actionLabel,
  onAction,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`empty-state ${className}`}
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
      {Icon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}
        >
          <Icon size={30} strokeWidth={1.5} />
        </div>
      )}
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
      {description && (
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            maxWidth: '420px',
            marginBottom: actionLabel ? '20px' : 0,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-primary"
          style={{ marginTop: '16px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
