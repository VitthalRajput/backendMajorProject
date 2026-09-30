import React from 'react';
import StudioVideoRow from './StudioVideoRow.jsx';
import Skeleton from '../common/Skeleton.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { Film } from 'lucide-react';

export const StudioVideoTable = ({
  videos = [],
  loading = false,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <th style={{ padding: '12px 16px' }}>Video</th>
              <th style={{ padding: '12px 16px' }}>Visibility</th>
              <th style={{ padding: '12px 16px' }}>Upload Date</th>
              <th style={{ padding: '12px 16px' }}>Views</th>
              <th style={{ padding: '12px 16px' }}>Comments</th>
              <th style={{ padding: '12px 16px' }}>Likes</th>
              <th style={{ padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Skeleton width="100px" height="56px" borderRadius="var(--radius-sm)" />
                    <Skeleton width="140px" height="16px" />
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}><Skeleton width="90px" height="24px" borderRadius="var(--radius-pill)" /></td>
                <td style={{ padding: '14px 16px' }}><Skeleton width="80px" height="14px" /></td>
                <td style={{ padding: '14px 16px' }}><Skeleton width="50px" height="14px" /></td>
                <td style={{ padding: '14px 16px' }}><Skeleton width="50px" height="14px" /></td>
                <td style={{ padding: '14px 16px' }}><Skeleton width="50px" height="14px" /></td>
                <td style={{ padding: '14px 16px' }}><Skeleton width="60px" height="28px" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="No videos uploaded yet"
        description="Videos you publish will appear here with performance analytics."
      />
    );
  }

  return (
    <div className="table-responsive" style={{ backgroundColor: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--surface-card)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <th style={{ padding: '14px 16px' }}>Video</th>
            <th style={{ padding: '14px 16px' }}>Visibility</th>
            <th style={{ padding: '14px 16px' }}>Upload Date</th>
            <th style={{ padding: '14px 16px' }}>Views</th>
            <th style={{ padding: '14px 16px' }}>Comments</th>
            <th style={{ padding: '14px 16px' }}>Likes</th>
            <th style={{ padding: '14px 16px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => (
            <StudioVideoRow
              key={video._id}
              video={video}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudioVideoTable;
