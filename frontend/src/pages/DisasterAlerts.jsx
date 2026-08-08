/**
 * Disaster Alerts Page Component
 * 
 * Displays disaster alerts and emergency information.
 * Phase 2 – Milestone 1 implementation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWater, 
  FaWind, 
  FaTemperatureHigh, 
  FaCloudRain, 
  FaBolt, 
  FaExclamationTriangle,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaClock,
  FaTimes,
  FaPhone,
  FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { getDisasterAlerts } from '../services/disasterAlertsService';
import '../css/DisasterAlerts.css';

function DisasterAlerts() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getIconForAlert = (title) => {
    if (title.toLowerCase().includes('rain') || title.toLowerCase().includes('flood')) {
      return <FaWater />;
    }
    if (title.toLowerCase().includes('cyclone') || title.toLowerCase().includes('wind')) {
      return <FaWind />;
    }
    if (title.toLowerCase().includes('heat') || title.toLowerCase().includes('temperature')) {
      return <FaTemperatureHigh />;
    }
    if (title.toLowerCase().includes('thunder') || title.toLowerCase().includes('bolt')) {
      return <FaBolt />;
    }
    return <FaCloud />;
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDisasterAlerts();
        if (data.success && data.alerts) {
          setAlerts(data.alerts);
        } else {
          setError('Failed to load disaster alerts');
        }
      } catch (err) {
        setError('Failed to connect to disaster alerts service');
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low':
        return '#22c55e';
      case 'Medium':
        return '#f59e0b';
      case 'High':
        return '#ef4444';
      case 'Critical':
        return '#991b1b';
      default:
        return '#6b7280';
    }
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAlert(null);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="disaster-alerts-page">
        <div className="container">
          <div className="page-header">
            <FaShieldAlt className="page-icon" />
            <h1 className="page-title">Disaster Alerts</h1>
            <p className="page-subtitle">Stay informed about emergencies and natural disasters in your area.</p>
          </div>

        {loading && (
          <div className="loading-state">
            <FaShieldAlt className="loading-shield" />
            <p>Checking for latest disaster alerts...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <FaExclamationTriangle className="error-icon" />
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="empty-state">
            <FaShieldAlt className="empty-icon" />
            <h2>You're Safe!</h2>
            <p>No disaster alerts are active in your area.</p>
          </div>
        )}

        {!loading && !error && alerts.length > 0 && (
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <div key={alert.id} className="alert-card">
                <div className="alert-header">
                  <div className="alert-icon-wrapper" style={{ color: getSeverityColor(alert.severity) }}>
                    {getIconForAlert(alert.title)}
                  </div>
                  <div className="alert-title-section">
                    <h3 className="alert-title">{alert.title}</h3>
                    <span 
                      className="severity-badge" 
                      style={{ 
                        backgroundColor: getSeverityColor(alert.severity),
                        color: 'white'
                      }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
                
                <div className="alert-body">
                  <p className="alert-description">{alert.description}</p>
                </div>

                <div className="alert-footer">
                  <div className="footer-info">
                    <div className="footer-item">
                      <FaMapMarkerAlt className="footer-icon" />
                      <span>{alert.location}</span>
                    </div>
                    <div className="footer-item">
                      <FaClock className="footer-icon" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                  <button 
                    className="view-details-button"
                    onClick={() => handleViewDetails(alert)}
                    style={{ color: getSeverityColor(alert.severity) }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {showModal && selectedAlert && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-wrapper" style={{ color: getSeverityColor(selectedAlert.severity) }}>
                {getIconForAlert(selectedAlert.title)}
              </div>
              <div className="modal-title-section">
                <h2 className="modal-title">{selectedAlert.title}</h2>
                <span 
                  className="modal-severity-badge" 
                  style={{ 
                    backgroundColor: getSeverityColor(selectedAlert.severity),
                    color: 'white'
                  }}
                >
                  {selectedAlert.severity}
                </span>
              </div>
              <button className="modal-close-button" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-info-row">
                  <FaMapMarkerAlt className="modal-info-icon" />
                  <div>
                    <span className="modal-info-label">Affected Location</span>
                    <span className="modal-info-value">{selectedAlert.location}</span>
                  </div>
                </div>
                <div className="modal-info-row">
                  <FaClock className="modal-info-icon" />
                  <div>
                    <span className="modal-info-label">Issued</span>
                    <span className="modal-info-value">{selectedAlert.time}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3 className="modal-section-title">Description</h3>
                <p className="modal-description">{selectedAlert.description}</p>
              </div>

              <div className="modal-section">
                <h3 className="modal-section-title">Potential Risks</h3>
                <ul className="modal-list">
                  <li className="modal-list-item">Flash Flooding</li>
                  <li className="modal-list-item">Road Closures</li>
                  <li className="modal-list-item">Power Interruptions</li>
                  <li className="modal-list-item">Transportation Delays</li>
                </ul>
              </div>

              <div className="modal-section">
                <h3 className="modal-section-title">Safety Recommendations</h3>
                <ul className="modal-list">
                  <li className="modal-list-item"><FaCheckCircle className="list-icon" /> Move to higher ground if flooding begins.</li>
                  <li className="modal-list-item"><FaCheckCircle className="list-icon" /> Keep your emergency kit ready.</li>
                  <li className="modal-list-item"><FaCheckCircle className="list-icon" /> Avoid driving through flooded roads.</li>
                  <li className="modal-list-item"><FaCheckCircle className="list-icon" /> Charge your mobile devices.</li>
                  <li className="modal-list-item"><FaCheckCircle className="list-icon" /> Follow official government advisories.</li>
                  <li className="modal-list-item"><FaCheckCircle className="list-icon" /> Keep emergency contact numbers accessible.</li>
                </ul>
              </div>

              <div className="modal-section emergency-section">
                <h3 className="modal-section-title">Emergency Helpline</h3>
                <div className="emergency-contact">
                  <FaPhone className="emergency-icon" />
                  <div>
                    <span className="emergency-label">National Disaster Response Force (NDRF)</span>
                    <span className="emergency-number">1078</span>
                  </div>
                </div>
                <div className="emergency-contact">
                  <FaPhone className="emergency-icon" />
                  <div>
                    <span className="emergency-label">Emergency Services</span>
                    <span className="emergency-number">112</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <span className="last-updated">
                  <FaClock className="last-updated-icon" />
                  Last Updated: Today • 15 Minutes Ago
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisasterAlerts;

