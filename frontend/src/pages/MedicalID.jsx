/**
 * Medical ID Page Component
 * 
 * Allows users to store medical information and emergency contacts.
 * Phase 1 – Lesson 1.3 implementation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaPhone, FaEdit, FaTrash, FaPlus, FaSave, FaCheck, FaExclamationTriangle, FaIdCard, FaHeartbeat } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { getMedicalID, createMedicalID, updateMedicalID } from '../services/medicalIdService';
import '../css/MedicalID.css';

function MedicalID() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [medicalData, setMedicalData] = useState({
    blood_group: '',
    age: '',
    gender: '',
    allergies: '',
    medical_conditions: '',
    medications: '',
    emergency_contacts: []
  });
  const [cardData, setCardData] = useState({
    blood_group: '',
    age: '',
    gender: '',
    allergies: '',
    medical_conditions: '',
    medications: '',
    emergency_contacts: []
  });
  const [editingContact, setEditingContact] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: ''
  });

  const loadMedicalID = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMedicalID();
      if (data && typeof data === 'object') {
        const loadedData = {
          blood_group: data.blood_group || '',
          age: data.age || '',
          gender: data.gender || '',
          allergies: data.allergies || '',
          medical_conditions: data.medical_conditions || '',
          medications: data.medications || '',
          emergency_contacts: Array.isArray(data.emergency_contacts) ? data.emergency_contacts : []
        };
        setMedicalData(loadedData);
        setCardData(loadedData);
      }
    } catch (error) {
      console.error('Error loading medical ID:', error);
      setError('Failed to load medical information');
      // Continue with empty data - page will still render
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load data if user is authenticated
    if (isAuthenticated) {
      loadMedicalID();
    }
  }, [isAuthenticated]);

  const handleMedicalInfoChange = (field, value) => {
    setMedicalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveMedicalInfo = async () => {
    try {
      setSaving(true);
      const existingData = await getMedicalID();
      
      if (existingData) {
        await updateMedicalID(medicalData);
      } else {
        await createMedicalID(medicalData);
      }
      
      setSuccessMessage('Medical information saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update card data with the saved information
      setCardData({
        blood_group: medicalData.blood_group,
        age: medicalData.age,
        gender: medicalData.gender,
        allergies: medicalData.allergies,
        medical_conditions: medicalData.medical_conditions,
        medications: medicalData.medications,
        emergency_contacts: medicalData.emergency_contacts
      });
      
      // Reset form fields to empty values after successful save
      setMedicalData({
        blood_group: '',
        age: '',
        gender: '',
        allergies: '',
        medical_conditions: '',
        medications: '',
        emergency_contacts: medicalData.emergency_contacts // Keep emergency contacts in form
      });
    } catch (error) {
      console.error('Error saving medical ID:', error);
      alert('Failed to save medical information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert('Please fill in name and phone number');
      return;
    }

    if (medicalData.emergency_contacts.length >= 3) {
      alert('Maximum 3 emergency contacts allowed');
      return;
    }

    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(newContact.phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    setMedicalData(prev => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts, { ...newContact }]
    }));

    setNewContact({ name: '', relationship: '', phone: '' });
    setShowContactForm(false);
  };

  const handleEditContact = (index) => {
    if (!medicalData.emergency_contacts[index]) return;
    setEditingContact(index);
    setNewContact({ ...medicalData.emergency_contacts[index] });
    setShowContactForm(true);
  };

  const handleUpdateContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert('Please fill in name and phone number');
      return;
    }

    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(newContact.phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    const updatedContacts = [...medicalData.emergency_contacts];
    updatedContacts[editingContact] = { ...newContact };

    setMedicalData(prev => ({
      ...prev,
      emergency_contacts: updatedContacts
    }));

    setNewContact({ name: '', relationship: '', phone: '' });
    setShowContactForm(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (index) => {
    if (window.confirm('Are you sure you want to delete this emergency contact?')) {
      setMedicalData(prev => ({
        ...prev,
        emergency_contacts: prev.emergency_contacts.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCancelContactForm = () => {
    setNewContact({ name: '', relationship: '', phone: '' });
    setShowContactForm(false);
    setShowMedicalForm(false);
    setEditingContact(null);
  };

  const primaryContact = cardData.emergency_contacts[0] || null;

  return (
    <div className="page">
      <Navbar />
      <div className="medical-id-page">
        <div className="container">
          {/* Top Information Card */}
          <section className="dashboard-top-card">
            <div className="dashboard-left">
              <div className="medical-icon-wrapper">
                <FaHeartbeat className="medical-icon" />
              </div>
              <div className="medical-title">
                <h2>Emergency Medical ID</h2>
                <p className="user-name">{user?.full_name || 'User'}</p>
              </div>
            </div>
            <div className="dashboard-right">
              <div className="info-card">
                <span className="info-card-label">Blood Group</span>
                <span className="info-card-value">{cardData.blood_group || 'Not specified'}</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Age</span>
                <span className="info-card-value">{cardData.age || 'Not specified'}</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Gender</span>
                <span className="info-card-value">{cardData.gender || 'Not specified'}</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Allergies</span>
                <span className="info-card-value">{cardData.allergies || 'None'}</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Conditions</span>
                <span className="info-card-value">{cardData.medical_conditions || 'None'}</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Last Updated</span>
                <span className="info-card-value">{cardData.blood_group || cardData.age ? 'Recently' : 'Never'}</span>
              </div>
            </div>
          </section>

          {/* Second Card - Primary Contact and Actions */}
          <section className="dashboard-bottom-card">
            <div className="contact-section">
              {primaryContact ? (
                <div className="primary-contact-card">
                  <div className="contact-header-large">
                    <div className="contact-icon-large">
                      <FaPhone />
                    </div>
                    <div className="contact-details-large">
                      <h3 className="contact-name-large">{primaryContact.name}</h3>
                      <span className="contact-relation-large">{primaryContact.relationship}</span>
                      <span className="contact-phone-large">{primaryContact.phone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="primary-contact-card empty">
                  <div className="contact-icon-large">
                    <FaPhone />
                  </div>
                  <div className="contact-details-large">
                    <h3 className="contact-name-large">No Primary Contact</h3>
                    <span className="contact-relation-large">Add an emergency contact</span>
                  </div>
                </div>
              )}
            </div>
            <div className="info-section">
              <div className="info-content">
                <h3>Emergency Contact Usage</h3>
                <p>Your primary emergency contact will be used during emergencies and SOS alerts. This person will be notified automatically when you trigger an emergency alert.</p>
                <div className="info-notice">
                  <FaExclamationTriangle className="notice-icon" />
                  <span>Keep your emergency contact information updated for quick access during emergencies.</span>
                </div>
              </div>
            </div>
            <div className="actions-section">
              <button
                className="dashboard-button edit-button"
                onClick={() => setShowMedicalForm(true)}
              >
                <FaEdit className="button-icon" />
                Edit Medical ID
              </button>
              <button
                className="dashboard-button add-button"
                onClick={() => setShowContactForm(true)}
              >
                <FaPlus className="button-icon" />
                Add Emergency Contact
              </button>
              <button
                className="dashboard-button clear-button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all medical information?')) {
                    setMedicalData({
                      blood_group: '',
                      age: '',
                      gender: '',
                      allergies: '',
                      medical_conditions: '',
                      medications: '',
                      emergency_contacts: []
                    });
                    setCardData({
                      blood_group: '',
                      age: '',
                      gender: '',
                      allergies: '',
                      medical_conditions: '',
                      medications: '',
                      emergency_contacts: []
                    });
                  }
                }}
              >
                <FaTrash className="button-icon" />
                Clear Information
              </button>
            </div>
          </section>

          {/* Contact Form Modal */}
          {showContactForm && (
            <div className="edit-modal-overlay" onClick={handleCancelContactForm}>
              <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{editingContact !== null ? 'Edit Contact' : 'Add New Contact'}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contact-name">Full Name</label>
                    <input
                      type="text"
                      id="contact-name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-relationship">Relationship</label>
                    <input
                      type="text"
                      id="contact-relationship"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                      className="form-input"
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-phone">Phone Number</label>
                    <input
                      type="tel"
                      id="contact-phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={handleCancelContactForm}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-button"
                    onClick={editingContact !== null ? handleUpdateContact : handleAddContact}
                  >
                    {editingContact !== null ? 'Update Contact' : 'Add Contact'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Edit Modal */}
          {showMedicalForm && (
            <div className="edit-modal-overlay" onClick={handleCancelContactForm}>
              <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Medical Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="blood_group">Blood Group</label>
                    <select
                      id="blood_group"
                      value={medicalData.blood_group}
                      onChange={(e) => handleMedicalInfoChange('blood_group', e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                      type="number"
                      id="age"
                      value={medicalData.age}
                      onChange={(e) => handleMedicalInfoChange('age', e.target.value)}
                      className="form-input"
                      placeholder="Enter age"
                      min="0"
                      max="120"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      value={medicalData.gender}
                      onChange={(e) => handleMedicalInfoChange('gender', e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="allergies">Allergies</label>
                  <textarea
                    id="allergies"
                    value={medicalData.allergies}
                    onChange={(e) => handleMedicalInfoChange('allergies', e.target.value)}
                    className="form-textarea"
                    placeholder="List any known allergies (e.g., penicillin, peanuts, etc.)"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="medical_conditions">Existing Medical Conditions</label>
                  <textarea
                    id="medical_conditions"
                    value={medicalData.medical_conditions}
                    onChange={(e) => handleMedicalInfoChange('medical_conditions', e.target.value)}
                    className="form-textarea"
                    placeholder="List any existing medical conditions (e.g., diabetes, asthma, etc.)"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="medications">Current Medications</label>
                  <textarea
                    id="medications"
                    value={medicalData.medications}
                    onChange={(e) => handleMedicalInfoChange('medications', e.target.value)}
                    className="form-textarea"
                    placeholder="List current medications (e.g., insulin, blood pressure medication, etc.)"
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={handleCancelContactForm}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-button"
                    onClick={handleSaveMedicalInfo}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              <FaCheck className="success-icon" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicalID;
