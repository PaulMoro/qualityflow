import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'qualityflow_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setIsLoadingAuth(true);
      setAuthError(null);

      // Load app public settings
      setAppPublicSettings({ id: 'qualityflow', public_settings: {} });
      setIsLoadingPublicSettings(false);

      // Check if user is already logged in (from localStorage)
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const login = async ({ email, display_name, method = 'email' }) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      // Create user object
      const userData = {
        email,
        display_name: display_name || email.split('@')[0],
        role: 'admin', // Default role
        method,
        loginAt: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Login failed'
      });
      setIsLoadingAuth(false);
      throw error;
    }
  };

  const logout = (shouldRedirect = true) => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);

    // Clear state
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      logout,
      navigateToLogin,
      checkAppState
    }}>
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
