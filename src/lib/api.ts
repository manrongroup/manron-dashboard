import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.manrongroup.com/api/v1';

// Create axios instances with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const realEstateApi = axios.create({
  baseURL: `${BASE_URL}/realestate`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle FormData
const addAuthToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Remove Content-Type header for FormData - browser will set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
};

const errorHandler = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Don't logout for permission-denied errors on emails/subscribers endpoints
    // These endpoints may return 401 for permission issues, not auth issues
    const requestUrl = error.config?.url || '';
    const skipLogoutEndpoints = ['/emails/sent', '/emails/stats', '/newsletter', '/emails'];
    const shouldSkipLogout = skipLogoutEndpoints.some(endpoint => requestUrl.includes(endpoint));

    if (shouldSkipLogout) {
      // Just reject the error without logging out
      return Promise.reject(error);
    }

    // For other endpoints, logout on 401 (actual authentication failure)
    const hadToken = !!localStorage.getItem('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Avoid redirect loops: only navigate to /login if we're not already there
    // and only if there was an auth token (i.e., a real session expiry scenario)
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && hadToken) {
        window.location.href = '/login';
      }
    }
  }
  return Promise.reject(error);
};

// Add interceptors to both instances
[api, realEstateApi].forEach(instance => {
  instance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
  instance.interceptors.response.use((response) => response, errorHandler);
});

export { api, realEstateApi };