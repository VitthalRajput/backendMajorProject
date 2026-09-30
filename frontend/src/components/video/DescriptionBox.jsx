import React, { useState } from 'react';
import formatDate from '../../utils/formatDate.js';

export const DescriptionBox = ({
  views = 0,
  createdAt,
  description = '',
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);

  const isLongDescription = description && description.length > 200;

  return (
    <div
      className={`description-box ${className}`}
      onClick={() => {
        if (!expanded && isLongDescription) {
          setExpanded(true);
        }
      }}
      style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        marginTop: '16px',
        cursor: !expanded && isLongDescription ? 'pointer' : 'default',
        transition: 'background-color var(--transition-fast)',
      }}
    >
      {/* Top Meta info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        <span>{Number(views).toLocaleString()} views</span>
        <span>{formatDate(createdAt)}</span>
      </div>

      {/* Description text */}
      <div
        style={{
          color: 'var(--text-primary)',
          fontSize: '14px',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          display: expanded || !isLongDescription ? 'block' : '-webkit-box',
          WebkitLineClamp: expanded || !isLongDescription ? 'unset' : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description || 'No description provided.'}
      </div>

      {/* Toggle button */}
      {isLongDescription && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          style={{
            marginTop: '8px',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '13px',
            padding: '2px 0',
          }}
        >
          {expanded ? 'Show less' : '...more'}
        </button>
      )}
    </div>
  );
};

export default DescriptionBox;
