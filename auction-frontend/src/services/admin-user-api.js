// src/services/admin-user-api.js
import api from './api';
import API_CONFIG from './apiConfig';

// Lấy danh sách tất cả người dùng (Admin only)
export const getAllUsers = async () => {
  const response = await api.get(`${API_CONFIG.USER_API}`);
  return response.data;
};

// Lấy thông tin chi tiết của một người dùng theo ID
export const getUserById = async (userId) => {
  try {
    // Kiểm tra xem userId có tồn tại không
    if (!userId) {
      throw new Error('User ID is undefined');
    }
    const response = await api.get(`${API_CONFIG.USER_API}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUserProfile = async () => {
  const response = await api.get(`${API_CONFIG.USER_API}/me`);
  return response.data;
};

// Xóa người dùng theo ID (Admin only)
export const deleteUser = async (userId) => {
  const response = await api.delete(`${API_CONFIG.USER_API}/${userId}`);
  return response.data;
};

// Cập nhật vai trò cho người dùng (Admin only)
export const updateUserRoles = async (userId, roles) => {
  const response = await api.put(`${API_CONFIG.USER_API}/${userId}/roles`, { roles });
  return response.data;
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userId, userData) => {
  const response = await api.put(`${API_CONFIG.USER_API}/${userId}/profile`, userData);
  return response.data;
};

// Khóa/mở khóa tài khoản người dùng
export const toggleUserLock = async (userId, locked) => {
  // Thêm endpoint này ở backend nếu cần
  const response = await api.patch(`${API_CONFIG.USER_API}/${userId}/lock`, { locked });
  return response.data;
};

// Xác thực/hủy xác thực tài khoản người dùng
export const toggleUserVerification = async (userId, verified) => {
  // Thêm endpoint này ở backend nếu cần
  const response = await api.patch(`${API_CONFIG.USER_API}/${userId}/verify`, { verified });
  return response.data;
};

// Đặt lại mật khẩu cho người dùng (Admin only)
export const resetUserPassword = async (userId) => {
  // Thêm endpoint này ở backend nếu cần
  const response = await api.post(`${API_CONFIG.USER_API}/${userId}/reset-password`);
  return response.data;
};