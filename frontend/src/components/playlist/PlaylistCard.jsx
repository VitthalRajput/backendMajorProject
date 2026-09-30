import React from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Play } from 'lucide-react';
import formatViews from '../../utils/formatViews.js';

export const PlaylistCard = ({ playlist, className = '' }) => {
  if (!playlist) return null;

  const {
    _id,
    name,
    description,
    totalVideos = 0,
    totalViews = 0,
  } = playlist;

  return (
    <Link
      to={`/playlist/${_id}`}
      className={`playlist-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--border-medium)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      {/* Thumbnail / Header Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%',
          backgroundColor: 'var(--surface-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <ListVideo size={44} strokeWidth={1.5} />
        </div>

        {/* Video count badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Play size={12} fill="currentColor" />
          <span>{totalVideos} {totalVideos === 1 ? 'video' : 'videos'}</span>
        </div>
      </div>

      {/* Info Area */}
      <div style={{ padding: '14px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 6px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={name}
        >
          {name}
        </h3>

        {description && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              margin: '0 0 8px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </p>
        )}

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {formatViews(totalViews)} total views
        </div>
      </div>
    </Link>
  );
};

export default PlaylistCard;
