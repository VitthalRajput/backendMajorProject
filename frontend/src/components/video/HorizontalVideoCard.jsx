import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import formatViews from '../../utils/formatViews.js';
import formatDuration from '../../utils/formatDuration.js';
import relativeTime from '../../utils/relativeTime.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export const HorizontalVideoCard = ({ video, className = '' }) => {
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

  const handleCardClick = () => {
    navigate(`/watch/${_id}`);
  };

  return (
    <div
      className={`horizontal-video-card ${className}`}
      onClick={handleCardClick}
      style={{
        display: 'flex',
        gap: '12px',
        cursor: 'pointer',
        width: '100%',
        padding: '6px',
        borderRadius: 'var(--radius-md)',
        transition: 'background-color var(--transition-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Compact Thumbnail (16:9) */}
      <div
        style={{
          position: 'relative',
          width: '168px',
          minWidth: '168px',
          height: '94px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: 'var(--surface-card)',
        }}
      >
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {duration !== undefined && duration !== null && (
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 5px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Meta Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <h4
          style={{
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: '1.3',
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={title}
        >
          {title}
        </h4>

        <Link
          to={`/c/${ownerUsername}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {ownerFullName || ownerUsername}
        </Link>

        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: 'auto',
          }}
        >
          <span>{formatViews(views)} views</span>
          <span>•</span>
          <span>{relativeTime(createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default HorizontalVideoCard;
