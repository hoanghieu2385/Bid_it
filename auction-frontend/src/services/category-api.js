// src/services/category-api.js
import api from './api';
import API_CONFIG from './apiConfig';

const categoryEndpoint = `${API_CONFIG.CATEGORY_SERVICE}`;

// Lấy tất cả danh mục
export const getAllCategories = async () => {
    try {
        const response = await api.get(categoryEndpoint);
        return response.data;
    } catch (error) {
        console.error('Không thể lấy danh sách danh mục:', error);
        throw error;
    }
};

// Lấy danh mục theo ID
export const getCategoryById = async (id) => {
    try {
        const response = await api.get(`${categoryEndpoint}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Không thể lấy danh mục có ID ${id}:`, error);
        throw error;
    }
};

// Tạo danh mục mới
export const createCategory = async (categoryData) => {
    try {
        const response = await api.post(categoryEndpoint, categoryData);
        return response.data;
    } catch (error) {
        console.error('Không thể tạo danh mục mới:', error);
        throw error;
    }
};

// Cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await api.put(`${categoryEndpoint}/${id}`, categoryData);
        return response.data;
    } catch (error) {
        console.error(`Không thể cập nhật danh mục có ID ${id}:`, error);
        throw error;
    }
};

// Xóa danh mục
export const deleteCategory = async (id) => {
    try {
        await api.delete(`${categoryEndpoint}/${id}`);
        return true;
    } catch (error) {
        console.error(`Không thể xóa danh mục có ID ${id}:`, error);
        throw error;
    }
};

// Lấy tất cả danh mục đã xóa (trong thùng rác)
export const getAllDeletedCategories = async () => {
    try {
        const response = await api.get(`${categoryEndpoint}/deleted`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục đã xóa:', error);
        throw error;
    }
};

// Khôi phục danh mục đã xóa
export const restoreCategory = async (id) => {
    try {
        const response = await api.post(`${categoryEndpoint}/${id}/restore`);
        return response.data;
    } catch (error) {
        console.error(`Không thể khôi phục danh mục có ID ${id}:`, error);
        throw error;
    }
};

