import axios from 'axios';

/**
 * Centralized Axios API client configured with environment API URL and error handling.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('moodie_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error responses and handle 401 Unauthorized & 403 Forbidden
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const method = (error.config?.method || '').toLowerCase();

    // 1. Handle 401 Unauthorized (Session Expiration vs. Credential Failures)
    if (status === 401) {
      const isCredentialCheck =
        url.includes('/auth/login') ||
        url.includes('/auth/password') ||
        (url.includes('/users/me') && method === 'delete');

      if (!isCredentialCheck) {
        localStorage.removeItem('moodie_token');
        localStorage.removeItem('moodie_user');
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }

    // 2. Handle 403 Forbidden (RBAC violation)
    if (status === 403) {
      const isLoginAttempt = url.includes('/auth/login');
      // If login attempt fails because user is blocked, do not redirect so LoginPage shows the block message
      if (!isLoginAttempt && window.location.pathname !== '/forbidden') {
        window.location.href = '/forbidden';
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.response = error.response;
    enhancedError.data = error.response?.data;
    return Promise.reject(enhancedError);
  }
);

export default api;
