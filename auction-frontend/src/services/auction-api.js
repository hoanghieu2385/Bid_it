import api from './api';
import Cookies from 'js-cookie';

// Get all auctions
export const getAllAuctions = async () => {
	const response = await api.get('/auction-service/api/auctions');
	return response.data;
};

// Create auction + upload media (multipart/form-data)
export const createAuctionWithMedia = async (payload, imageFiles, requesterId) => {
	const token = Cookies.get('jwt');

	const formData = new FormData();

	// Đính kèm JSON auction
	formData.append(
		'auction',
		new Blob([JSON.stringify(payload)], { type: 'application/json' })
	);

	// Đính kèm các ảnh
	imageFiles.forEach((file) => {
		formData.append('files', file);
	});

	// Gửi request
	const response = await api.post(
		`/auction-service/api/auctions/with-media?requesterId=${requesterId}`,
		formData,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'multipart/form-data'
			}
		}
	);

	return response.data;
};


// Create new auction
export const createAuction = async (formData, requesterId) => {
	const token = Cookies.get('jwt');
	const response = await api.post(
		`/auction-service/api/auctions?requesterId=${requesterId}`,
		formData,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Cancel Auction (chuyển trạng thái về CANCELLED)
export const cancelAuction = async (auctionId, requesterId) => {
	const token = Cookies.get('jwt');
	// body chứa status mới
	const payload = { status: 'CANCELLED' };
	const response = await api.put(
		`/auction-service/api/auctions/${auctionId}/status?requesterId=${requesterId}`,
		payload,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			}
		}
	);
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
				'Content-Type': 'multipart/form-data'
			}
		}
	);
	return response.data;
};

// Get all media by auction ID
export const getMediaByAuction = async (auctionId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(
		`/auction-service/api/media/auction/${auctionId}`,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Delete specific media
export const deleteMedia = async (mediaId) => {
	const token = Cookies.get('jwt');
	const response = await api.delete(
		`/auction-service/api/media/${mediaId}`,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Set media as thumbnail
export const setThumbnail = async (mediaId) => {
	const token = Cookies.get('jwt');
	const response = await api.patch(
		`/auction-service/api/media/${mediaId}/set-thumbnail`,
		null,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Delete Auction
export const deleteAuction = async (auctionId, requesterId) => {
	const token = Cookies.get('jwt');
	const response = await api.delete(
		`/auction-service/api/auctions/${auctionId}`,
		{
			params: { requesterId },
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Update auction
export const updateAuction = async (auctionId, formData, requesterId) => {
	const token = Cookies.get('jwt');
	const response = await api.put(
		`/auction-service/api/auctions/${auctionId}?requesterId=${requesterId}`,
		formData,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Get all auctions by seller
export const getAuctionsBySeller = async (sellerId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(
		`/auction-service/api/auctions/seller/${sellerId}`,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Get auctions by category ID
export const getAuctionsByCategory = async (categoryId) => {
	const response = await api.get(
		`/auction-service/api/auctions/search/category?categoryId=${categoryId}`
	);
	return response.data;
};

// Get auctions by status
export const getAuctionsByStatus = async (status) => {
	const response = await api.get(
		`/auction-service/api/auctions/search/status?status=${status}`
	);
	return response.data;
};

// Get auction details by ID 
export const getAuctionDetailById = async (auctionId) => {
	const response = await api.get(
		`/auction-service/api/auctions/${auctionId}`
	);
	return response.data;
};

// Get auction details by ID with JWT
export const getProtectedAuctionDetailById = async (auctionId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(
		`/auction-service/api/auctions/${auctionId}`,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Get auction bid history
export const getAuctionBidHistory = async (auctionId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(
		`/bid-service/api/bids/auction/${auctionId}/history`,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return response.data;
};

// Get participated auctions
export const getParticipatedAuctions = async (userId) => {
	const token = Cookies.get('jwt');
	const bidsResponse = await api.get(
		`/bid-service/api/bids/user/${userId}`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	let bidsData = bidsResponse.data;
	if (bidsData && typeof bidsData === 'object' && !Array.isArray(bidsData)) {
		bidsData = bidsData.data || bidsData.bids || bidsData.content || [];
	}
	if (!Array.isArray(bidsData) || bidsData.length === 0) return [];

	const auctionIds = [...new Set(bidsData.map(b => b.auctionId))];
	const auctionPromises = auctionIds.map(id =>
		api.get(`/auction-service/api/auctions/${id}`)
	);
	const auctionResponses = await Promise.all(auctionPromises);
	const auctions = auctionResponses.map(r => r.data);

	return auctions.map(auction => {
		const userBids = bidsData.filter(b => b.auctionId === auction.id);
		const amounts = userBids.map(b => parseFloat(b.bidAmount ?? b.amount) || 0);
		const highest = amounts.length ? Math.max(...amounts) : 0;
		return {
			...auction,
			userHighestBid: highest,
			userBidCount: userBids.length,
			userBids: userBids.sort((a, b) =>
				new Date(b.createdAt) - new Date(a.createdAt)
			)
		};
	});
};
