import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token on outbound requests & sanitize redundant /api prefix
api.interceptors.request.use(
  (config) => {
    // Prevent double /api/api/ when callers provide /api/... with baseURL ending in /api
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4); // removes leading '/api', leaving '/...'
    }

    const token = localStorage.getItem('campusiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 response and prompt re-authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('campusiq_token');
      localStorage.removeItem('campusiq_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
