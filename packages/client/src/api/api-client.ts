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
    
    // Handle unauthorized errors (token expired or invalid)
    if (error.response?.status === 401) {
      console.warn('Received 401 Unauthorized response. Token may be invalid or expired.', {
        url: error.config.url,
        method: error.config.method
      });
      
      // Log stored token for debugging
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Current stored token length:', token.length);
        console.log('Token preview:', token.substring(0, 10) + '...');
      } else {
        console.log('No token found in localStorage');
      }
      
      // If on Heroku, we can try to use a special debug token for development
      const isHeroku = window.location.hostname.includes('herokuapp.com');
      if (isHeroku && process.env.NODE_ENV !== 'production') {
        console.log('Running on Heroku in development mode - using dev token');
        localStorage.setItem('token', 'dev-jwt-token');
        // Reload to restart auth flow
        window.location.reload();
        return Promise.reject(new Error('Auth token reset, please try again'));
      }
    }
    
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