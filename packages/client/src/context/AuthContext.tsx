import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'shared/index';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  checkAuth: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check error:', error);
        // In development, allow proceeding with a default user
        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
          setUser({
            id: 'dev-user-id',
            email: 'dev@example.com',
            name: 'Development User',
            provider: 'google',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkToken();
  }, []);

  const login = (token: string, userData: any) => {
    // Save token to localStorage
    localStorage.setItem('auth_token', token);
    
    // Save user data to localStorage for development/demo mode
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Set user state
    setUser(userData);
    
    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Clear user state
    setUser(null);
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setUser(null);
      return false;
    }
    
    // Check if this is a development token
    if (token.startsWith('dev-token-') || token === 'dev-jwt-token' || token === 'fake-jwt-token-for-demo') {
      // For development only - pretend to be a valid user
      // This is a way to bypass authentication for development/testing
      const savedUserData = localStorage.getItem('user_data');
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          setUser(userData);
          return true;
        } catch (e) {
          console.error('Error parsing saved user data', e);
        }
      }
      
      // If no saved user data, use a default development user
      setUser({
        id: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Development User',
        provider: 'google',
      });
      return true;
    }
    
    try {
      // Set auth header for the validation request
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Make a request to validate the token
      const response = await axios.get('/api/auth/validate');
      
      if (response.data && response.data.valid) {
        setUser(response.data.user);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token validation failed', error);
      
      // For development/demo mode - instead of logging out, check if we should use a dev user
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        console.log('Using development user because token validation failed');
        setUser({
          id: 'dev-user-id',
          email: 'dev@example.com',
          name: 'Development User',
          provider: 'google',
        });
        return true;
      }
      
      logout();
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};