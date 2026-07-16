import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data && response.data.success) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Reset user state if an unauthorized API status occurs
    const handleUnauthorized = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { access_token } = response.data.data;
        localStorage.setItem('token', access_token);
        
        // Fetch full profile info
        const meResponse = await apiClient.get('/auth/me');
        setUser(meResponse.data.data);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', { email, password });
      if (response.data && response.data.success) {
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Registration failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
