/**
 * Utility functions for development authentication
 */

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
    picture: 'https://via.placeholder.com/150',
    providerId: 'mock-provider-id',
    provider: 'google' as const,
  };
};