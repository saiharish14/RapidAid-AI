/**
 * Report Service
 * Handles API communication for AI report retrieval and deletion.
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
 * Fetch all AI reports from the backend.
 * 
 * @returns {Promise<Array>} Array of report objects ordered by creation date (newest first)
 * @throws {Error} If the API request fails
 */
export const getReports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    // Handle 401 Unauthorized (expired/invalid token)
    if (response.status === 401) {
      console.log('Authentication failed - handling auth error');
      handleAuthError();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error('Failed to retrieve reports');
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Delete a specific AI report.
 * 
 * @param {number} reportId - ID of the report to delete
 * @returns {Promise<void>} 
 * @throws {Error} If the API request fails
 */
export const deleteReport = async (reportId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    // Handle 401 Unauthorized (expired/invalid token)
    if (response.status === 401) {
      console.log('Authentication failed - handling auth error');
      handleAuthError();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return;
    } else {
      throw new Error(data.message || 'Failed to delete report');
    }
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

/**
 * Format timestamp to user-friendly date string.
 * 
 * @param {string} isoString - ISO 8601 datetime string
 * @returns {string} Formatted date string (e.g., "July 18, 2026 at 6:56 PM")
 */
export const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get severity color based on severity level.
 * 
 * @param {string} severity - Severity level (mild, moderate, severe, emergency)
 * @returns {string} CSS color value
 */
export const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
    case 'mild':
      return '#4CAF50';
    case 'moderate':
      return '#FF9800';
    case 'severe':
    case 'emergency':
      return '#F44336';
    default:
      return '#2196F3';
  }
};
