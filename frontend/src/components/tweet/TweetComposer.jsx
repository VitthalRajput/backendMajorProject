import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const TweetComposer = ({ onSubmit, loading = false }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    onSubmit(content.trim());
    setContent('');
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        marginBottom: '24px',
      }}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update with your community..."
          rows={3}
          maxLength={300}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            lineHeight: 1.5,
            resize: 'none',
            padding: 0,
            marginBottom: '12px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <span style={{ fontSize: '12px', color: content.length > 280 ? 'var(--status-danger)' : 'var(--text-muted)' }}>
            {content.length} / 300
          </span>

          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '6px 16px', gap: '6px' }}
          >
            <Send size={14} />
            <span>{loading ? 'Posting...' : 'Post Tweet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TweetComposer;

