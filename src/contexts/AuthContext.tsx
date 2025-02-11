import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { AuthResponse } from '../api/types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthResponse['user'] | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!username || !password) {
        throw new Error('请输入用户名和密码');
      }
      
      const response = await authAPI.login({ username, password });
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('Login successful:', response.user.username);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : '登录失败，请重试');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Validate token on mount and after token changes
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        const isValid = await authAPI.validateToken(token);
        if (!isValid) {
          throw new Error('Invalid token');
        }
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Session validation failed:', err);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
      }
    };

    validateSession();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        error, 
        user,
        login, 
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
