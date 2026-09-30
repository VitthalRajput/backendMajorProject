import React from 'react';

export const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  borderRadius,
  className = '',
  style = {},
  count = 1,
}) => {
  const getRadius = () => {
    if (borderRadius) return borderRadius;
    if (variant === 'circular') return '50%';
    if (variant === 'text') return '4px';
    return '8px';
  };

  const defaultHeight = () => {
    if (height) return height;
    if (variant === 'text') return '16px';
    if (variant === 'circular') return width || '40px';
    return '100px';
  };

  const defaultWidth = () => {
    if (width) return width;
    if (variant === 'circular') return defaultHeight();
    return '100%';
  };

  const skeletonElement = (index) => (
    <div
      key={index}
      className={`skeleton skeleton-${variant} ${className}`}
      style={{
        width: defaultWidth(),
        height: defaultHeight(),
        borderRadius: getRadius(),
        backgroundColor: 'var(--surface-raised)',
        backgroundImage: 'linear-gradient(90deg, var(--surface-raised) 0%, var(--surface-card) 50%, var(--surface-raised) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );

  if (count > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {Array.from({ length: count }).map((_, i) => skeletonElement(i))}
      </div>
    );
  }

  return skeletonElement(0);
};

// Keyframe pulse in global style or component
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-style';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      @keyframes skeletonPulse {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(styleEl);
  }
}

export default Skeleton;
