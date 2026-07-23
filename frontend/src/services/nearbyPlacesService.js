/**
 * Nearby Places Service
 * 
 * Fetches real nearby emergency services using OpenStreetMap Overpass API.
 * Phase 2 – Milestone 4 implementation.
 */

import { calculateDistance, formatDistance } from './locationService';

/**
 * Fetch nearby places using OpenStreetMap Overpass API
 * 
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radius - Search radius in kilometers (default: 5)
 * @returns {Promise<Array>} Array of nearby places
 */
export const fetchNearbyPlaces = async (latitude, longitude, radius = 5) => {
  try {
    const radiusMeters = radius * 1000;
    
    // Overpass QL query to fetch nearby emergency services
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="police"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="police"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="fire_station"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="fire_station"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
      );
      out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error('Overpass API request failed');
    }

    const data = await response.json();
    
    if (!data || !data.elements) {
      return [];
    }

    // Process the results
    const places = data.elements.map(element => {
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      const tags = element.tags || {};
      
      // Determine category
      let category = 'Unknown';
      if (tags.amenity === 'hospital') category = 'Hospital';
      else if (tags.amenity === 'police') category = 'Police';
      else if (tags.amenity === 'fire_station') category = 'Fire Station';
      else if (tags.amenity === 'pharmacy') category = 'Pharmacy';

      // Filter out veterinary and animal hospitals
      const name = tags.name || '';
      const nameLower = name.toLowerCase();
      const isVeterinary = nameLower.includes('veterinary') || 
                          nameLower.includes('animal') || 
                          nameLower.includes('pet') || 
                          nameLower.includes('dog') || 
                          nameLower.includes('livestock') ||
                          tags.healthcare === 'veterinary' ||
                          tags.healthcare?.specialty === 'veterinary';
      
      if (isVeterinary) {
        return null;
      }

      // Validate coordinates
      if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        return null;
      }

      // Validate name
      if (!name || name.trim() === '') {
        return null;
      }

      // Calculate distance
      const distance = calculateDistance(latitude, longitude, lat, lon);
      
      // Build address
      const addressParts = [];
      if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
      if (tags['addr:street']) addressParts.push(tags['addr:street']);
      if (tags['addr:city']) addressParts.push(tags['addr:city']);
      if (tags['addr:suburb']) addressParts.push(tags['addr:suburb']);
      if (!addressParts.length && tags.name) addressParts.push(tags.name);

      const address = addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';

      // Validate address
      if (!address || address.trim() === '' || address === 'Address not available') {
        return null;
      }

      return {
        id: element.id,
        name: name,
        category: category,
        latitude: lat,
        longitude: lon,
        distance: distance,
        formattedDistance: formatDistance(distance),
        address: address,
        phone: tags.phone || tags['contact:phone'] || null,
        isOpen: tags.opening_hours ? true : true
      };
    }).filter(place => place !== null); // Remove null entries

    // Sort by distance (nearest first)
    places.sort((a, b) => a.distance - b.distance);

    return places;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
};

/**
 * Fetch nearby places by specific category
 * 
 * @param {string} category - Category to filter (Hospital, Police, Fire Station, Pharmacy)
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radius - Search radius in kilometers (default: 5)
 * @returns {Promise<Array>} Array of nearby places for the category
 */
export const fetchNearbyByCategory = async (category, latitude, longitude, radius = 5) => {
  try {
    const allPlaces = await fetchNearbyPlaces(latitude, longitude, radius);
    return allPlaces.filter(place => place.category === category);
  } catch (error) {
    console.error(`Error fetching nearby ${category}:`, error);
    throw error;
  }
};
