import apiClient from './axios.js';

export const commentsApi = {
  /**
   * Get comments for a specific video with pagination
   * @param {string} videoId
   * @param {{ page?: number, limit?: number }} [params]
   */
  getVideoComments: async (videoId, params = {}) => {
    return await apiClient.get(`/comments/${videoId}`, { params });
  },

  /**
   * Add a new comment to a video
   * @param {string} videoId
   * @param {string} content
   */
  addComment: async (videoId, content) => {
    return await apiClient.post(`/comments/${videoId}`, { content });
  },

  /**
   * Update an existing comment
   * @param {string} commentId
   * @param {string} newComment
   */
  updateComment: async (commentId, newComment) => {
    return await apiClient.patch(`/comments/c/${commentId}`, { newComment });
  },

  /**
   * Delete a comment by ID
   * @param {string} commentId
   */
  deleteComment: async (commentId) => {
    return await apiClient.delete(`/comments/c/${commentId}`);
  },
};

export default commentsApi;

