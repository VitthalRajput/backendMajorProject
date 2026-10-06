import React from 'react';
import VideoCard from './VideoCard.jsx';
import Skeleton from '../common/Skeleton.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { Film } from 'lucide-react';

export const VideoGrid = ({
  videos = [],
  loading = false,
  error = null,
  onRetry,
  emptyTitle = 'No videos found',
  emptyDescription = 'Try adjusting your search or check back later for new content.',
  skeletonCount = 8,
  className = '',
}) => {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className={`video-grid ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 16:9 thumbnail skeleton */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                <Skeleton width="100%" height="100%" borderRadius="var(--radius-lg)" />
              </div>
            </div>
            {/* Info row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Skeleton variant="circular" width="36px" height="36px" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Skeleton variant="text" width="90%" height="14px" />
                <Skeleton variant="text" width="60%" height="12px" />
                <Skeleton variant="text" width="40%" height="12px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`video-grid ${className}`}>
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;

