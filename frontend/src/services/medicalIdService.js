/**
 * Medical ID Service Module
 * Handles API calls for medical information and emergency contacts.
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
 * Get the current user's medical ID information.
 * 
 * @returns {Promise<Object>} Medical ID data
 * @throws {Error} If the request fails
 */
export const getMedicalID = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/medical-id`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    if (response.status === 404) {
      return null; // Medical ID not found
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch medical ID');
    }

    return await response.json();
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      console.error('Error fetching medical ID:', error);
    }
    throw error;
  }
};

/**
 * Create a new medical ID record.
 * 
 * @param {Object} medicalData - Medical information and emergency contacts
 * @returns {Promise<Object>} Created medical ID data
 * @throws {Error} If the request fails
 */
export const createMedicalID = async (medicalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/medical-id`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(medicalData),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create medical ID');
    }

    return await response.json();
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      console.error('Error creating medical ID:', error);
    }
    throw error;
  }
};

/**
 * Update the current user's medical ID information.
 * 
 * @param {Object} medicalData - Updated medical information and emergency contacts
 * @returns {Promise<Object>} Updated medical ID data
 * @throws {Error} If the request fails
 */
export const updateMedicalID = async (medicalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/medical-id`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(medicalData),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update medical ID');
    }

    return await response.json();
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      console.error('Error updating medical ID:', error);
    }
    throw error;
  }
};

/**
 * Delete the current user's medical ID information.
 * 
 * @returns {Promise<Object>} Success message
 * @throws {Error} If the request fails
 */
export const deleteMedicalID = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/medical-id`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete medical ID');
    }

    return await response.json();
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      console.error('Error deleting medical ID:', error);
    }
    throw error;
  }
};
