import React from 'react';
import formatViews from '../../utils/formatViews.js';

export const MetricCard = ({
  icon: Icon,
  title,
  value = 0,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`metric-card ${className}`}
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        ...style,
      }}
    >
      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)',
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </div>
      )}

      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>
          {title}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {formatViews(value)}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
