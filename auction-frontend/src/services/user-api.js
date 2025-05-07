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
