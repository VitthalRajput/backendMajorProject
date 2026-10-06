import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import formatViews from '../../utils/formatViews.js';
import formatDuration from '../../utils/formatDuration.js';
import relativeTime from '../../utils/relativeTime.js';
import ChannelAvatar from '../common/ChannelAvatar.jsx';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export const VideoCard = ({ video, className = '' }) => {
  const navigate = useNavigate();

  if (!video) return null;

  const {
    _id,
    thumbnail,
    title,
    duration,
    views = 0,
    createdAt,
    owner = {},
  } = video;

  const ownerUsername = owner?.username || '';
  const ownerFullName = owner?.fullName || ownerUsername;
  const ownerAvatar = owner?.avatar;

  const handleCardClick = () => {
    navigate(`/watch/${_id}`);
  };

  return (
    <div
      className={`video-card ${className}`}
      onClick={handleCardClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        width: '100%',
        transition: 'transform var(--transition-fast)',
      }}
    >
      {/* Thumbnail Container (16:9) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 Aspect Ratio
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--surface-card)',
          marginBottom: '12px',
        }}
      >
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {/* Duration badge */}
        {duration !== undefined && duration !== null && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 6px',
              borderRadius: 'var(--radius-sm)',
              letterSpacing: '0.3px',
              pointerEvents: 'none',
            }}
          >
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Info Row: Avatar + Meta */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <ChannelAvatar
          avatar={ownerAvatar}
          username={ownerUsername}
          fullName={ownerFullName}
          size={36}
          linkToChannel={true}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Video Title */}
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '1.4',
              color: 'var(--text-primary)',
              margin: '0 0 4px 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
            title={title}
          >
            {title}
          </h3>

          {/* Channel Name */}
          <Link
            to={`/c/${ownerUsername}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              marginBottom: '2px',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            {ownerFullName || ownerUsername}
          </Link>

          {/* Views & Relative Date */}
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{formatViews(views)} views</span>
            <span>•</span>
            <span>{relativeTime(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

