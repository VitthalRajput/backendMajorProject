import apiClient from './axios.js';

export const videosApi = {
  /**
   * Get all published videos with optional filters and pagination
   * @param {{ page?: number, limit?: number, query?: string, sortBy?: string, sortType?: 'asc'|'desc', userId?: string }} [params]
   */
  getAllVideos: async (params = {}) => {
    return await apiClient.get('/videos', { params });
  },

  /**
   * Get single video by ID (increments views)
   * @param {string} videoId
   */
  getVideoById: async (videoId) => {
    return await apiClient.get(`/videos/${videoId}`);
  },

  /**
   * Publish new video (FormData with videoFile, thumbnail, title, description)
   * @param {FormData} formData
   * @param {(progressEvent: any) => void} [onUploadProgress]
   */
  publishVideo: async (formData, onUploadProgress) => {
    return await apiClient.post('/videos', formData, {
      onUploadProgress,
      // 10 minutes timeout for large video uploads
      timeout: 600000,
    });
  },

  /**
   * Update video details / thumbnail
   * @param {string} videoId
   * @param {FormData|object} data
   */
  updateVideo: async (videoId, data) => {
    return await apiClient.patch(`/videos/${videoId}`, data);
  },

  /**
   * Delete video by ID
   * @param {string} videoId
   */
  deleteVideo: async (videoId) => {
    return await apiClient.delete(`/videos/${videoId}`);
  },

  /**
   * Toggle published status of video
   * @param {string} videoId
   */
  togglePublishStatus: async (videoId) => {
    return await apiClient.patch(`/videos/toggle/publish/${videoId}`);
  },

  /**
   * Subscribe to real-time transcoding progress updates via Server-Sent Events (SSE)
   * @param {string} videoId
   * @param {(data: any) => void} onProgress
   * @param {(err: any) => void} [onError]
   * @returns {() => void} Unsubscribe cleanup function
   */
  subscribeToStatusStream: (videoId, onProgress, onError) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const eventSource = new EventSource(`${baseUrl}/videos/${videoId}/status-stream`, {
      withCredentials: true,
    });

    eventSource.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (onProgress) onProgress(data);
      } catch (err) {
        console.warn('Error parsing SSE event:', err);
      }
    });

    eventSource.addEventListener('done', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (onProgress) onProgress(data);
      } catch (err) {
        // no-op
      }
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      if (onError) onError(err);
      eventSource.close();
    };

    return () => eventSource.close();
  },
};

export default videosApi;
