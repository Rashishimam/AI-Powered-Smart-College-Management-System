import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusiq_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage or verify token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campusiq_token');
      const storedUser = localStorage.getItem('campusiq_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('campusiq_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, clearing auth:', err.message);
          localStorage.removeItem('campusiq_token');
          localStorage.removeItem('campusiq_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.success) {
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('campusiq_token', newToken);
      localStorage.setItem('campusiq_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.data?.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('campusiq_token');
    localStorage.removeItem('campusiq_user');
    setUser(null);
    setToken(null);
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isCollegeAdmin = user?.role === 'college_admin';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isSuperAdmin,
        isCollegeAdmin,
        isFaculty,
        isStudent,
        isAuthenticated: !!user
      }}
    >
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
