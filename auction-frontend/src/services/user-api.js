import api from './api.js'; // Import instance từ api.js

export const login = async (username, password) => {
  try {
    const response = await api.post('/login', null, {
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
      params: { username, password },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error occurred during registration';
  }
};