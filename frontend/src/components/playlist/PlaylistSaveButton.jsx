import React, { useState, useEffect, useCallback } from 'react';
import { ListPlus, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import playlistsApi from '../../api/playlists.api.js';

export const PlaylistSaveButton = ({ videoId, className = '', style = {} }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // New playlist creation form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const loadPlaylists = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const data = await playlistsApi.getUserPlaylists(user._id);
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load user playlists:', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isOpen && user?._id) {
      loadPlaylists();
    }
  }, [isOpen, user?._id, loadPlaylists]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login', () => setIsOpen(true));
      return;
    }
    setIsOpen(true);
  };

  const handleToggleVideo = async (playlist) => {
    if (!videoId || !playlist?._id || actionLoading) return;
    setActionLoading(playlist._id);

    try {
      // Check if video is already in playlist
      const fullPlaylist = await playlistsApi.getPlaylistById(playlist._id);
      const isAlreadyIn = fullPlaylist?.videos?.some((v) => (v._id || v) === videoId);

      if (isAlreadyIn) {
        await playlistsApi.removeVideoFromPlaylist(videoId, playlist._id);
      } else {
        await playlistsApi.addVideoToPlaylist(videoId, playlist._id);
      }
      await loadPlaylists();
    } catch (err) {
      console.error('Failed to toggle playlist video:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreateLoading(true);

    try {
      const newPlaylist = await playlistsApi.createPlaylist({
        name: name.trim(),
        description: description.trim() || 'My playlist',
      });
      if (newPlaylist?._id && videoId) {
        await playlistsApi.addVideoToPlaylist(videoId, newPlaylist._id);
      }
      setName('');
      setDescription('');
      setShowCreate(false);
      await loadPlaylists();
    } catch (err) {
      console.error('Failed to create playlist:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`btn-secondary ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          fontSize: '14px',
          color: 'var(--text-primary)',
          ...style,
        }}
        aria-label="Save to playlist"
      >
        <ListPlus size={18} />
        <span>Save</span>
      </button>

      {/* Save to Playlist Modal */}
      {isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '380px',
              padding: '20px',
              backgroundColor: 'var(--surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Save video to...
              </h3>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsOpen(false)}
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading playlists...
              </div>
            ) : playlists.length === 0 && !showCreate ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                You don't have any playlists yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                {playlists.map((pl) => (
                  <button
                    key={pl._id}
                    type="button"
                    onClick={() => handleToggleVideo(pl)}
                    disabled={actionLoading === pl._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-card)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      fontSize: '14px',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <span>{pl.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {actionLoading === pl._id ? 'Updating...' : `${pl.totalVideos || 0} videos`}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Create Playlist Section */}
            {!showCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="btn-ghost"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  padding: '10px',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <Plus size={16} />
                Create new playlist
              </button>
            ) : (
              <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Playlist name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  style={{ width: '100%' }}
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setShowCreate(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createLoading || !name.trim()}
                    style={{ padding: '6px 14px', fontSize: '13px' }}
                  >
                    {createLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PlaylistSaveButton;
