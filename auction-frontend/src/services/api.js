// src/services/api.js
import axios from 'axios';

const api = axios.create({
	baseURL: 'http://localhost:8080',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Tự động gắn Authorization header nếu có token
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('jwt');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
