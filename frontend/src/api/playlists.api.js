import apiClient from './axios.js';

export const playlistsApi = {
  /**
   * Create a new playlist
   * @param {{ name: string, description: string }} data
   */
  createPlaylist: async (data) => {
    return await apiClient.post('/playlist', data);
  },

  /**
   * Get all playlists belonging to a user
   * @param {string} userId
   */
  getUserPlaylists: async (userId) => {
    return await apiClient.get(`/playlist/user/${userId}`);
  },

  /**
   * Get single playlist with its videos and owner
   * @param {string} playlistId
   */
  getPlaylistById: async (playlistId) => {
    return await apiClient.get(`/playlist/${playlistId}`);
  },

  /**
   * Add a video to a playlist
   * @param {string} videoId
   * @param {string} playlistId
   */
  addVideoToPlaylist: async (videoId, playlistId) => {
    return await apiClient.patch(`/playlist/add/${videoId}/${playlistId}`);
  },

  /**
   * Remove a video from a playlist
   * @param {string} videoId
   * @param {string} playlistId
   */
  removeVideoFromPlaylist: async (videoId, playlistId) => {
    return await apiClient.patch(`/playlist/remove/${videoId}/${playlistId}`);
  },

  /**
   * Update playlist name and description
   * @param {string} playlistId
   * @param {{ name: string, description: string }} data
   */
  updatePlaylist: async (playlistId, data) => {
    return await apiClient.patch(`/playlist/${playlistId}`, data);
  },

  /**
   * Delete a playlist by ID
   * @param {string} playlistId
   */
  deletePlaylist: async (playlistId) => {
    return await apiClient.delete(`/playlist/${playlistId}`);
  },
};

export default playlistsApi;

