// src/services/admin-user-api.js - Phiên bản đơn giản hóa
import api from './api';
import API_CONFIG from './apiConfig';
import Cookies from "js-cookie";

// Lấy danh sách tất cả người dùng (Admin only)
export const getAllUsers = async () => {
  const response = await api.get(`${API_CONFIG.USER_API}`);
  return response.data;
};

// Lấy thông tin chi tiết của một người dùng theo ID
export const getUserById = async (userId) => {
  try {
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

// Xóa người dùng theo ID (Admin only) - WORKING
export const deleteUser = async (userId) => {
  console.log('Calling DELETE API:', `${API_CONFIG.USER_API}/${userId}`);
  const response = await api.delete(`${API_CONFIG.USER_API}/${userId}`);
  return response.data;
};

// Cập nhật vai trò cho người dùng (Admin only) - WORKING
export const updateUserRoles = async (userId, roles) => {
  const response = await api.put(`${API_CONFIG.USER_API}/${userId}/roles`, { roles });
  return response.data;
};

// Cập nhật thông tin người dùng - WORKING
export const updateUserProfile = async (userId, userData) => {
  const response = await api.put(`${API_CONFIG.USER_API}/${userId}/profile`, userData);
  return response.data;
};

// ========== ENDPOINTS CHƯA CÓ TRONG BACKEND ==========
// Các function này sẽ trả về lỗi cho đến khi backend implement

// Khóa/mở khóa tài khoản người dùng - CHƯA CÓ ENDPOINT
export const toggleUserLock = async (userId, locked) => {
  // throw new Error('Backend chưa có endpoint PATCH /api/users/{id}/lock');
  const response = await api.patch(`${API_CONFIG.USER_API}/${userId}/lock`, { locked });
  return response.data;
};

// Xác thực/hủy xác thực tài khoản người dùng - CHƯA CÓ ENDPOINT
export const toggleUserVerification = async (userId, verified) => {
  // throw new Error('Backend chưa có endpoint PATCH /api/users/{id}/verify');
  const response = await api.patch(`${API_CONFIG.USER_API}/${userId}/verify`, { verified });
  return response.data;
};

// Đặt lại mật khẩu cho người dùng - CHƯA CÓ ENDPOINT
export const resetUserPassword = async (userId) => {
  // throw new Error('Backend chưa có endpoint POST /api/users/{id}/reset-password');
  const response = await api.post(`${API_CONFIG.USER_API}/${userId}/reset-password`);
  return response.data;
};

export const getVerifyRequests = async () => {
  const response = await api.get(`${API_CONFIG.USER_ADMIN_API}/verify-requests`);
  return response.data;
};

export const approveUserCCCD = async (userId) => {
  const response = await api.post(`${API_CONFIG.USER_ADMIN_API}/verify-requests/${userId}/approve`);
  return response.data;
};

export const denyUserCCCD = async (userId) => {
  const response = await api.post(`${API_CONFIG.USER_ADMIN_API}/verify-requests/${userId}/deny`);
  return response.data;
};

