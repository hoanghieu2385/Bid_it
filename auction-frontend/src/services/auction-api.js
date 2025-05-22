// src/services/auction-api.js
import api from './api';
import Cookies from 'js-cookie';

// Tạo đấu giá mới
export const createAuction = async (formData, requesterId) => {
	const token = Cookies.get('jwt');
	const response = await api.post(`/auction-service/api/auctions?requesterId=${requesterId}`, formData, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

// Upload nhiều hình ảnh
export const uploadAuctionImages = async (imageFiles) => {
	const form = new FormData();
	imageFiles.forEach((file) => form.append('files', file));

	const token = Cookies.get('jwt');
	const response = await api.post(`/auction-service/api/media/multi-upload`, form, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};
