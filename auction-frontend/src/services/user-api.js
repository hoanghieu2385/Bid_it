// src/services/user-api.js
import api from './api.js';
import API_CONFIG from '../services/apiConfig.js'; 

export const login = async (username, password) => {
  try {
    const response = await api.post('/login', null, {
      baseURL: API_CONFIG.USER_SERVICE, // Chỉ định baseURL động
      params: { username, password },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error occurred during login';
  }
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