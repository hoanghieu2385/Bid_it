// src/services/admin-auction-api.js
import api from './api';
import API_CONFIG from './apiConfig';
import Cookies from 'js-cookie';

const adminAuctionAPI = {
    // Lấy tất cả auctions
    getAllAuctions: async () => {
        try {
            const response = await api.get(API_CONFIG.AUCTION_SERVICE);
            return response.data;
        } catch (error) {
            console.error('Error fetching all auctions:', error);
            throw error;
        }
    },

    getAuctionsBySeller: async (sellerId) => {
        try {
            const response = await api.get(`${API_CONFIG.AUCTION_SERVICE}/seller/${sellerId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching auctions by seller ${sellerId}:`, error);
            throw error;
        }
    },

    // Lấy auction theo ID
    getAuctionById: async (id) => {
        try {
            const response = await api.get(`${API_CONFIG.AUCTION_SERVICE}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching auction ${id}:`, error);
            throw error;
        }
    },

    // Tìm kiếm auctions theo status
    searchAuctionsByStatus: async (status) => {
        try {
            const response = await api.get(`${API_CONFIG.AUCTION_SERVICE}/search/status`, {
                params: { status }
            });
            return response.data;
        } catch (error) {
            console.error(`Error searching auctions by status ${status}:`, error);
            throw error;
        }
    },

    // Tìm kiếm auctions theo category
    searchAuctionsByCategory: async (categoryId) => {
        try {
            const response = await api.get(`${API_CONFIG.AUCTION_SERVICE}/search/category`, {
                params: { categoryId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error searching auctions by category ${categoryId}:`, error);
            throw error;
        }
    },

    // Tạo auction mới
    createAuction: async (auctionData, imageFiles, requesterId) => {
        try {
            const token = Cookies.get('jwt');

            const formData = new FormData();

            // Gắn auction JSON
            formData.append(
                'auction',
                new Blob([JSON.stringify(auctionData)], { type: 'application/json' })
            );

            // Gắn ảnh
            imageFiles.forEach(file => {
                formData.append('files', file);
            });

            const response = await api.post(
                `${API_CONFIG.AUCTION_SERVICE}/with-media`,
                formData,
                {
                    params: { requesterId },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating auction (with media):', error);
            throw error;
        }
    },

    // Cập nhật auction
    updateAuction: async (id, auctionData, requesterId) => {
        try {
            const response = await api.put(`${API_CONFIG.AUCTION_SERVICE}/${id}`, auctionData, {
                params: { requesterId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating auction ${id}:`, error);
            throw error;
        }
    },

    // Cập nhật trạng thái auction (chỉ admin)
    updateAuctionStatus: async (id, status, requesterId) => {
        try {
            const response = await api.put(`${API_CONFIG.AUCTION_SERVICE}/${id}/status`,
                { status },
                { params: { requesterId } }
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating auction status ${id}:`, error);
            throw error;
        }
    },

    // Xóa auction (chỉ admin)
    deleteAuction: async (id, requesterId) => {
        try {
            const response = await api.delete(`${API_CONFIG.AUCTION_SERVICE}/${id}`, {
                params: { requesterId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting auction ${id}:`, error);
            throw error;
        }
    },

    // Tìm kiếm auctions với nhiều filter
    searchAuctions: async (filters = {}) => {
        try {
            const { searchQuery, category, status, sortBy } = filters;

            // Nếu có filter cụ thể, sử dụng endpoint tương ứng
            if (status && status !== 'All Statuses') {
                // Chuyển đổi status name sang backend format
                const statusMap = {
                    'Opened': 'OPENED',
                    'Active': 'OPENED',
                    'Completed': 'COMPLETED',
                    'Pending': 'PENDING',
                    'Draft': 'DRAFT',
                    'Delivered': 'DELIVERED'
                };
                const backendStatus = statusMap[status] || status.toUpperCase();
                return await adminAuctionAPI.searchAuctionsByStatus(backendStatus);
            }

            if (category && category !== 'All Categories') {
                // Giả sử bạn có mapping category name với ID
                const categoryMap = {
                    'Luxury Watches': 1,
                    'Jewelry': 2,
                    'Electronics': 3,
                    'Fashion': 4,
                    'Automobiles': 5,
                    'Motorcycles': 6,
                    'Optics': 7
                };
                const categoryId = categoryMap[category];
                if (categoryId) {
                    return await adminAuctionAPI.searchAuctionsByCategory(categoryId);
                }
            }

            // Nếu không có filter đặc biệt, lấy tất cả và filter ở client
            const response = await api.get(API_CONFIG.AUCTION_SERVICE);
            let data = response.data;

            // Filter theo search query
            if (searchQuery && searchQuery.trim()) {
                data = data.filter(auction =>
                    auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    auction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (auction.user && auction.user.fullName &&
                        auction.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
                );
            }

            // Sort data
            if (sortBy) {
                data = sortAuctions(data, sortBy);
            }

            return data;
        } catch (error) {
            console.error('Error searching auctions:', error);
            throw error;
        }
    },

    // Lấy thống kê auctions
    getAuctionStats: async () => {
        try {
            // Lấy tất cả auctions để tính stats
            const auctions = await adminAuctionAPI.getAllAuctions();

            const stats = {
                all: auctions.length,
                active: auctions.filter(a => a.status === 'OPENED').length,
                draft: auctions.filter(a => a.status === 'DRAFT').length,
                delivered: auctions.filter(a => a.status === 'DELIVERED').length,
                pending: auctions.filter(a => a.status === 'PENDING').length,
                completed: auctions.filter(a => a.status === 'COMPLETED').length
            };

            return stats;
        } catch (error) {
            console.error('Error getting auction stats:', error);
            throw error;
        }
    }
};

// Helper function để sort auctions
const sortAuctions = (auctions, sortBy) => {
    const sortedAuctions = [...auctions];

    switch (sortBy) {
        case 'Newest':
            return sortedAuctions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'Oldest':
            return sortedAuctions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'Price: High to Low':
            return sortedAuctions.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
        case 'Price: Low to High':
            return sortedAuctions.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
        case 'Bids: High to Low':
            return sortedAuctions.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
        case 'Bids: Low to High':
            return sortedAuctions.sort((a, b) => (a.bidCount || 0) - (b.bidCount || 0));
        default:
            return sortedAuctions;
    }
};

export default adminAuctionAPI;