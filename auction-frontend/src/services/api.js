import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Gateway URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Gắn JWT vào mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Xử lý lỗi 401 (token hết hạn, sai token, chưa login)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('jwt'); 
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
