import axios from 'axios';

// Auto-detect environment
const getBackendURL = () => {
    // If running in production (deployed)
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_BACKEND_URL || 'https://emotisync-api.onrender.com';
    }
    // If running in development (local)
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
};

const api = axios.create({
    baseURL: getBackendURL(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
// Add request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;