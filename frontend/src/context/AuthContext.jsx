import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and validate active session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('moodie_token');
      const storedUser = localStorage.getItem('moodie_user');

      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      // Preload cached user to prevent UI flash while validating with /auth/me
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch {
          // If corrupted, ignore
        }
      }

      try {
        const verifiedUser = await authService.getMe();
        if (isMounted) {
          setUser(verifiedUser);
          setToken(storedToken);
        }
      } catch (err) {
        if (!isMounted) return;

        // Check if user was blocked by admin (HTTP 403)
        if (err.status === 403 || err.response?.status === 403) {
          toast.error(err.message || 'Your account has been blocked. Please contact support.');
        }

        // Invalid, expired, or rejected session
        localStorage.removeItem('moodie_token');
        localStorage.removeItem('moodie_user');
        setUser(null);
        setToken(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const { user: loggedInUser, token: authToken } = await authService.login({
        email,
        password
      });
      setUser(loggedInUser);
      setToken(authToken);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { user: registeredUser, token: authToken } = await authService.register({
        name,
        email,
        password
      });
      setUser(registeredUser);
      setToken(authToken);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(
    user && (user.role === 'ADMIN' || user.role === 'admin' || String(user.role).toUpperCase() === 'ADMIN')
  );

  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
