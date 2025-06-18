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

// Get auctions by category ID
export const getAuctionsByCategory = async (categoryId) => {
	const response = await api.get(`/auction-service/api/auctions/search/category?categoryId=${categoryId}`);
	return response.data;
};

// Get auctions by status
export const getAuctionsByStatus = async (status) => {
	const response = await api.get(`/auction-service/api/auctions/search/status?status=${status}`);
	return response.data;
};

// Get auction details by ID 
export const getAuctionDetailById = async (auctionId) => {
	const response = await api.get(`/auction-service/api/auctions/${auctionId}`);
	return response.data;
};

export const getAuctionBidHistory = async (auctionId) => {
	const token = Cookies.get('jwt');
	const response = await api.get(`/bid-service/api/bids/auction/${auctionId}/history`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.data;
};

export const getParticipatedAuctions = async (userId) => {
	const token = Cookies.get('jwt');
	try {
		// First, get all bids by user from bid service
		const bidsResponse = await api.get(`/bid-service/api/bids/user/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		
		console.log('Bids response:', bidsResponse.data); // Debug log
		
		// Handle different response formats
		let bidsData = bidsResponse.data;
		
		// If response is wrapped in another object (e.g., { bids: [...] } or { data: [...] })
		if (bidsData && typeof bidsData === 'object' && !Array.isArray(bidsData)) {
			// Try common property names
			bidsData = bidsData.data || bidsData.bids || bidsData.content || [];
		}
		
		// Ensure bidsData is an array
		if (!Array.isArray(bidsData)) {
			console.warn('Bids data is not an array:', bidsData);
			return []; // Return empty array if no valid bids data
		}
		
		// If no bids found, return empty array
		if (bidsData.length === 0) {
			return [];
		}
		
		// Extract unique auction IDs from bids
		const auctionIds = [...new Set(bidsData.map(bid => bid.auctionId))];
		
		// Get auction details for each auction ID
		const auctionPromises = auctionIds.map(id => 
			api.get(`/auction-service/api/auctions/${id}`)
		);
		
		const auctionResponses = await Promise.all(auctionPromises);
		const auctions = auctionResponses.map(response => response.data);
		
		// Add user's highest bid for each auction
		const auctionsWithBids = auctions.map(auction => {
			const userBids = bidsData.filter(bid => bid.auctionId === auction.id);
			
			// Tính toán highest bid với xử lý lỗi tốt hơn
			let highestUserBid = 0;
			if (userBids.length > 0) {
				const bidAmounts = userBids
					.map(bid => {
						// Xử lý bid.bidAmount thay vì bid.amount (theo API response)
						const amount = bid.bidAmount || bid.amount;
						const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
						return isNaN(numericAmount) ? 0 : numericAmount;
					})
					.filter(amount => amount > 0);
				
				highestUserBid = bidAmounts.length > 0 ? Math.max(...bidAmounts) : 0;
			}
			
			const bidCount = userBids.length;
			
			console.log(`Auction ${auction.id}:`, {
				userBids,
				highestUserBid,
				bidCount,
				bidAmounts: userBids.map(b => b.bidAmount || b.amount)
			});
			
			return {
				...auction,
				userHighestBid: highestUserBid,
				userBidCount: bidCount,
				userBids: userBids.sort((a, b) => {
					// Sort bids by createdAt desc (newest first)
					const dateA = new Date(a.createdAt || 0);
					const dateB = new Date(b.createdAt || 0);
					return dateB - dateA;
				})
			};
		});
		
		// Sort auctions by participation date (latest bid first)
		return auctionsWithBids.sort((a, b) => {
			const latestBidA = a.userBids[0]?.createdAt || a.createdAt;
			const latestBidB = b.userBids[0]?.createdAt || b.createdAt;
			return new Date(latestBidB) - new Date(latestBidA);
		});
		
	} catch (error) {
		console.error('Error fetching participated auctions:', error);
		
		// Check if it's a 404 (no bids found) or other specific errors
		if (error.response?.status === 404) {
			console.log('No bids found for user');
			return []; // Return empty array instead of throwing error
		}
		
		throw error;
	}
};