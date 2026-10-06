import apiClient from './axios.js';

export const dashboardApi = {
  /**
   * Get creator channel analytics stats
   * @returns {Promise<{ totalVideos: number, totalViews: number, totalSubscribers: number, totalLikes: number }>}
   */
  getStats: async () => {
    return await apiClient.get('/dashboard/stats');
  },

  /**
   * Get all videos uploaded by current creator with metrics
   * @returns {Promise<Array<any>>}
   */
  getVideos: async () => {
    return await apiClient.get('/dashboard/videos');
  },
};

export default dashboardApi;

