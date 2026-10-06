import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Trash2, Edit3, Check, X, ListMusic } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import playlistsApi from '../../api/playlists.api.js';
import ImageWithFallback from '../../components/common/ImageWithFallback.jsx';
import ChannelAvatar from '../../components/common/ChannelAvatar.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import formatViews from '../../utils/formatViews.js';
import formatDuration from '../../utils/formatDuration.js';
import relativeTime from '../../utils/relativeTime.js';

export const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit playlist state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Removing video state
  const [videoToRemove, setVideoToRemove] = useState(null);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);

  const fetchPlaylist = useCallback(async () => {
    if (!playlistId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await playlistsApi.getPlaylistById(playlistId);
      setPlaylist(data);
      setEditName(data?.name || '');
      setEditDescription(data?.description || '');
    } catch (err) {
      console.error('Failed to load playlist:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const isOwner = Boolean(
    currentUser?._id &&
    playlist?.owner?._id &&
    String(currentUser._id) === String(playlist.owner._id)
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      const updated = await playlistsApi.updatePlaylist(playlistId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setPlaylist((prev) => ({
        ...prev,
        name: updated.name,
        description: updated.description,
      }));
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update playlist');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePlaylist = async () => {
    setIsDeleting(true);
    try {
      await playlistsApi.deletePlaylist(playlistId);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete playlist');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (!videoToRemove) return;
    setIsRemovingVideo(true);
    try {
      await playlistsApi.removeVideoFromPlaylist(videoToRemove._id, playlistId);
      setPlaylist((prev) => {
        if (!prev) return prev;
        const newVideos = prev.videos.filter((v) => v._id !== videoToRemove._id);
        return {
          ...prev,
          videos: newVideos,
          totalVideos: Math.max(0, (prev.totalVideos || 1) - 1),
        };
      });
      setVideoToRemove(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove video from playlist');
    } finally {
      setIsRemovingVideo(false);
    }
  };

  const handlePlayAll = () => {
    if (playlist?.videos?.length > 0) {
      navigate(`/watch/${playlist.videos[0]._id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '32px', padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ width: '360px', flexShrink: 0 }}>
          <Skeleton height="200px" borderRadius="12px" style={{ marginBottom: '16px' }} />
          <Skeleton height="28px" width="70%" style={{ marginBottom: '12px' }} />
          <Skeleton height="16px" width="50%" style={{ marginBottom: '8px' }} />
          <Skeleton height="16px" width="40%" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="88px" borderRadius="8px" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div style={{ padding: '64px 24px' }}>
        <ErrorState
          title="Playlist unavailable"
          message={error || 'Could not load playlist information'}
          onRetry={fetchPlaylist}
        />
      </div>
    );
  }

  const firstVideo = playlist.videos?.[0];
  const playlistThumbnail = firstVideo?.thumbnail || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '32px',
        padding: '32px 24px 64px',
        maxWidth: '1600px',
        margin: '0 auto',
        minHeight: 'calc(100vh - var(--topbar-height))',
      }}
      className="playlist-detail-page"
    >
      {/* Left Column: Playlist Card Hero */}
      <div
        style={{
          width: '360px',
          flexShrink: 0,
          backgroundColor: 'var(--surface-raised)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          border: '1px solid var(--border-subtle)',
          height: 'fit-content',
          position: 'sticky',
          top: 'calc(var(--topbar-height) + 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Playlist Cover Art */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--surface-card)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {playlistThumbnail ? (
            <ImageWithFallback
              src={playlistThumbnail}
              alt={playlist.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-muted)',
                gap: '8px',
              }}
            >
              <ListMusic size={40} />
              <span style={{ fontSize: '13px' }}>Empty Playlist</span>
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '6px 12px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ListMusic size={14} />
              <span>Playlist</span>
            </div>
            <span>{playlist.videos?.length || 0} videos</span>
          </div>
        </div>

        {/* Name and Description */}
        {isEditing ? (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Playlist Name
              </label>
              <input
                type="text"
                className="input-field"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Description
              </label>
              <textarea
                className="input-field"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsEditing(false)}
                disabled={isUpdating}
                style={{ padding: '6px 12px' }}
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUpdating}
                style={{ padding: '6px 16px' }}
              >
                <Check size={16} /> {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {playlist.name}
              </h1>
              {isOwner && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIsEditing(true)}
                  title="Edit title & description"
                  style={{ padding: '4px', flexShrink: 0 }}
                >
                  <Edit3 size={16} />
                </button>
              )}
            </div>

            {playlist.description && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {playlist.description}
              </p>
            )}
          </div>
        )}

        {/* Creator Info */}
        {playlist.owner && (
          <Link
            to={`/c/${playlist.owner.username}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              padding: '8px 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <ChannelAvatar
              avatarUrl={playlist.owner.avatar}
              username={playlist.owner.username}
              size={36}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {playlist.owner.fullName || playlist.owner.username}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                @{playlist.owner.username}
              </div>
            </div>
          </Link>
        )}

        {/* Stats */}
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>{playlist.videos?.length || 0} videos • {formatViews(playlist.totalViews || 0)} views</div>
          <div>Updated {relativeTime(playlist.updatedAt || playlist.createdAt)}</div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handlePlayAll}
            disabled={!playlist.videos?.length}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px 16px',
              opacity: !playlist.videos?.length ? 0.5 : 1,
            }}
          >
            <Play size={18} fill="currentColor" /> Play All
          </button>

          {isOwner && (
            <button
              type="button"
              className="btn-danger"
              onClick={() => setShowDeleteModal(true)}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '8px 16px',
                fontSize: '13px',
              }}
            >
              <Trash2 size={16} /> Delete Playlist
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Playlist Video List */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!playlist.videos || playlist.videos.length === 0 ? (
          <div
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <ListMusic size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No videos in this playlist yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Save videos to this playlist while watching or exploring to build your collection.
            </p>
            <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              Explore Videos
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playlist.videos.map((vid, index) => (
              <div
                key={vid._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Index Number */}
                <div
                  style={{
                    width: '24px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>

                {/* Video Card Clickable row */}
                <div
                  onClick={() => navigate(`/watch/${vid._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    flex: 1,
                    minWidth: 0,
                    cursor: 'pointer',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      position: 'relative',
                      width: '140px',
                      height: '79px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: 'var(--surface-card)',
                    }}
                  >
                    <ImageWithFallback
                      src={vid.thumbnail}
                      alt={vid.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {vid.duration !== undefined && vid.duration !== null && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(0, 0, 0, 0.85)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 4px',
                          borderRadius: '2px',
                        }}
                      >
                        {formatDuration(vid.duration)}
                      </span>
                    )}
                  </div>

                  {/* Title & Stats */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {vid.title}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>{formatViews(vid.views || 0)} views</span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span>{relativeTime(vid.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Remove action for owner */}
                {isOwner && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setVideoToRemove(vid)}
                    title="Remove from playlist"
                    style={{
                      padding: '8px',
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Entire Playlist Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Playlist?"
        message={`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`}
        confirmText="Delete Playlist"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeletePlaylist}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Remove Video From Playlist Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(videoToRemove)}
        title="Remove Video?"
        message={`Remove "${videoToRemove?.title}" from this playlist?`}
        confirmText="Remove"
        isDestructive={true}
        isLoading={isRemovingVideo}
        onConfirm={handleRemoveVideo}
        onCancel={() => setVideoToRemove(null)}
      />
    </div>
  );
};

export default PlaylistDetail;
