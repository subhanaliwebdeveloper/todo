/**
 * Authentication Context
 * Manages global user authentication state, AsyncStorage token persistence, and sign-in/up actions.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state on app startup
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Action loading state
  const [error, setError] = useState(null);

  /**
   * Restore stored session from AsyncStorage on app launch
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@auth_token');
        const storedUser = await AsyncStorage.getItem('@auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('[AuthContext] Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Register a new user
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   */
  const register = async (name, email, password) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;

      // Save credentials in AsyncStorage for persistent login
      await AsyncStorage.setItem('@auth_token', receivedToken);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (err) {
      const msg = err.friendlyMessage || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Login an existing user
   * @param {string} email 
   * @param {string} password 
   */
  const login = async (email, password) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;

      // Save credentials in AsyncStorage
      await AsyncStorage.setItem('@auth_token', receivedToken);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (err) {
      const msg = err.friendlyMessage || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Logout user and clear stored credentials
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@auth_user');
      setToken(null);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('[AuthContext] Error during logout:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticating,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

export default AuthContext;
