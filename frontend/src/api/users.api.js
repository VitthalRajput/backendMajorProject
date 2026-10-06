import apiClient from './axios.js';

export const usersApi = {
  /**
   * Get channel profile by username
   * @param {string} username
   */
  getUserChannelProfile: async (username) => {
    return await apiClient.get(`/users/c/${encodeURIComponent(username)}`);
  },

  /**
   * Get authenticated user's watch history
   */
  getWatchHistory: async () => {
    return await apiClient.get('/users/history');
  },

  /**
   * Update full name and email
   * @param {{ fullName: string, email: string }} data
   */
  updateAccountDetails: async (data) => {
    return await apiClient.patch('/users/update-account', data);
  },

  /**
   * Update user avatar (FormData with single 'avatar' file)
   * @param {FormData} formData
   */
  updateAvatar: async (formData) => {
    return await apiClient.patch('/users/avatar', formData);
  },

  /**
   * Update user cover image (FormData with single 'coverImage' file)
   * @param {FormData} formData
   */
  updateCoverImage: async (formData) => {
    return await apiClient.patch('/users/cover-image', formData);
  },
};

export default usersApi;

