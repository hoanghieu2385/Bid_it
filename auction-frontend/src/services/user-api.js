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

export const register = async (username, password) => {
  try {
    const response = await api.post('/register', null, {
      baseURL: API_CONFIG.USER_SERVICE,
      params: { username, password },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error occurred during registration';
  }
};