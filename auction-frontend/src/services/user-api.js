// src/services/user-api.js
import api from './api';
import API_CONFIG from './apiConfig';

export const login = async (email, password) => {
  const response = await api.post(`${API_CONFIG.USER_SERVICE}/login`, {
    email,
    password,
  });
  return response.data;
};

export const register = async (formData) => {
  const response = await api.post(`${API_CONFIG.USER_SERVICE}/register`, formData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/user-service/api/users/me');
  return response.data;
};

export const updateUserProfile = async (userId, updatedData) => {
  const response = await api.put(`/user-service/api/users/${userId}/profile`, updatedData);
  return response.data;
};

export const changePassword = async (email, currentPassword, newPassword) => {
  const response = await api.post('/user-service/auth/reset-password', {
    email,
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const requestOtp = async (email) => {
  const response = await api.post(`${API_CONFIG.USER_SERVICE}/request-otp?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const loginWithOtp = async (email, otp) => {
  const response = await api.post(`${API_CONFIG.USER_SERVICE}/login-with-otp`, {
    email,
    otp,
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post(`${API_CONFIG.USER_SERVICE}/forgot-password`, {
    email,
  });
  return response.data;
};

export const resetPassword = async (token, email, newPassword) => {
  const response = await api.post(`${API_CONFIG.USER_SERVICE}/reset-password`, {
    token,
    email,
    newPassword,
  });
  return response.data;
};

