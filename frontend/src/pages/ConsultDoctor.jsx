import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaPhone, FaLocationArrow, FaVideo, FaClock, FaArrowLeft } from 'react-icons/fa';
import '../css/ConsultDoctor.css';

const ConsultDoctor = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser');
        }

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });

        // Fetch nearby hospitals and clinics
        await fetchNearbyHospitals(position.coords.latitude, position.coords.longitude);
      } catch (err) {
        console.error('Location error:', err);
        setLocationError(err.message);
        setLoading(false);
      }
    };

    initializeLocation();
  }, []);

  const fetchNearbyHospitals = async (latitude, longitude) => {
    try {
      const radiusMeters = 10000; // 10 km radius
      
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
          way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
          node["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
          way["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
          node["amenity"="doctors"](around:${radiusMeters},${latitude},${longitude});
          way["amenity"="doctors"](around:${radiusMeters},${latitude},${longitude});
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
        throw new Error('Failed to fetch nearby hospitals');
      }

      const data = await response.json();
      
      if (!data || !data.elements) {
        setServices([]);
        setLoading(false);
        return;
      }

      const places = data.elements.map(element => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        const tags = element.tags || {};
        
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
          return null;
        }

        const name = tags.name || 'Hospital/Clinic';
        const phone = tags.phone || tags['contact:phone'] || null;
        
        // Calculate distance
        const distance = calculateDistance(latitude, longitude, lat, lon);
        
        return {
          id: element.id,
          name: name,
          type: tags.amenity === 'clinic' ? 'Clinic' : 'Hospital',
          latitude: lat,
          longitude: lon,
          distance: distance,
          formattedDistance: formatDistance(distance),
          phone: phone,
          address: tags['addr:street'] || tags['addr:city'] || 'Address not available'
        };
      }).filter(place => place !== null);

      // Sort by distance
      places.sort((a, b) => a.distance - b.distance);
      setServices(places);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const handleCall = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      alert('Phone number not available');
    }
  };

  const handleNavigate = (service) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="consult-doctor-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <button onClick={handleBack} className="back-button">
            <FaArrowLeft />
            Back
          </button>
          <h1 className="page-title">Consult Doctor</h1>
          <p className="page-subtitle">Find nearby hospitals and clinics for immediate care</p>
        </div>

        {/* Location Error */}
        {locationError && (
          <div className="error-card">
            <p>{locationError}</p>
            <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
          </div>
        )}

        {/* Loading State */}
        {loading && !locationError && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Finding nearby hospitals and clinics...</p>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !locationError && (
          <>
            {services.length > 0 ? (
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-header">
                      <div className="service-icon">
                        <FaHospital />
                      </div>
                      <div className="service-info">
                        <h3 className="service-name">{service.name}</h3>
                        <span className="service-type">{service.type}</span>
                      </div>
                    </div>
                    <div className="service-details">
                      <div className="service-detail">
                        <FaLocationArrow />
                        <span>{service.formattedDistance} away</span>
                      </div>
                      <div className="service-detail">
                        <span>{service.address}</span>
                      </div>
                    </div>
                    <div className="service-actions">
                      <button 
                        onClick={() => handleCall(service.phone)}
                        className="action-button call-button"
                        disabled={!service.phone}
                      >
                        <FaPhone />
                        Call
                      </button>
                      <button 
                        onClick={() => handleNavigate(service)}
                        className="action-button navigate-button"
                      >
                        <FaLocationArrow />
                        Navigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-services">
                <p>No hospitals or clinics found nearby.</p>
              </div>
            )}

            {/* Telemedicine Card */}
            <div className="telemedicine-card">
              <div className="telemedicine-icon">
                <FaVideo />
              </div>
              <div className="telemedicine-content">
                <h3 className="telemedicine-title">Telemedicine</h3>
                <p className="telemedicine-subtitle">Consult a doctor online from the comfort of your home</p>
                <div className="telemedicine-features">
                  <div className="feature">
                    <FaVideo />
                    <span>Video Consultation</span>
                  </div>
                  <div className="feature">
                    <FaClock />
                    <span>24/7 Availability</span>
                  </div>
                </div>
                <div className="coming-soon-badge">
                  <span>Coming Soon</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsultDoctor;
