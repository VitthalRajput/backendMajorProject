import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import ChannelAvatar from '../common/ChannelAvatar.jsx';

export const CommentInput = ({ onSubmit, loading = false, placeholder = 'Add a comment...' }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!content.trim() || loading) return;

    onSubmit(content.trim());
    setContent('');
    setIsFocused(false);
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
  };

  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', width: '100%', marginBottom: '24px' }}>
      <ChannelAvatar
        avatar={user?.avatar}
        username={user?.username}
        fullName={user?.fullName}
        size={40}
      />

      <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: 0 }}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => {
            if (!isAuthenticated) {
              openAuthModal('login');
            } else {
              setIsFocused(true);
            }
          }}
          placeholder={placeholder}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${isFocused ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
            borderRadius: 0,
            padding: '8px 0',
            fontSize: '14px',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
          }}
        />

        {/* Buttons show when focused or typing */}
        {(isFocused || content.trim()) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleCancel}
              disabled={loading}
              style={{ fontSize: '13px', padding: '6px 14px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!content.trim() || loading}
              style={{ fontSize: '13px', padding: '6px 16px' }}
            >
              {loading ? 'Posting...' : 'Comment'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CommentInput;
