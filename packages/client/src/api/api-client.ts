import axios, { AxiosInstance } from 'axios';

// Determine base URL
const getBaseUrl = () => {
  // Check for runtime environment variables first (set by Heroku)
  if (window.ENV?.API_URL) {
    return window.ENV.API_URL;
  }
  
  // Then check for build-time environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check for Heroku-specific environment variable
  if (import.meta.env.VITE_HEROKU_URL) {
    return `${import.meta.env.VITE_HEROKU_URL}/api`;
  }
  
  // Check if we're on the Heroku domain
  const isHerokuDomain = window.location.hostname.includes('herokuapp.com');
  if (isHerokuDomain) {
    // Use the current origin as the base
    return `${window.location.origin}/api`;
  }
  
  // Default to relative path
  return '/api';
};

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = 
      error.response?.data?.message || 
      error.message || 
      'An unknown error occurred';
    
    // Enhanced error object
    const enhancedError = {
      ...error,
      message,
      status: error.response?.status,
    };
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;