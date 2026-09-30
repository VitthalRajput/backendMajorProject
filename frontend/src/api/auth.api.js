import apiClient from './axios.js';

export const authApi = {
  /**
   * Log in user
   * @param {{ username?: string, email?: string, password: string }} credentials
   */
  login: async (credentials) => {
    return await apiClient.post('/users/login', credentials);
  },

  /**
   * Register new user (multipart/form-data: fullName, email, username, password, avatar, coverImage)
   * @param {FormData} formData
   */
  register: async (formData) => {
    return await apiClient.post('/users/register', formData);
  },

  /**
   * Log out authenticated user
   */
  logout: async () => {
    return await apiClient.post('/users/logout');
  },

  /**
   * Get current authenticated user details
   */
  getCurrentUser: async () => {
    return await apiClient.get('/users/current-user');
  },

  /**
   * Refresh access token
   * @param {string} [refreshToken]
   */
  refreshToken: async (refreshToken) => {
    return await apiClient.post('/users/refresh-token', { refreshToken });
  },

  /**
   * Change current user's password
   * @param {{ oldPassword: string, newPassword: string }} data
   */
  changePassword: async (data) => {
    return await apiClient.post('/users/change-password', data);
  },
};

export default authApi;
