import axios from 'axios';

// Use the relative /api path to route through Next.js proxies
const API_GATEWAY = '/api';
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS || '90000', 10);
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

export const apiClient = axios.create({
  baseURL: API_GATEWAY,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry Interceptor for Render Cold Starts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Only retry on 502/504 or timeout (ECONNABORTED)
    const isRetryable = error.response?.status === 502 || error.response?.status === 504 || error.code === 'ECONNABORTED';
    
    if (isRetryable && (!config._retryCount || config._retryCount < MAX_RETRIES)) {
      config._retryCount = (config._retryCount || 0) + 1;
      console.warn(`Retrying request [${config._retryCount}/${MAX_RETRIES}] due to ${error.code || error.response?.status}...`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return apiClient(config);
    }

    const fallbackMessage = 'Request failed. Please try again.';
    const message = error?.response?.data?.error || error?.message || fallbackMessage;
    return Promise.reject(new Error(message));
  }
);

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
