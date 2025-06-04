// File: src/services/bid-api.js
import api from './api';
import API_CONFIG from './apiConfig';

const bidEndpoint = `${API_CONFIG.BID_SERVICE}`;

// Gửi bid mới (đồng bộ)
export const createBid = async (bidData) => {
	const response = await api.post(`${bidEndpoint}`, bidData);
	return response.data;
};

// Gửi bid bất đồng bộ (kafka, message queue)
export const placeBidAsync = async (bidMessage) => {
	const response = await api.post(`${bidEndpoint}/async`, bidMessage);
	return response.data;
};

// Lấy danh sách bid theo auctionId
export const getBidsByAuction = async (auctionId) => {
	const response = await api.get(`${bidEndpoint}/auction/${auctionId}`);
	return response.data;
};

// Lấy số lượng bid theo auctionId
export const countBidsByAuction = async (auctionId) => {
	const response = await api.get(`${bidEndpoint}/auction/${auctionId}/count`);
	return response.data;
};

// Lấy bid cao nhất cho auction
export const getHighestBid = async (auctionId) => {
	const response = await api.get(`${bidEndpoint}/highest/${auctionId}`);
	return response.data;
};

// Lấy danh sách bid của user
export const getBidsByUser = async (userId) => {
	const response = await api.get(`${bidEndpoint}/user/${userId}`);
	return response.data;
};

// Lấy danh sách bid đã group của user
export const getGroupedBidsByUser = async (userId) => {
	const response = await api.get(`${bidEndpoint}/user/${userId}/grouped`);
	return response.data;
};

// Hủy một bid
export const cancelBid = async (bidId) => {
	const response = await api.delete(`${bidEndpoint}/cancel/${bidId}`);
	return response.data;
};
