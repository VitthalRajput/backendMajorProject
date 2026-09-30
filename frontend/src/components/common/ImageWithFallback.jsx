import React, { useState } from 'react';

/**
 * Reusable image component that renders a fallback on error or if src is empty
 */
export const ImageWithFallback = ({
  src,
  alt = '',
  fallbackSrc,
  fallbackContent,
  className = '',
  style = {},
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    if (fallbackContent) {
      return (
        <div
          className={`image-fallback ${className}`}
          style={{
            backgroundColor: 'var(--surface-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            ...style,
          }}
          aria-label={alt}
        >
          {fallbackContent}
        </div>
      );
    }

    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          style={style}
          {...props}
        />
      );
    }

    // Default neutral dark placeholder
    return (
      <div
        className={`image-placeholder ${className}`}
        style={{
          backgroundColor: 'var(--surface-card)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
          ...style,
        }}
        aria-label={alt}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
};

export default ImageWithFallback;
