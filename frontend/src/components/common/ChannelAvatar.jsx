import React from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback.jsx';

const SIZES = {
  xs: 24,
  sm: 32,
  md: 36,
  lg: 48,
  xl: 80,
  xxl: 120,
};

export const ChannelAvatar = ({
  avatar,
  username = '',
  fullName = '',
  size = 'md',
  linkToChannel = false,
  className = '',
  style = {},
}) => {
  const pixelSize = typeof size === 'number' ? size : (SIZES[size] || 36);

  const initials = (fullName || username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarContent = (
    <div
      className={`channel-avatar ${className}`}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        minWidth: `${pixelSize}px`,
        minHeight: `${pixelSize}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: `${Math.max(11, Math.round(pixelSize * 0.38))}px`,
        color: 'var(--text-primary)',
        userSelect: 'none',
        border: '1px solid var(--border-subtle)',
        ...style,
      }}
    >
      <ImageWithFallback
        src={avatar}
        alt={username || fullName || 'Channel avatar'}
        fallbackContent={<span>{initials}</span>}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );

  if (linkToChannel && username) {
    return (
      <Link
        to={`/c/${username}`}
        style={{ display: 'inline-flex', textDecoration: 'none' }}
        onClick={(e) => e.stopPropagation()}
        title={username}
      >
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
};

export default ChannelAvatar;
