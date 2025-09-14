import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://manron-group-backend.onrender.com/api/v1';

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

// Request interceptor to add auth token
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const errorHandler = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

// Add interceptors to both instances
[api, realEstateApi].forEach(instance => {
  instance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
  instance.interceptors.response.use((response) => response, errorHandler);
});

export { api, realEstateApi };