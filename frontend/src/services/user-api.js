import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, null, {
      params: { username, password },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error occurred during login';
  }
};

export const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, null, {
      params: { username, password },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error occurred during registration';
  }
};