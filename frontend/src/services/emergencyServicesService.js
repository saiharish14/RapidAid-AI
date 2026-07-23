/**
 * Emergency Services Service
 * 
 * Handles API calls for emergency services data.
 * Phase 2 – Milestone 2 implementation.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getEmergencyServices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emergency-services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching emergency services:', error);
    throw error;
  }
};
