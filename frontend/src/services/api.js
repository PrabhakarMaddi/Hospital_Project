import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
    (config) => {
        const raw = localStorage.getItem('userInfo');
        const user = raw ? JSON.parse(raw) : null;
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
