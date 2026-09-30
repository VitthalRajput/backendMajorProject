import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login', // 'login' | 'register'
    callback: null,
  });

  // Verify and fetch current user on initial mount
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    // data is { user, accessToken, refreshToken }
    if (data?.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    if (data?.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    if (authModal.callback) {
      authModal.callback();
    }
    closeAuthModal();
    return data?.user;
  };

  const register = async (formData) => {
    const createdUser = await authApi.register(formData);
    return createdUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const refreshUser = async () => {
    try {
      const refreshed = await authApi.getCurrentUser();
      if (refreshed) {
        setUser(refreshed);
        localStorage.setItem('user', JSON.stringify(refreshed));
      }
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const openAuthModal = (mode = 'login', callback = null) => {
    setAuthModal({
      isOpen: true,
      mode,
      callback,
    });
  };

  const closeAuthModal = () => {
    setAuthModal({
      isOpen: false,
      mode: 'login',
      callback: null,
    });
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    refreshUser,
    authModal,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
