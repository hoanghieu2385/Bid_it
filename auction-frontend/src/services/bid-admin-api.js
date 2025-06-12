// src/services/bid-api.js
import api from './api';
import API_CONFIG from './apiConfig';

const bidAPI = {
  // Lấy danh sách bid của auction (tất cả bids)
  getBidsByAuction: async (auctionId) => {
    try {
      const response = await api.get(`${API_CONFIG.BID_SERVICE}/auction/${auctionId}`);
      return response.data.data; // Trả về array của bids
    } catch (error) {
      console.error('Error fetching bids by auction:', error);
      throw error;
    }
  },

  // Lấy bid history của auction (10 bid gần nhất)
  getBidHistory: async (auctionId) => {
    try {
      const response = await api.get(`${API_CONFIG.BID_SERVICE}/auction/${auctionId}/history`);
      return response.data.data; // Trả về array của recent bids
    } catch (error) {
      console.error('Error fetching bid history:', error);
      throw error;
    }
  },

  // Lấy bid cao nhất hiện tại
  getHighestBid: async (auctionId) => {
    try {
      const response = await api.get(`${API_CONFIG.BID_SERVICE}/auction/${auctionId}/highest`);
      return response.data.data; // Trả về HighestBidResponse object
    } catch (error) {
      console.error('Error fetching highest bid:', error);
      throw error;
    }
  },

  // Lấy thống kê bid của auction
  getBidStatistics: async (auctionId) => {
    try {
      const response = await api.get(`${API_CONFIG.BID_SERVICE}/auction/${auctionId}/statistics`);
      return response.data.data; // Trả về BidStatistics object
    } catch (error) {
      console.error('Error fetching bid statistics:', error);
      throw error;
    }
  },

  // Lấy bid của user
  getBidsByUser: async (userId) => {
    try {
      const response = await api.get(`${API_CONFIG.BID_SERVICE}/user/${userId}`);
      return response.data.data; // Trả về array của user bids
    } catch (error) {
      console.error('Error fetching user bids:', error);
      throw error;
    }
  },

  // Tạo bid mới
  createBid: async (auctionId, userId, bidAmount) => {
    try {
      const response = await api.post(`${API_CONFIG.BID_SERVICE}`, {
        auctionId,
        userId,
        bidAmount
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating bid:', error);
      throw error;
    }
  },

  // Validate bid trước khi tạo
  validateBid: async (auctionId, userId, bidAmount) => {
    try {
      const response = await api.post(`${API_CONFIG.BID_SERVICE}/validate`, {
        auctionId,
        userId,
        bidAmount
      });
      return response.data.data;
    } catch (error) {
      console.error('Error validating bid:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get(`${API_CONFIG.BID_SERVICE}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking bid service health:', error);
      throw error;
    }
  }
};

export default bidAPI;