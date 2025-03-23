/**
 * Utility functions for authentication
 */

/**
 * Check if the application is running in development mode
 */
export const isDevelopmentMode = (): boolean => {
  // Check for development environment
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check if running on localhost
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    return true;
  }

  return false;
};

/**
 * Check if a token is a development token
 */
export const isDevelopmentToken = (token: string): boolean => {
  return token === 'dev-jwt-token' || 
         token.startsWith('dev-token-') || 
         token === 'fake-jwt-token-for-demo';
};

/**
 * Create a default development user
 */
export const createDevelopmentUser = () => {
  return {
    id: 'dev-user-id',
    email: 'dev@example.com',
    name: 'Development User',
    provider: 'google' as const,
  };
};