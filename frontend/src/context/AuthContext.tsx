import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shopease_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('shopease_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state with storage and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('shopease_token');
      if (storedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('shopease_user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('Session expired or invalid, logging out');
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleAuthChange = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res: AuthResponse = await authService.login(credentials);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('shopease_token', res.token);
    localStorage.setItem('shopease_user', JSON.stringify(res.user));
  };

  const register = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    const res: AuthResponse = await authService.register(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('shopease_token', res.token);
    localStorage.setItem('shopease_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shopease_token');
    localStorage.removeItem('shopease_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

