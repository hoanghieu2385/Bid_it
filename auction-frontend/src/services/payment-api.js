// src/services/payment-api.js
import api from './api';
import Cookies from 'js-cookie';

// Get payments by user ID
export const getPaymentsByUserId = async (userId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(`/payment-service/api/payment/user/${userId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

// Get payments by auction ID
export const getPaymentsByAuctionId = async (auctionId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(`/payment-service/api/payment/auction/${auctionId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

// Check if auction is paid
export const isAuctionPaid = async (auctionId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(`/payment-service/api/payment/check/auction/${auctionId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

// Create auction payment
export const createAuctionPayment = async (paymentRequest) => {
	const token = Cookies.get('jwt');
	const response = await api.post('/payment-service/api/payment/auction', paymentRequest, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

// Execute PayPal payment
export const executePayPalPayment = async (executeRequest) => {
	const token = Cookies.get('jwt');
	const response = await api.post('/payment-service/api/payment/execute', executeRequest, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};