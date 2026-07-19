/**
 * Analyze Service
 * Handles API communication for symptom analysis.
 */

import authService from './authService';

const API_BASE_URL = '';

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
 * Submit symptoms for AI analysis. 
 * 
 * @param {Object} symptomData - Symptom analysis data
 * @param {string} symptomData.symptoms - User's symptom description
 * @param {string} symptomData.severity - Severity level (mild, moderate, severe)
 * @param {string} symptomData.allergies - Known allergies (optional)
 * @returns {Promise<Object>} Analysis results from AI
 * @throws {Error} If the API request fails
 */
export const analyzeSymptoms = async (symptomData) => {
  try {
    console.log('Starting analyzeSymptoms with data:', symptomData);
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(symptomData),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Handle 401 Unauthorized (expired/invalid token)
    if (response.status === 401) {
      console.log('Authentication failed - handling auth error');
      handleAuthError();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error('Failed to analyze symptoms - invalid response format');
    }
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
};
