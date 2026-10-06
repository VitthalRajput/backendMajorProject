import apiClient from './axios.js';

export const likesApi = {
  /**
   * Toggle like on a video
   * @param {string} videoId
   * @returns {Promise<{ liked: boolean }>}
   */
  toggleVideoLike: async (videoId) => {
    return await apiClient.post(`/likes/toggle/v/${videoId}`);
  },

  /**
   * Toggle like on a comment
   * @param {string} commentId
   * @returns {Promise<{ liked: boolean }>}
   */
  toggleCommentLike: async (commentId) => {
    return await apiClient.post(`/likes/toggle/c/${commentId}`);
  },

  /**
   * Toggle like on a tweet
   * @param {string} tweetId
   * @returns {Promise<{ liked: boolean }>}
   */
  toggleTweetLike: async (tweetId) => {
    return await apiClient.post(`/likes/toggle/t/${tweetId}`);
  },

  /**
   * Get all videos liked by authenticated user
   */
  getLikedVideos: async () => {
    return await apiClient.get('/likes/videos');
  },
};

export default likesApi;

