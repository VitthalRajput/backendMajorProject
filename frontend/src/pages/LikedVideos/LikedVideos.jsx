import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import likesApi from '../../api/likes.api.js';
import VideoGrid from '../../components/video/VideoGrid.jsx';

export const LikedVideos = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasPromptedAuth = useRef(false);

  const fetchLikedVideos = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const data = await likesApi.getLikedVideos();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load liked videos:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch liked videos');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (!hasPromptedAuth.current) {
        hasPromptedAuth.current = true;
        openAuthModal('login');
      }
    } else {
      fetchLikedVideos();
    }
  }, [isAuthenticated, fetchLikedVideos, openAuthModal]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Sign In to See Liked Videos
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Keep track of all the videos you've liked by signing into your account.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="btn-primary"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: '1800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)',
          }}
        >
          <Heart size={20} fill="currentColor" />
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Liked Videos
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>
      </div>

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        onRetry={fetchLikedVideos}
        emptyTitle="No liked videos yet"
        emptyDescription="Videos you like on StreamCore will appear here."
      />
    </div>
  );
};

export default LikedVideos;

