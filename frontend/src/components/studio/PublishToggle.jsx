import React, { useState } from 'react';
import videosApi from '../../api/videos.api.js';

export const PublishToggle = ({
  videoId,
  initialPublished = true,
  onChange,
  className = '',
}) => {
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (loading || !videoId) return;

    const previousState = isPublished;
    const nextState = !previousState;

    // Optimistic UI update
    setIsPublished(nextState);
    setLoading(true);

    try {
      const res = await videosApi.togglePublishStatus(videoId);
      const serverState = res?.isPublished !== undefined ? res.isPublished : nextState;
      setIsPublished(serverState);
      if (onChange) {
        onChange(serverState);
      }
    } catch (err) {
      // Rollback
      setIsPublished(previousState);
      console.error('Failed to toggle publish status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`publish-toggle ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: isPublished ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
        color: isPublished ? 'var(--status-success)' : 'var(--text-secondary)',
        border: `1px solid ${isPublished ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-subtle)'}`,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
      aria-label={`Toggle visibility, currently ${isPublished ? 'Published' : 'Unpublished'}`}
      title="Click to toggle published status"
    >
      <div
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: isPublished ? 'var(--status-success)' : 'var(--text-muted)',
        }}
      />
      <span>{isPublished ? 'Published' : 'Unpublished'}</span>
    </button>
  );
};

export default PublishToggle;
