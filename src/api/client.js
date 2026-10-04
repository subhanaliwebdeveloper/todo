/**
 * Axios HTTP API Client
 * Configured with request interceptors (JWT injection) and response interceptors (401 logout & error handling).
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from './config';

// Create configured Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor:
 * Automatically reads the JWT Bearer token from AsyncStorage and adds it to the headers.
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API Request Interceptor]: Error reading auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Catches 401 Unauthorized errors to purge expired session, and formats friendly error messages.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 Unauthorized, purge stored credentials
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@auth_user');
      } catch (err) {
        console.error('[API Response Interceptor]: Error clearing auth storage:', err);
      }
    }

    // Determine user-friendly error message
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      friendlyMessage = 'Server request timed out. Please check your connection.';
    } else if (error.response?.data?.message) {
      friendlyMessage = error.response.data.message;
    } else if (error.request && !error.response) {
      friendlyMessage = 'Cannot reach server. Please check your network connection and ensure the backend is running.';
    }

    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export default apiClient;
