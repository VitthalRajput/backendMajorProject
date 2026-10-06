import React, { useState, useEffect, useCallback } from 'react';
import { Film, Eye, Users, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import dashboardApi from '../../api/dashboard.api.js';
import videosApi from '../../api/videos.api.js';
import MetricCard from '../../components/studio/MetricCard.jsx';
import StudioVideoTable from '../../components/studio/StudioVideoTable.jsx';
import EditVideoModal from '../../components/studio/EditVideoModal.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export const StudioDashboard = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalSubscribers: 0,
    totalLikes: 0,
  });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [editingVideo, setEditingVideo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const [statsRes, videosRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getVideos(),
      ]);

      setStats(statsRes || {
        totalVideos: 0,
        totalViews: 0,
        totalSubscribers: 0,
        totalLikes: 0,
      });

      setVideos(Array.isArray(videosRes) ? videosRes : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load studio analytics');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
    } else {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const handleEditClick = (video) => {
    setEditingVideo(video);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedVideo) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === updatedVideo._id ? { ...v, ...updatedVideo } : v))
    );
  };

  const handleDeleteVideo = async (videoId) => {
    await videosApi.deleteVideo(videoId);
    setVideos((prev) => prev.filter((v) => v._id !== videoId));
    setStats((prev) => ({
      ...prev,
      totalVideos: Math.max(0, prev.totalVideos - 1),
    }));
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Authentication Required
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Please sign in to access StreamCore Creator Studio.
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
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Studio Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Overview of your channel performance
        </p>
      </div>

      {/* Metrics Row */}
      <div className="studio-metrics-grid">
        <MetricCard
          icon={Film}
          title="Total Videos"
          value={stats.totalVideos}
        />
        <MetricCard
          icon={Eye}
          title="Total Views"
          value={stats.totalViews}
        />
        <MetricCard
          icon={Users}
          title="Total Subscribers"
          value={stats.totalSubscribers}
        />
        <MetricCard
          icon={ThumbsUp}
          title="Total Likes"
          value={stats.totalLikes}
        />
      </div>

      {/* Videos Table */}
      <div style={{ marginTop: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Channel Content
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {videos.length} {videos.length === 1 ? 'video' : 'videos'} uploaded
          </span>
        </div>

        <StudioVideoTable
          videos={videos}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteVideo}
        />
      </div>

      {/* Edit Video Modal */}
      <EditVideoModal
        isOpen={isEditModalOpen}
        video={editingVideo}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingVideo(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default StudioDashboard;

