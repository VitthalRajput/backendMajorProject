import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import relativeTime from '../../utils/relativeTime.js';
import ChannelAvatar from '../common/ChannelAvatar.jsx';
import LikeButton from '../common/LikeButton.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

export const TweetCard = ({
  tweet,
  onUpdate,
  onDelete,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    _id,
    content,
    createdAt,
    likesCount = 0,
    isLiked = false,
    owner = {},
  } = tweet;

  const ownerUsername = owner?.username || '';
  const ownerFullName = owner?.fullName || ownerUsername;
  const ownerAvatar = owner?.avatar;

  const isOwner =
    user &&
    ((user.username && user.username.toLowerCase() === ownerUsername.toLowerCase()) ||
      (user._id && (user._id === owner || user._id === owner?._id)));

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdate(_id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update tweet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(_id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete tweet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      {/* Top Header: Avatar + User Info + Menu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChannelAvatar
            avatar={ownerAvatar}
            username={ownerUsername}
            fullName={ownerFullName}
            size={40}
            linkToChannel={true}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {ownerFullName}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                @{ownerUsername}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {relativeTime(createdAt)}
            </div>
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && !isEditing && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ padding: '6px' }}
              aria-label="Tweet options"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '28px',
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 20,
                  minWidth: '120px',
                  padding: '4px 0',
                }}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: 'var(--status-danger)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content or Edit form */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} style={{ marginTop: '8px' }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            maxLength={300}
            required
            autoFocus
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-medium)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              resize: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setEditContent(content);
                setIsEditing(false);
              }}
              disabled={isSubmitting}
              style={{ fontSize: '13px', padding: '4px 12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!editContent.trim() || isSubmitting}
              style={{ fontSize: '13px', padding: '4px 14px' }}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            marginBottom: '14px',
          }}
        >
          {content}
        </p>
      )}

      {/* Action Row */}
      {!isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <LikeButton
            tweetId={_id}
            initialLiked={isLiked}
            initialCount={likesCount}
            size="sm"
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete tweet?"
        message="Are you sure you want to delete this tweet? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default TweetCard;
