import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import videosApi from '../../api/videos.api.js';
import VideoGrid from '../../components/video/VideoGrid.jsx';

export const Home = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await videosApi.getAllVideos({
        query: searchQuery || undefined,
        limit: 24,
      });
      // aggregatePaginate returns { docs: [...] }
      const videoList = data?.docs || (Array.isArray(data) ? data : []);
      setVideos(videoList);
    } catch (err) {
      console.error('Failed to load videos:', err);
      // If 401, inform user that backend requires sign in
      if (err.response?.status === 401) {
        setError('Please sign in to view and explore videos on StreamCore.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch videos');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Listen for videoUploaded global event
  useEffect(() => {
    const handleVideoUploaded = () => {
      fetchVideos();
    };
    window.addEventListener('videoUploaded', handleVideoUploaded);
    return () => window.removeEventListener('videoUploaded', handleVideoUploaded);
  }, [fetchVideos]);

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: '1800px', margin: '0 auto' }}>
      {searchQuery && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Search results for: <span style={{ color: 'var(--brand-primary)' }}>"{searchQuery}"</span>
          </h2>
        </div>
      )}

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        onRetry={fetchVideos}
        emptyTitle={searchQuery ? 'No matching videos found' : 'No videos yet'}
        emptyDescription={
          searchQuery
            ? 'Try different keywords or check for spelling errors.'
            : 'Be the first creator to upload a video on StreamCore!'
        }
      />
    </div>
  );
};

export default Home;
