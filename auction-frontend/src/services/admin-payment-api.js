// src/services/admin-payment-api.js
import api from './api';
import API_CONFIG from './apiConfig';

const paymentAPI = {
    // Lấy tất cả payments
    getAllPayments: async () => {
        try {
            const response = await api.get(API_CONFIG.PAYMENT_SERVICE);
            return response.data;
        } catch (error) {
            console.error('Error fetching all payments:', error);
            throw error;
        }
    },

    // Lấy payments theo user
    getPaymentsByUserId: async (userId) => {
        try {
            const response = await api.get(`${API_CONFIG.PAYMENT_SERVICE}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching payments for user ${userId}:`, error);
            // Return empty array instead of throwing to prevent breaking the UI
            return [];
        }
    },

    // Lấy payments theo auction
    getPaymentsByAuctionId: async (auctionId) => {
        try {
            const response = await api.get(`${API_CONFIG.PAYMENT_SERVICE}/auction/${auctionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching payments for auction ${auctionId}:`, error);
            return [];
        }
    },

    // Cập nhật trạng thái payment
    updatePaymentStatus: async (paymentId, status) => {
        try {
            const response = await api.patch(`${API_CONFIG.PAYMENT_SERVICE}/${paymentId}/status`, null, {
                params: { status }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating payment status ${paymentId}:`, error);
            throw error;
        }
    },

    // Kiểm tra auction đã được thanh toán chưa
    isAuctionPaid: async (auctionId) => {
        try {
            const response = await api.get(`${API_CONFIG.PAYMENT_SERVICE}/check/auction/${auctionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error checking auction payment ${auctionId}:`, error);
            return false;
        }
    },

    // Kiểm tra user đã thanh toán deposit chưa
    hasUserPaidDeposit: async (userId, auctionId) => {
        try {
            const response = await api.get(`${API_CONFIG.PAYMENT_SERVICE}/check/deposit`, {
                params: { userId, auctionId }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking user deposit:', error);
            return false;
        }
    },
};

export default paymentAPI;