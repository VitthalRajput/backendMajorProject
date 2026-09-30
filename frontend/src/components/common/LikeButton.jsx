import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import likesApi from '../../api/likes.api.js';
import formatViews from '../../utils/formatViews.js';

export const LikeButton = ({
  videoId,
  commentId,
  tweetId,
  initialLiked = false,
  initialCount = 0,
  onToggle,
  size = 'md',
  className = '',
  style = {},
}) => {
  const { user, openAuthModal } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(Number(initialCount) || 0);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (loading) return;

    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic UI update
    const nextLiked = !previousLiked;
    setIsLiked(nextLiked);
    setLikesCount(Math.max(0, previousCount + (nextLiked ? 1 : -1)));
    setLoading(true);

    try {
      let res;
      if (videoId) {
        res = await likesApi.toggleVideoLike(videoId);
      } else if (commentId) {
        res = await likesApi.toggleCommentLike(commentId);
      } else if (tweetId) {
        res = await likesApi.toggleTweetLike(tweetId);
      }

      const backendLiked = res?.liked ?? nextLiked;
      setIsLiked(backendLiked);
      if (onToggle) {
        onToggle(backendLiked);
      }
    } catch (err) {
      // Rollback
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      console.error('Failed to toggle like:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`like-button ${isLiked ? 'liked' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '4px 8px' : '8px 14px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: isLiked ? 'var(--brand-muted)' : 'var(--surface-card)',
        color: isLiked ? 'var(--brand-primary)' : 'var(--text-primary)',
        border: `1px solid ${isLiked ? 'rgba(255, 0, 51, 0.4)' : 'var(--border-subtle)'}`,
        fontSize: isSmall ? '12px' : '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        ...style,
      }}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <ThumbsUp
        size={isSmall ? 14 : 18}
        fill={isLiked ? 'currentColor' : 'none'}
        strokeWidth={1.75}
      />
      <span>{likesCount > 0 ? formatViews(likesCount) : 'Like'}</span>
    </button>
  );
};

export default LikeButton;
