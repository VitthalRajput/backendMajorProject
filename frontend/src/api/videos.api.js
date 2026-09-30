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
};

export default videosApi;
