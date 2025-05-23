// src/services/auction-api.js
import api from './api';
import Cookies from 'js-cookie';

export const getAllAuctions = async () => {
	const response = await api.get('/auction-service/api/auctions');
	return response.data;
};


// Create new auction
export const createAuction = async (formData, requesterId) => {
	const token = Cookies.get('jwt');
	const response = await api.post(`/auction-service/api/auctions?requesterId=${requesterId}`, formData, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

// Upload multiple images for auction
export const uploadAuctionImages = async (auctionId, imageFiles) => {
	const form = new FormData();
	imageFiles.forEach((file) => form.append('files', file));

	const token = Cookies.get('jwt');
	const response = await api.post(
		`/auction-service/api/media/multi-upload?auctionId=${auctionId}`,
		form,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'multipart/form-data',
			},
		}
	);
	return response.data;
};

// Get all auctions by seller
export const getAuctionsBySeller = async (sellerId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(`/auction-service/api/auctions/seller/${sellerId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

// Get auction by ID
export const getAuctionById = async (id) => {
	const token = Cookies.get('jwt');
	const response = await api.get(`/auction-service/api/auctions/${id}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};
