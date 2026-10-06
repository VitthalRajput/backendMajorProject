import apiClient from './axios.js';

export const tweetsApi = {
  /**
   * Create a new tweet
   * @param {string} content
   */
  createTweet: async (content) => {
    return await apiClient.post('/tweets', { content });
  },

  /**
   * Get all tweets by a user
   * @param {string} userId
   */
  getUserTweets: async (userId) => {
    try {
      return await apiClient.get(`/tweets/user/${userId}`);
    } catch (error) {
      // Backend returns 404 if no tweets found for user
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Update tweet content
   * @param {string} tweetId
   * @param {string} newcontent
   */
  updateTweet: async (tweetId, content) => {
    return await apiClient.patch(`/tweets/${tweetId}`, {
      content,
      newcontent: content,
    });
  },

  /**
   * Delete tweet
   * @param {string} tweetId
   */
  deleteTweet: async (tweetId) => {
    return await apiClient.delete(`/tweets/${tweetId}`);
  },
};

export default tweetsApi;

