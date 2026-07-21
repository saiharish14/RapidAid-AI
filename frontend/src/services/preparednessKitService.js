/**
 * Preparedness Kit Service Module
 * Handles API calls for emergency preparedness checklist management.
 */

import authService from './authService';
import { API_BASE_URL } from './apiConfig';

/**
 * Handle authentication errors by clearing session and redirecting to login
 */
const handleAuthError = () => {
  // Clear all authentication data
  authService.logout();
  
  // Clear sessionStorage as well
  sessionStorage.clear();
  
  // Show professional alert
  alert('Your session has expired. Please log in again.');
  
  // Redirect to login page
  window.location.href = '/login';
};

/**
 * Get the current user's preparedness kit checklist.
 * 
 * @returns {Promise<Object>} Preparedness kit data
 * @throws {Error} If the request fails
 */
export const getPreparednessKit = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/preparedness-kit`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    if (response.status === 404) {
      return null; // Preparedness kit not found
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch preparedness kit');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      console.error('Error fetching preparedness kit:', error);
    }
    throw error;
  }
};

/**
 * Create a new preparedness kit record.
 * 
 * @param {Object} kitData - Checklist and completion percentage
 * @returns {Promise<Object>} Created preparedness kit data
 * @throws {Error} If the request fails
 */
export const createPreparednessKit = async (kitData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/preparedness-kit`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(kitData),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create preparedness kit');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      console.error('Error creating preparedness kit:', error);
    }
    throw error;
  }
};

/**
 * Update the current user's preparedness kit checklist.
 * 
 * @param {Object} kitData - Updated checklist and completion percentage
 * @returns {Promise<Object>} Updated preparedness kit data
 * @throws {Error} If the request fails
 */
export const updatePreparednessKit = async (kitData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/preparedness-kit`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(kitData),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update preparedness kit');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      console.error('Error updating preparedness kit:', error);
    }
    throw error;
  }
};

/**
 * Delete the current user's preparedness kit.
 * 
 * @returns {Promise<Object>} Success message
 * @throws {Error} If the request fails
 */
export const deletePreparednessKit = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/preparedness-kit`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete preparedness kit');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      console.error('Error deleting preparedness kit:', error);
    }
    throw error;
  }
};
