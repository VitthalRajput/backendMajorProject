import React, { useState, useEffect, useCallback, useRef } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import usersApi from '../../api/users.api.js';
import HorizontalVideoCard from '../../components/video/HorizontalVideoCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export const History = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasPromptedAuth = useRef(false);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const data = await usersApi.getWatchHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load watch history:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch watch history');
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
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory, openAuthModal]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Keep Track of What You Watch
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Watch history isn't viewable when signed out. Sign in to see your history.
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

  if (error) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <ErrorState message={error} onRetry={fetchHistory} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)',
          }}
        >
          <HistoryIcon size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Watch History
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {history.length} {history.length === 1 ? 'video' : 'videos'} watched
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px' }}>
              <Skeleton width="180px" height="100px" borderRadius="var(--radius-md)" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton variant="text" width="60%" height="16px" />
                <Skeleton variant="text" width="30%" height="14px" />
                <Skeleton variant="text" width="20%" height="12px" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="Your watch history is clean"
          description="Videos you watch will appear here so you can easily find them again."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((video) => (
            <HorizontalVideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
