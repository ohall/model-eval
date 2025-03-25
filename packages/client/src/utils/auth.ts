import { logger } from './logger';

/**
 * Utility functions for authentication
 */

/**
 * Check if the application is running in development mode
 */
export const isDevelopmentMode = (): boolean => {
  // Only allow development mode on localhost
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return true;
  }

  return false;
};

/**
 * Check if a token is a development token
 */
export const isDevelopmentToken = (token: string): boolean => {
  return (
    token === 'dev-jwt-token' ||
    token.startsWith('dev-token-') ||
    token === 'fake-jwt-token-for-demo'
  );
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

/**
 * Check if running on Heroku
 */
export const isRunningOnHeroku = (): boolean => {
  return typeof window !== 'undefined' && window.location.hostname.includes('herokuapp.com');
};

/**
 * Use development authentication on Heroku, but only in specific
 * debug scenarios or when explicitly enabled
 */
export const setupHerokuDevAuth = (): boolean => {
  // Check if the special "enable-dev-auth" query parameter is present
  const enableDevAuth =
    typeof window !== 'undefined' && window.location.search.includes('enable-dev-auth=true');

  // Only allow dev auth if explicitly enabled via query param
  if (isRunningOnHeroku() && enableDevAuth && !localStorage.getItem('token')) {
    logger.debug('Setting up development authentication for Heroku');
    localStorage.setItem('token', 'dev-jwt-token');
    localStorage.setItem('user', JSON.stringify(createDevelopmentUser()));

    // Remove the query parameter to avoid reapplying dev auth on refresh
    if (typeof window !== 'undefined') {
      const newUrl =
        window.location.pathname +
        window.location.search.replace(/[?&]enable-dev-auth=true/, '') +
        window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }

    return true;
  }
  return false;
};
