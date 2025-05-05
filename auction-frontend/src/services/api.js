import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Gateway URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with requests
});

export default api;
