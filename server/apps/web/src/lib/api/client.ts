import axios from 'axios';

const API_GATEWAY = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS || '10000', 10);

export const apiClient = axios.create({
  baseURL: API_GATEWAY,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const fallbackMessage = 'Request failed. Please try again.';
    const message = error?.response?.data?.error || error?.message || fallbackMessage;
    return Promise.reject(new Error(message));
  }
);
