// src/services/category-api.js
import api from './api';
import API_CONFIG from './apiConfig';

export const getAllCategories = async () => {
    try {
        const response = await api.get(`${API_CONFIG.CATEGORY_SERVICE}/categories`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        throw error;
    }
};