import axios, { AxiosInstance } from 'axios';

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
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