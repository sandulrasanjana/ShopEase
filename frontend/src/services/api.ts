import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear local token and trigger state update
      const currentToken = localStorage.getItem('shopease_token');
      if (currentToken && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('shopease_token');
        localStorage.removeItem('shopease_user');
        window.dispatchEvent(new Event('auth_change'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

