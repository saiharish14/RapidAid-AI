/**
 * Emergency Services Page Component
 * 
 * Displays nearby emergency services with navigation and call functionality.
 * Phase 2 – Milestone 2 implementation.
 */

import React, { useState, useEffect } from 'react';
import { 
  FaHospital, 
  FaAmbulance, 
  FaShieldAlt, 
  FaFireExtinguisher, 
  FaPrescriptionBottle,
  FaMapMarkerAlt,
  FaPhone,
  FaStar,
  FaClock,
  FaLocationArrow,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { fetchNearbyPlaces } from '../services/nearbyPlacesService';
import { getUserLocation, calculateDistance, formatDistance, reverseGeocode } from '../services/locationService';
import '../css/EmergencyServices.css';

function EmergencyServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [cityName, setCityName] = useState('');
  const [searchRadius, setSearchRadius] = useState(10);
  const [searchMessage, setSearchMessage] = useState('');

  const categories = ['All', 'Hospital', 'Ambulance', 'Police', 'Fire Station', 'Pharmacy'];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Hospital':
        return <FaHospital />;
      case 'Ambulance':
        return <FaAmbulance />;
      case 'Police':
        return <FaShieldAlt />;
      case 'Fire Station':
        return <FaFireExtinguisher />;
      case 'Pharmacy':
        return <FaPrescriptionBottle />;
      default:
        return <FaHospital />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Hospital':
        return '#2563eb';
      case 'Ambulance':
        return '#dc2626';
      case 'Police':
        return '#1e3a8a';
      case 'Fire Station':
        return '#ea580c';
      case 'Pharmacy':
        return '#16a34a';
      default:
        return '#6b7280';
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setLocationLoading(true);
        setLocationError(null);
        const location = await getUserLocation();
        setUserLocation(location);
        
        const city = await reverseGeocode(location.latitude, location.longitude);
        setCityName(city);
        setLocationDenied(false);
      } catch (err) {
        console.error('Location error:', err);
        setLocationError(err.message);
        setLocationDenied(true);
      } finally {
        setLocationLoading(false);
      }
    };

    initializeLocation();
  }, []);

  useEffect(() => {
    const fetchServicesWithProgressiveRadius = async () => {
      try {
        setLoading(true);
        setError(null);
        setSearchMessage('');
        
        if (!userLocation) {
          return;
        }
        
        const radii = [10, 25, 50, 100];
        let allPlaces = [];
        let currentRadius = 10;
        
        for (const radius of radii) {
          setSearchRadius(radius);
          setSearchMessage(`Searching within ${radius} km...`);
          
          const places = await fetchNearbyPlaces(userLocation.latitude, userLocation.longitude, radius);
          
          if (places.length > 0) {
            allPlaces = places;
            currentRadius = radius;
            setSearchMessage(`Showing nearby services within ${radius} km.`);
            break;
          } else {
            if (radius < 100) {
              setSearchMessage(`No services found within ${radius} km.\nExpanded search to ${radii[radii.indexOf(radius) + 1]} km.`);
              // Small delay to show the message
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        if (allPlaces.length === 0) {
          setSearchMessage('No emergency services were found within 100 km.');
        }
        
        const servicesWithRating = allPlaces.map(place => ({
          ...place,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1)
        }));
        
        setServices(servicesWithRating);
      } catch (err) {
        setError('Unable to load nearby emergency services.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchServicesWithProgressiveRadius();
    }
  }, [userLocation]);

  const handleRetryLocation = () => {
    setLocationDenied(false);
    setLocationError(null);
    setUserLocation(null);
    setLocationLoading(true);
    
    const initializeLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        
        const city = await reverseGeocode(location.latitude, location.longitude);
        setCityName(city);
        setLocationDenied(false);
      } catch (err) {
        console.error('Location error:', err);
        setLocationError(err.message);
        setLocationDenied(true);
      } finally {
        setLocationLoading(false);
      }
    };
    
    initializeLocation();
  };

  const handleRetryServices = () => {
    setError(null);
    setLoading(true);
    setSearchMessage('');
    
    const fetchServicesWithProgressiveRadius = async () => {
      try {
        if (!userLocation) {
          return;
        }
        
        const radii = [10, 25, 50, 100];
        let allPlaces = [];
        let currentRadius = 10;
        
        for (const radius of radii) {
          setSearchRadius(radius);
          setSearchMessage(`Searching within ${radius} km...`);
          
          const places = await fetchNearbyPlaces(userLocation.latitude, userLocation.longitude, radius);
          
          if (places.length > 0) {
            allPlaces = places;
            currentRadius = radius;
            setSearchMessage(`Showing nearby services within ${radius} km.`);
            break;
          } else {
            if (radius < 100) {
              setSearchMessage(`No services found within ${radius} km.\nExpanded search to ${radii[radii.indexOf(radius) + 1]} km.`);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        if (allPlaces.length === 0) {
          setSearchMessage('No emergency services were found within 100 km.');
        }
        
        const servicesWithRating = allPlaces.map(place => ({
          ...place,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1)
        }));
        
        setServices(servicesWithRating);
      } catch (err) {
        setError('Unable to load nearby emergency services.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServicesWithProgressiveRadius();
  };

  const handleNavigate = (service) => {
    if (!userLocation) {
      alert('Location required for navigation');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${service.latitude},${service.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const filteredServices = selectedCategory === 'All' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="star half" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  return (
    <div className="page">
      <Navbar />
      <div className="emergency-services-page">
        <div className="container">
          <div className="page-header">
            <FaLocationArrow className="page-icon" />
            <h1 className="page-title">Nearby Emergency Services</h1>
            <p className="page-subtitle">Find hospitals, police, fire stations, and pharmacies near you</p>
          </div>

          {locationLoading && (
            <div className="location-loading-state">
              <FaLocationArrow className="loading-icon" />
              <p>Detecting your location...</p>
              <p className="loading-subtitle">Please allow location permission.</p>
            </div>
          )}

          {locationDenied && !locationLoading && (
            <div className="location-error-card">
              <FaExclamationTriangle className="error-icon" />
              <div className="error-content">
                <h3>Location Access Denied</h3>
                <p>Enable location permission to view nearby emergency services.</p>
                <button className="retry-location-button" onClick={handleRetryLocation}>
                  <FaSync className="button-icon" />
                  Retry Location
                </button>
              </div>
            </div>
          )}

          {!locationLoading && !locationDenied && userLocation && cityName && (
            <div className="location-display">
              <FaMapMarkerAlt className="location-icon" />
              <span className="location-label">Your Location</span>
              <span className="location-value">{cityName}</span>
            </div>
          )}

          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category !== 'All' && (
                  <span className="category-icon" style={{ color: getCategoryColor(category) }}>
                    {getCategoryIcon(category)}
                  </span>
                )}
                {category}
              </button>
            ))}
          </div>

          {searchMessage && (
            <div className="search-radius-banner">
              <FaLocationArrow className="banner-icon" />
              <span style={{ whiteSpace: 'pre-line' }}>{searchMessage}</span>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <FaLocationArrow className="loading-icon" />
              <p>Finding nearby emergency services...</p>
            </div>
          )}

          {loading && !locationLoading && (
            <div className="services-grid">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="service-card skeleton">
                  <div className="service-header">
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-text skeleton-title"></div>
                    <div className="skeleton-badge"></div>
                  </div>
                  <div className="service-body">
                    <div className="skeleton-rating"></div>
                    <div className="skeleton-detail"></div>
                    <div className="skeleton-detail"></div>
                  </div>
                  <div className="service-footer">
                    <div className="skeleton-button"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-button" onClick={handleRetryServices}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && !locationLoading && (
            <div className="services-grid">
              {filteredServices.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <div 
                      className="service-icon-wrapper"
                      style={{ color: getCategoryColor(service.category) }}
                    >
                      {getCategoryIcon(service.category)}
                    </div>
                    <div className="service-info">
                      <h3 className="service-name">{service.name}</h3>
                      <span className="service-category">{service.category}</span>
                    </div>
                    <div className="service-status">
                      <span className={`status-badge ${service.isOpen ? 'open' : 'closed'}`}>
                        <FaClock className="status-icon" />
                        {service.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  <div className="service-body">
                    <div className="service-rating">
                      <div className="stars">
                        {renderStars(service.rating)}
                      </div>
                      <span className="rating-value">{service.rating}</span>
                    </div>

                    <div className="service-details">
                      <div className="detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span className="detail-text">{service.formattedDistance || service.distance}</span>
                      </div>
                      <div className="detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span className="detail-text address">{service.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="service-footer">
                    <button 
                      className="action-button navigate-button"
                      onClick={() => handleNavigate(service)}
                    >
                      <FaMapMarkerAlt className="button-icon" />
                      Navigate
                    </button>
                    <button 
                      className="action-button call-button"
                      onClick={() => handleCall(service.phone)}
                    >
                      <FaPhone className="button-icon" />
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && !locationLoading && filteredServices.length === 0 && (
            <div className="empty-state">
              <FaLocationArrow className="empty-icon" />
              <h2>No emergency services were found within 100 km.</h2>
              <p>Try enabling location permissions or search again later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmergencyServices;
