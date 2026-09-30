import apiClient from './axios.js';

export const subscriptionsApi = {
  /**
   * Toggle subscription to a channel
   * @param {string} channelId
   * @returns {Promise<{ subscribed: boolean }>}
   */
  toggleSubscription: async (channelId) => {
    return await apiClient.post(`/subscriptions/c/${channelId}`);
  },

  /**
   * Get list of subscribers for a channel
   * @param {string} channelId
   */
  getUserChannelSubscribers: async (channelId) => {
    return await apiClient.get(`/subscriptions/c/${channelId}`);
  },

  /**
   * Get list of channels that a user is subscribed to
   * @param {string} subscriberId
   */
  getSubscribedChannels: async (subscriberId) => {
    return await apiClient.get(`/subscriptions/u/${subscriberId}`);
  },
};

export default subscriptionsApi;
