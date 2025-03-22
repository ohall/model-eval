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
      await checkAuth();
      setIsLoading(false);
    };
    
    checkToken();
  }, []);

  const login = (token: string, userData: any) => {
    // Save token to localStorage
    localStorage.setItem('auth_token', token);
    
    // Set user state
    setUser(userData);
    
    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    
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