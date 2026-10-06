import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import relativeTime from '../../utils/relativeTime.js';
import ChannelAvatar from '../common/ChannelAvatar.jsx';
import LikeButton from '../common/LikeButton.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

export const CommentCard = ({
  comment,
  onUpdate,
  onDelete,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    _id,
    content,
    createdAt,
    likesCount = 0,
    isLiked = false,
    ownerDetails = {},
    owner,
  } = comment;

  const ownerUsername = ownerDetails?.username || owner?.username || '';
  const ownerAvatar = ownerDetails?.avatar || owner?.avatar;

  // Ownership rule: compare username or _id
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
      console.error('Failed to update comment:', err);
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
      console.error('Failed to delete comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', width: '100%', marginBottom: '18px' }}>
      <ChannelAvatar
        avatar={ownerAvatar}
        username={ownerUsername}
        size={36}
        linkToChannel={true}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Author & Timestamp Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              @{ownerUsername}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {relativeTime(createdAt)}
            </span>
          </div>

          {/* Owner options menu */}
          {isOwner && !isEditing && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ padding: '4px' }}
                aria-label="Comment options"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '24px',
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

        {/* Content or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} style={{ marginTop: '8px' }}>
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-medium)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
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
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!editContent.trim() || isSubmitting}
                style={{ fontSize: '12px', padding: '4px 12px' }}
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
              lineHeight: 1.45,
              wordBreak: 'break-word',
              margin: '0 0 8px 0',
            }}
          >
            {content}
          </p>
        )}

        {/* Action row (Like button) */}
        {!isEditing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LikeButton
              commentId={_id}
              initialLiked={isLiked}
              initialCount={likesCount}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete comment?"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default CommentCard;

