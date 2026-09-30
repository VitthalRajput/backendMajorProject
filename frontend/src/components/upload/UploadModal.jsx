import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Video, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import videosApi from '../../api/videos.api.js';

export const UploadModal = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Upload state
  const [status, setStatus] = useState('ready'); // 'ready' | 'uploading' | 'success' | 'error'
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Drag states
  const [isVideoDragOver, setIsVideoDragOver] = useState(false);
  const [isThumbDragOver, setIsThumbDragOver] = useState(false);

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && status !== 'uploading') {
        handleModalClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, status]);

  const resetForm = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
    setTitle('');
    setDescription('');
    setStatus('ready');
    setProgress(0);
    setErrorMessage('');
  };

  const handleModalClose = () => {
    if (status === 'uploading') return;
    resetForm();
    onClose();
  };

  const handleVideoSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      // Auto populate title from file name without extension if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(cleanName);
      }
    } else {
      setErrorMessage('Please select a valid video file (e.g. MP4, MOV, MKV, WebM)');
    }
  };

  const handleThumbnailSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setErrorMessage('Please select a valid image file for the thumbnail');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setErrorMessage('Video file is required');
      return;
    }
    if (!thumbnailFile) {
      setErrorMessage('Thumbnail image is required');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Description is required');
      return;
    }

    setErrorMessage('');
    setStatus('uploading');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnailFile);
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      const res = await videosApi.publishVideo(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      setStatus('success');
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(res);
        }
        handleModalClose();
      }, 1200);
    } catch (err) {
      console.error('Video upload error:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.message || err.message || 'Upload failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleModalClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '820px',
          padding: '24px',
          backgroundColor: 'var(--surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Upload Video
          </h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleModalClose}
            disabled={status === 'uploading'}
            style={{ padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: 'var(--status-danger)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {status === 'success' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: 'var(--status-success)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <CheckCircle size={18} />
            <span>Video published successfully!</span>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* LEFT COLUMN: Dropzones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Video dropzone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Video File *
                </label>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsVideoDragOver(true); }}
                  onDragLeave={() => setIsVideoDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsVideoDragOver(false);
                    handleVideoSelect(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    border: `2px dashed ${isVideoDragOver ? 'var(--brand-primary)' : videoFile ? 'var(--status-success)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px 16px',
                    textAlign: 'center',
                    backgroundColor: isVideoDragOver ? 'var(--surface-hover)' : 'var(--surface-card)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoSelect(e.target.files?.[0])}
                    style={{ display: 'none' }}
                  />
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--surface-raised)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px',
                      color: videoFile ? 'var(--status-success)' : 'var(--brand-primary)',
                    }}
                  >
                    <Video size={22} />
                  </div>
                  {videoFile ? (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        {videoFile.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Click to replace
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Select or drag & drop video
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        MP4, WebM, MKV, MOV
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail dropzone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Thumbnail Image *
                </label>
                <div
                  onClick={() => thumbInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsThumbDragOver(true); }}
                  onDragLeave={() => setIsThumbDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsThumbDragOver(false);
                    handleThumbnailSelect(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    border: `2px dashed ${isThumbDragOver ? 'var(--brand-primary)' : thumbnailFile ? 'var(--status-success)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: thumbnailPreview ? '8px' : '20px 16px',
                    textAlign: 'center',
                    backgroundColor: isThumbDragOver ? 'var(--surface-hover)' : 'var(--surface-card)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailSelect(e.target.files?.[0])}
                    style={{ display: 'none' }}
                  />

                  {thumbnailPreview ? (
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          opacity: 0,
                          transition: 'opacity var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                      >
                        Click to replace
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--surface-raised)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <ImageIcon size={20} />
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Select thumbnail image
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        16:9 ratio recommended (JPG, PNG, WebP)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your video a catchy title"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video..."
                  rows={6}
                  required
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              {/* Upload Progress Bar */}
              {status === 'uploading' && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Uploading video to Cloudinary...</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-card)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: 'var(--brand-primary)',
                        transition: 'width 200ms ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleModalClose}
                  disabled={status === 'uploading'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'uploading' || !videoFile || !thumbnailFile || !title.trim()}
                  style={{ minWidth: '130px' }}
                >
                  {status === 'uploading' ? `Publishing (${progress}%)` : 'Publish Video'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
