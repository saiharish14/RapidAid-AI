/**
 * Smart Emergency Contacts Page Component
 * 
 * Displays emergency contacts from Medical ID with Call and SOS functionality.
 * Phase 2 – Milestone 3 implementation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPhone, 
  FaSms, 
  FaUser, 
  FaHeartbeat, 
  FaArrowRight,
  FaExclamationCircle
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { getMedicalID } from '../services/medicalIdService';
import '../css/SmartEmergencyContacts.css';

function SmartEmergencyContacts() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMedicalID();
      if (data && data.emergency_contacts && Array.isArray(data.emergency_contacts)) {
        setContacts(data.emergency_contacts);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('Error loading emergency contacts:', err);
      setError('Failed to load emergency contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadContacts();
    }
  }, [isAuthenticated]);

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSendSOS = (contact) => {
    const message = encodeURIComponent(`SOS! This is ${user?.full_name || 'a RapidAid AI user'}. I need immediate assistance. Please contact me urgently.`);
    window.location.href = `sms:${contact.phone}?body=${message}`;
  };

  const getContactLabel = (index) => {
    switch (index) {
      case 0:
        return 'Primary Contact';
      case 1:
        return 'Secondary Contact';
      default:
        return 'Backup Contact';
    }
  };

  const getContactColor = (index) => {
    switch (index) {
      case 0:
        return '#2563eb';
      case 1:
        return '#16a34a';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="smart-contacts-page">
        <div className="container">
          <div className="page-header">
            <FaHeartbeat className="page-icon" />
            <h1 className="page-title">Smart Emergency Contacts</h1>
            <p className="page-subtitle">Quick access to your emergency contacts with one-tap call and SOS messaging</p>
          </div>

          {loading && (
            <div className="loading-state">
              <FaHeartbeat className="loading-icon" />
              <p>Loading your emergency contacts...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <FaExclamationCircle className="error-icon" />
              <p>{error}</p>
              <button className="retry-button" onClick={loadContacts}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && contacts.length === 0 && (
            <div className="empty-state">
              <FaUser className="empty-icon" />
              <h2>No Emergency Contacts Found</h2>
              <p>You haven't added any emergency contacts to your Medical ID yet.</p>
              <button 
                className="go-to-medical-id-button"
                onClick={() => navigate('/medical-id')}
              >
                Go to Medical ID
                <FaArrowRight className="button-icon" />
              </button>
            </div>
          )}

          {!loading && !error && contacts.length > 0 && (
            <div className="contacts-grid">
              {contacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-header">
                    <div 
                      className="contact-icon-wrapper"
                      style={{ color: getContactColor(index) }}
                    >
                      <FaUser />
                    </div>
                    <div className="contact-info">
                      <span className="contact-label">{getContactLabel(index)}</span>
                      <h3 className="contact-name">{contact.name}</h3>
                      <span className="contact-relationship">{contact.relationship}</span>
                    </div>
                  </div>

                  <div className="contact-body">
                    <div className="contact-phone">
                      <FaPhone className="phone-icon" />
                      <span className="phone-number">{contact.phone}</span>
                    </div>
                  </div>

                  <div className="contact-footer">
                    <button 
                      className="action-button call-button"
                      onClick={() => handleCall(contact.phone)}
                    >
                      <FaPhone className="button-icon" />
                      Call
                    </button>
                    <button 
                      className="action-button sos-button"
                      onClick={() => handleSendSOS(contact)}
                    >
                      <FaSms className="button-icon" />
                      Send SOS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SmartEmergencyContacts;
