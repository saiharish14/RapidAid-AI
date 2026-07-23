/**
 * Disaster Alerts Service Module
 * Handles API calls for disaster alerts.
 */

import { API_BASE_URL } from './apiConfig';

/**
 * Get disaster alerts from backend
 * @returns {Promise<Object>} Disaster alerts data
 * @throws {Error} If the request fails
 */
export const getDisasterAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/disaster-alerts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Failed to fetch disaster alerts: server returned non-JSON response');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch disaster alerts');
    }

    return data;
  } catch (error) {
    console.error('Error fetching disaster alerts:', error);
    throw error;
  }
};
