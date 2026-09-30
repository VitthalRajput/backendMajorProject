import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Trash2, ListVideo } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import playlistsApi from '../../api/playlists.api.js';
import HorizontalVideoCard from '../../components/video/HorizontalVideoCard.jsx';
import ChannelAvatar from '../../components/common/ChannelAvatar.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import formatViews from '../../utils/formatViews.js';
import formatDate from '../../utils/formatDate.js';

export const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPlaylist = useCallback(async () => {
    if (!playlistId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await playlistsApi.getPlaylistById(playlistId);
      setPlaylist(data);
    } catch (err) {
      console.error('Failed to load playlist:', err);
      setError(err.response?.data?.message || err.message || 'Playlist not found');
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const isOwner = user && playlist && (user._id === playlist.owner?._id || user._id === playlist.owner);

  const handleDeletePlaylist = async () => {
    setDeleting(true);
    try {
      await playlistsApi.deletePlaylist(playlistId);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await playlistsApi.removeVideoFromPlaylist(videoId, playlistId);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => (v._id || v) !== videoId),
        totalVideos: Math.max(0, (prev.totalVideos || 1) - 1),
      }));
    } catch (err) {
      console.error('Failed to remove video from playlist:', err);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <ErrorState message={error} onRetry={fetchPlaylist} />
      </div>
    );
  }

  const videos = playlist?.videos || [];
  const firstVideo = videos[0];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '28px 32px 60px' }}>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px' }}>
          <Skeleton height="380px" borderRadius="var(--radius-lg)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="88px" borderRadius="var(--radius-md)" />
            ))}
          </div>
        </div>
      ) : playlist ? (
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 1024 ? '360px 1fr' : '1fr', gap: '32px' }}>
          {/* Left: Playlist Overview Box */}
          <div
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              height: 'fit-content',
            }}
          >
            {/* Header / Thumbnail */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              {firstVideo?.thumbnail ? (
                <img
                  src={firstVideo.thumbnail}
                  alt={playlist.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <ListVideo size={48} />
                </div>
              )}
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {playlist.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ChannelAvatar
                avatar={playlist.owner?.avatar}
                username={playlist.owner?.username}
                fullName={playlist.owner?.fullName}
                size={26}
                linkToChannel={true}
              />
              <Link
                to={`/c/${playlist.owner?.username}`}
                style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
              >
                {playlist.owner?.fullName || playlist.owner?.username}
              </Link>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              <span>{playlist.totalVideos || videos.length} videos • {formatViews(playlist.totalViews || 0)} views</span>
              <span>Updated {formatDate(playlist.updatedAt)}</span>
            </div>

            {playlist.description && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                {playlist.description}
              </p>
            )}

            {/* Play all button */}
            {firstVideo && (
              <Link
                to={`/watch/${firstVideo._id}`}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  justifyContent: 'center',
                  marginBottom: isOwner ? '10px' : 0,
                }}
              >
                <Play size={16} fill="currentColor" />
                <span>Play All</span>
              </Link>
            )}

            {/* Owner Delete Playlist */}
            {isOwner && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ width: '100%', padding: '10px', color: 'var(--status-danger)', justifyContent: 'center' }}
              >
                <Trash2 size={16} />
                <span>Delete Playlist</span>
              </button>
            )}
          </div>

          {/* Right: Videos List */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Playlist Videos ({videos.length})
            </h2>

            {videos.length === 0 ? (
              <div style={{ padding: '32px 0', color: 'var(--text-muted)' }}>
                This playlist has no videos yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {videos.map((vid, idx) => (
                  <div
                    key={vid._id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'var(--surface-raised)',
                      borderRadius: 'var(--radius-md)',
                      padding: '6px 12px 6px 6px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', width: '20px', textAlign: 'center' }}>
                      {idx + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <HorizontalVideoCard video={vid} />
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleRemoveVideo(vid._id)}
                        title="Remove from playlist"
                        style={{ padding: '8px', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete playlist?"
        message="Are you sure you want to delete this playlist? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDeletePlaylist}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default PlaylistDetail;
