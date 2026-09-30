import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import formatDate from '../../utils/formatDate.js';
import formatViews from '../../utils/formatViews.js';
import PublishToggle from './PublishToggle.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export const StudioVideoRow = ({
  video,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!video) return null;

  const {
    _id,
    thumbnail,
    title,
    isPublished = true,
    createdAt,
    views = 0,
    commentsCount = 0,
    likesCount = 0,
  } = video;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(_id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete video:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <tr
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background-color var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {/* Video: Thumbnail + Title */}
        <td style={{ padding: '14px 16px', minWidth: '260px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              to={`/watch/${_id}`}
              style={{
                width: '100px',
                minWidth: '100px',
                height: '56px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                backgroundColor: 'var(--surface-card)',
                display: 'block',
              }}
            >
              <ImageWithFallback
                src={thumbnail}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Link>
            <Link
              to={`/watch/${_id}`}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={title}
            >
              {title}
            </Link>
          </div>
        </td>

        {/* Visibility */}
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
          <PublishToggle
            videoId={_id}
            initialPublished={isPublished}
          />
        </td>

        {/* Upload Date */}
        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {formatDate(createdAt)}
        </td>

        {/* Views */}
        <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          {formatViews(views)}
        </td>

        {/* Comments */}
        <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          {formatViews(commentsCount)}
        </td>

        {/* Likes */}
        <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          {formatViews(likesCount)}
        </td>

        {/* Actions */}
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onEdit(video)}
              title="Edit video"
              style={{ padding: '6px', color: 'var(--text-secondary)' }}
            >
              <Edit2 size={16} />
            </button>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete video"
              style={{ padding: '6px', color: 'var(--status-danger)' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete video?"
        message="This action cannot be undone. All views, comments, and likes associated with this video will be permanently removed."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default StudioVideoRow;
