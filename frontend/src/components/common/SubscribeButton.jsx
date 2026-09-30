import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import subscriptionsApi from '../../api/subscriptions.api.js';

export const SubscribeButton = ({
  channelId,
  initialSubscribed = false,
  onToggle,
  className = '',
  style = {},
}) => {
  const { user, openAuthModal } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  // If user is viewing their own channel, don't show subscribe button
  const isOwnChannel = user?._id && (user._id === channelId || user.id === channelId);
  if (isOwnChannel) {
    return null;
  }

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal('login', () => {
        // Callback after login
      });
      return;
    }

    if (!channelId || loading) return;

    const previousState = isSubscribed;
    // Optimistic update
    setIsSubscribed(!previousState);
    setLoading(true);

    try {
      const res = await subscriptionsApi.toggleSubscription(channelId);
      // Backend returns { subscribed: boolean }
      const newSubscribed = res?.subscribed ?? !previousState;
      setIsSubscribed(newSubscribed);
      if (onToggle) {
        onToggle(newSubscribed);
      }
    } catch (err) {
      // Rollback on error
      setIsSubscribed(previousState);
      console.error('Failed to toggle subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`subscribe-btn ${isSubscribed ? 'btn-secondary' : 'btn-primary'} ${className}`}
      style={{
        padding: '8px 18px',
        fontSize: '14px',
        fontWeight: 600,
        borderRadius: 'var(--radius-pill)',
        transition: 'all var(--transition-fast)',
        backgroundColor: isSubscribed ? 'var(--surface-card)' : 'var(--brand-primary)',
        color: isSubscribed ? 'var(--text-secondary)' : '#FFFFFF',
        border: isSubscribed ? '1px solid var(--border-subtle)' : 'none',
        ...style,
      }}
      aria-label={isSubscribed ? 'Unsubscribe from channel' : 'Subscribe to channel'}
    >
      {isSubscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  );
};

export default SubscribeButton;
