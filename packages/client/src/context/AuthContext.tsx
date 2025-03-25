import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setupHerokuDevAuth, isRunningOnHeroku } from '../utils/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Auto-setup dev auth on Heroku if needed
    if (isRunningOnHeroku()) {
      console.log('Running on Heroku environment, checking auth setup...');
      setupHerokuDevAuth();
    }

    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Restored auth session:', {
          tokenLength: storedToken.length,
          tokenPreview: storedToken.substring(0, 10) + '...',
          user: parsedUser,
        });
        setUser(parsedUser);
        setToken(storedToken);

        // Set up axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('No stored auth session found');

      // If on Heroku and no session found, try setting up dev auth
      if (isRunningOnHeroku()) {
        const didSetup = setupHerokuDevAuth();
        if (didSetup) {
          // Reload the page to apply the new auth
          window.location.reload();
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    console.log('Login called with:', {
      tokenLength: newToken.length,
      tokenPreview: newToken.substring(0, 10) + '...',
      user: userData,
    });

    setUser(userData);
    setToken(newToken);

    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', newToken);

    // Set up axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    console.log('Authentication set up complete');
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
