// src/services/api.js
import axios from 'axios';

const api = axios.create({
	baseURL: 'http://localhost:8080',
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// Tự động gắn Authorization header nếu có token
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('jwt');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Interceptor xử lý lỗi
api.interceptors.response.use(
    response => response,
    error => {
        // Xử lý lỗi từ API
        if (error.response) {
            // Lỗi server trả về (status code không phải 2xx)
            console.error('API Error:', error.response.data);
            
            // Xử lý lỗi 401 (Unauthorized)
            if (error.response.status === 401) {
                // localStorage.removeItem('jwt');
                // Chuyển hướng về trang đăng nhập nếu cần
                // window.location.href = '/login';
            }
        } else if (error.request) {
            // Không nhận được response
            console.error('Network Error:', error.request);
        } else {
            // Lỗi xảy ra khi setup request
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
