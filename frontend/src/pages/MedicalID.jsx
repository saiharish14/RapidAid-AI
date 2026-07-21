/**
 * Medical ID Page Component
 * 
 * Allows users to store medical information and emergency contacts.
 * Phase 1 – Lesson 1.3 implementation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaPhone, FaEdit, FaTrash, FaPlus, FaSave, FaCheck, FaExclamationTriangle, FaIdCard, FaHeartbeat, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
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
    setEditingContact(null);
  };

  const primaryContact = cardData.emergency_contacts[0] || null;

  return (
    <div className="medical-id-page">
      <div className="container">
        <button className="back-to-home-button" onClick={() => navigate('/')}>
          <FaArrowLeft className="back-icon" />
          <span>Back to Home</span>
        </button>
        <div className="page-header">
          <FaIdCard className="page-icon" />
          <h1 className="page-title">Medical ID</h1>
          <p className="page-subtitle">Manage your emergency medical information and contacts</p>
        </div>

        {/* Emergency Card Preview */}
        <section className="emergency-card-section">
          <div className="emergency-card">
            <div className="card-header">
              <div className="card-icon-wrapper">
                <FaHeartbeat className="card-icon" />
              </div>
              <div className="card-title">
                <h2>Emergency Medical ID</h2>
                <p className="card-subtitle">{user?.full_name || 'User'}</p>
              </div>
            </div>
            
            <div className="card-body">
              <div className="card-info-row">
                <span className="info-label">Blood Group:</span>
                <span className="info-value">{cardData.blood_group || 'Not specified'}</span>
              </div>
              
              <div className="card-info-row">
                <span className="info-label">Age:</span>
                <span className="info-value">{cardData.age || 'Not specified'}</span>
              </div>
              
              <div className="card-info-row">
                <span className="info-label">Gender:</span>
                <span className="info-value">{cardData.gender || 'Not specified'}</span>
              </div>
              
              <div className="card-info-row">
                <span className="info-label">Allergies:</span>
                <span className="info-value">{cardData.allergies || 'None reported'}</span>
              </div>
              
              <div className="card-info-row">
                <span className="info-label">Conditions:</span>
                <span className="info-value">{cardData.medical_conditions || 'None reported'}</span>
              </div>
              
              {primaryContact && (
                <div className="card-divider"></div>
              )}
              
              {primaryContact && (
                <div className="card-info-row emergency-contact">
                  <FaPhone className="contact-icon" />
                  <div>
                    <span className="info-label">Primary Contact:</span>
                    <span className="info-value">{primaryContact.name} ({primaryContact.relationship})</span>
                    <span className="info-value phone">{primaryContact.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Medical Information Section */}
        <section className="medical-info-section">
          <div className="section-header">
            <FaUserMd className="section-icon" />
            <h2>Medical Information</h2>
          </div>
          
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
              className="save-button"
              onClick={handleSaveMedicalInfo}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="button-icon" />
                  <span>Save Medical Information</span>
                </>
              )}
            </button>
          </div>
          
          {successMessage && (
            <div className="success-message">
              <FaCheck className="success-icon" />
              <span>{successMessage}</span>
            </div>
          )}
        </section>

        {/* Emergency Contacts Section */}
        <section className="emergency-contacts-section">
          <div className="section-header">
            <FaPhone className="section-icon" />
            <h2>Emergency Contacts</h2>
            {medicalData.emergency_contacts.length < 3 && (
              <button
                className="add-contact-button"
                onClick={() => setShowContactForm(true)}
              >
                <FaPlus className="button-icon" />
                Add Contact
              </button>
            )}
          </div>
          
          {showContactForm && (
            <div className="contact-form-card">
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
          )}
          
          {medicalData.emergency_contacts.length === 0 && !showContactForm && (
            <div className="empty-state">
              <FaPhone className="empty-icon" />
              <p>No emergency contacts added yet</p>
              <button
                className="add-contact-button"
                onClick={() => setShowContactForm(true)}
              >
                <FaPlus className="button-icon" />
                Add First Contact
              </button>
            </div>
          )}
          
          <div className="contacts-grid">
            {medicalData.emergency_contacts.map((contact, index) => (
              <div key={index} className="contact-card">
                <div className="contact-header">
                  <div className="contact-avatar">
                    {contact.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="contact-info">
                    <h4 className="contact-name">{contact.name}</h4>
                    <span className="contact-relationship">{contact.relationship}</span>
                  </div>
                </div>
                <div className="contact-phone">
                  <FaPhone className="phone-icon" />
                  <span>{contact.phone}</span>
                </div>
                <div className="contact-actions">
                  <button
                    className="action-button edit-button"
                    onClick={() => handleEditContact(index)}
                    aria-label="Edit contact"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDeleteContact(index)}
                    aria-label="Delete contact"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {medicalData.emergency_contacts.length > 0 && (
            <div className="form-actions">
              <button
                className="save-button"
                onClick={handleSaveMedicalInfo}
                disabled={saving}
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <FaSave className="button-icon" />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>
        
        <div className="disclaimer-banner">
          <FaExclamationTriangle className="disclaimer-icon" />
          <p>
            This information is for emergency purposes only. Keep it updated regularly. 
            In a medical emergency, first responders can use this information to provide better care.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MedicalID;
