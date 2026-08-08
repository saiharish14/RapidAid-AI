/**
 * Location Service
 * 
 * Handles browser Geolocation API and distance calculations.
 * Phase 2 – Milestone 3 implementation.
 */

/**
 * Get user's current location using Geolocation API
 * 
 * @returns {Promise<Object>} User's coordinates { latitude, longitude }
 * @throws {Error} If location access is denied or fails
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Convert degrees to radians
 * 
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Format distance for display
 * 
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

/**
 * Reverse geocode coordinates to get location details with landmark support
 * Prioritizes universities, colleges, hospitals, and landmarks
 * 
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object>} Location object with city, landmark, and formatted display
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      return {
        city: 'Location unavailable',
        landmark: '',
        display: 'Location unavailable'
      };
    }

    const address = data.address;
    const locationParts = [];

    // Extract landmark with priority: university/college > hospital > building > amenity > shop > tourism > leisure > office
    let landmark = '';
    
    // Priority 1: Educational institutions
    if (address.university) landmark = address.university;
    else if (address.college) landmark = address.college;
    else if (address.school) landmark = address.school;
    
    // Priority 2: Healthcare facilities
    else if (address.hospital) landmark = address.hospital;
    else if (address.clinic) landmark = address.clinic;
    
    // Priority 3: Other landmarks
    else if (address.building) landmark = address.building;
    else if (address.amenity) landmark = address.amenity;
    else if (address.shop) landmark = address.shop;
    else if (address.tourism) landmark = address.tourism;
    else if (address.leisure) landmark = address.leisure;
    else if (address.office) landmark = address.office;

    // Priority order for location: Village > Town > City > Hamlet > Suburb > District > State
    if (address.village) locationParts.push(address.village);
    else if (address.town) locationParts.push(address.town);
    else if (address.city) locationParts.push(address.city);
    else if (address.hamlet) locationParts.push(address.hamlet);
    else if (address.suburb) locationParts.push(address.suburb);

    if (address.district) locationParts.push(address.district);
    if (address.state) locationParts.push(address.state);

    if (locationParts.length === 0) {
      return {
        city: 'Location unavailable',
        landmark: '',
        display: 'Location unavailable'
      };
    }

    const city = locationParts.join(', ');
    
    // Format display: if landmark exists, show "Landmark\nCity", otherwise just "City"
    const display = landmark ? `${landmark}\n${city}` : city;

    return {
      city: city,
      landmark: landmark,
      display: display
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      city: 'Location unavailable',
      landmark: '',
      display: 'Location unavailable'
    };
  }
};
