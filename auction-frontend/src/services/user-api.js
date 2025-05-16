// src/services/user-api.js
import api from './api';
import API_CONFIG from './apiConfig';
import Cookies from 'js-cookie';

// Auth endpoints
export const login = async (email, password) => {
  const response = await api.post(`${API_CONFIG.USER_AUTH}/login`, { email, password });
  return response.data;
};

export const register = async (formData) => {
  const response = await api.post(`${API_CONFIG.USER_AUTH}/register`, formData);
  return response.data;
};

export const changePassword = async (email, currentPassword, newPassword) => {
  const response = await api.post(`${API_CONFIG.USER_AUTH}/reset-password`, {
    email,
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const requestOtp = async (email) => {
  const response = await api.post(`${API_CONFIG.USER_AUTH}/request-otp?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const loginWithOtp = async (email, otp) => {
  const response = await api.post(`${API_CONFIG.USER_AUTH}/login-with-otp`, { email, otp });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post(`${API_CONFIG.USER_AUTH}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token, email, newPassword) => {
  const response = await api.post(`${API_CONFIG.USER_AUTH}/reset-password`, {
    token,
    email,
    newPassword,
  });
  return response.data;
};

export const submitEkycRequest = async (formData) => {
	const token = Cookies.get('jwt');
	const response = await api.post(`${API_CONFIG.USER_API}/ekyc`, formData, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

export const getEkycStatus = async () => {
	const response = await api.get(`${API_CONFIG.USER_API}/ekyc-status`);
	return response.data;
};


// User info endpoints
export const getCurrentUser = async () => {
  const response = await api.get(`${API_CONFIG.USER_API}/me`);
  return response.data;
};

export const updateUserProfile = async (userId, updatedData) => {
  const response = await api.put(`${API_CONFIG.USER_API}/${userId}/profile`, updatedData);
  return response.data;
};
