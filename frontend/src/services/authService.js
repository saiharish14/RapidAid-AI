/**
 * Authentication Service
 * Handles API communication for user authentication operations.
 * 
 * This service contains functions for:
 * - User registration (POST /api/auth/register)
 * - User login (POST /api/auth/login)
 * - User logout (Clear local storage)
 * - Token storage in localStorage
 * - Error handling for authentication failures
 */

import { API_BASE_URL } from './apiConfig';

const TOKEN_KEY = 'rapidaid_token';
const USER_KEY = 'rapidaid_user';

/**
 * Register a new user account
 * @param {Object} userData - User registration data
 * @param {string} userData.full_name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} Response data with user information
 */
const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // Surface non-JSON server messages as errors
      throw new Error(text || 'Registration failed: server returned non-JSON response');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Authenticate user and receive JWT token
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Response data with access token and user info
 */
const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Login failed: server returned non-JSON response');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token and user data in localStorage
    if (data.data && data.data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user and clear authentication state
 */
const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get stored JWT token
 * @returns {string|null} JWT token or null if not logged in
 */
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored user data
 * @returns {Object|null} User data or null if not logged in
 */
const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get authorization header for API requests
 * @returns {Object} Headers object with Authorization header
 */
const getAuthHeaders = () => {
  const token = getToken();
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};

const resetPassword = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Reset password failed: server returned non-JSON response');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Reset password failed');
    }

    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export default {
  register,
  login,
  logout,
  resetPassword,
  getToken,
  getUser,
  isAuthenticated,
  getAuthHeaders,
};
