/**
 * Preparedness Kit Page Component
 * 
 * Allows users to manage their emergency preparedness checklist.
 * Phase 1 – Lesson 1.4 implementation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaLightbulb, FaSync, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getPreparednessKit, createPreparednessKit, updatePreparednessKit } from '../services/preparednessKitService';
import '../css/PreparednessKit.css';

function PreparednessKit() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checklist, setChecklist] = useState({
    medical: {
      'First Aid Kit': false,
      'Prescription Medicines': false,
      'Pain Relief Tablets': false,
      'Bandages': false,
      'Antiseptic Solution': false
    },
    emergency_supplies: {
      'Flashlight': false,
      'Extra Batteries': false,
      'Power Bank': false,
      'Phone Charger': false,
      'Drinking Water': false,
      'Non-perishable Food': false
    },
    documents: {
      'ID Proof': false,
      'Medical Records': false,
      'Insurance Documents': false,
      'Emergency Contact List': false
    }
  });
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const safetyTips = [
    'Keep emergency numbers accessible.',
    'Replace expired medicines regularly.',
    'Charge your power bank every month.',
    'Store clean drinking water.',
    'Keep a flashlight near your bed.',
    'Review your emergency kit quarterly.',
    'Keep important documents in a waterproof bag.',
    'Have a backup power source ready.'
  ];


  const loadPreparednessKit = async () => {
    try {
      setLoading(true);
      const data = await getPreparednessKit();
      if (data && typeof data === 'object') {
        setChecklist(data.checklist || checklist);
      }
    } catch (error) {
      console.error('Error loading preparedness kit:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPreparednessKit();
    }
  }, [isAuthenticated]);

  // Rotate safety tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % safetyTips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleItemToggle = async (category, item) => {
    const updatedChecklist = {
      ...checklist,
      [category]: {
        ...checklist[category],
        [item]: !checklist[category][item]
      }
    };

    setChecklist(updatedChecklist);

    // Auto-save checklist
    await saveProgress(updatedChecklist);
  };

  const saveProgress = async (checklistData) => {
    try {
      setSaving(true);
      const existingData = await getPreparednessKit();
      
      if (existingData) {
        await updatePreparednessKit({
          checklist: checklistData
        });
      } else {
        await createPreparednessKit({
          checklist: checklistData
        });
      }
    } catch (error) {
      console.error('Error saving preparedness kit:', error);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="preparedness-kit-page">
      <div className="container">
        <button className="back-to-home-button" onClick={() => navigate('/')}>
          <FaArrowLeft className="back-icon" />
          <span>Back to Home</span>
        </button>
        <div className="page-header">
          <FaBoxOpen className="page-icon" />
          <h1 className="page-title">Emergency Preparedness Kit</h1>
          <p className="page-subtitle">Track your emergency supplies and stay prepared</p>
        </div>

        {/* Emergency Kit Checklist */}
        <section className="checklist-section">
          <div className="section-header">
            <FaBoxOpen className="section-icon" />
            <h2>Emergency Kit Checklist</h2>
            {saving && <span className="saving-indicator">Saving...</span>}
          </div>

          {/* Medical */}
          <div className="checklist-category">
            <h3 className="category-title">Medical</h3>
            <div className="checklist-items">
              {Object.entries(checklist.medical).map(([item, checked]) => (
                <label key={item} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleItemToggle('medical', item)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="item-label">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Emergency Supplies */}
          <div className="checklist-category">
            <h3 className="category-title">Emergency Supplies</h3>
            <div className="checklist-items">
              {Object.entries(checklist.emergency_supplies).map(([item, checked]) => (
                <label key={item} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleItemToggle('emergency_supplies', item)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="item-label">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Important Documents */}
          <div className="checklist-category">
            <h3 className="category-title">Important Documents</h3>
            <div className="checklist-items">
              {Object.entries(checklist.documents).map(([item, checked]) => (
                <label key={item} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleItemToggle('documents', item)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="item-label">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Safety Tips */}
        <section className="safety-tips-section">
          <div className="tips-card">
            <div className="tips-header">
              <FaLightbulb className="tips-icon" />
              <h2>Quick Safety Tips</h2>
              <button className="refresh-tips-button" onClick={() => setCurrentTipIndex((prev) => (prev + 1) % safetyTips.length)}>
                <FaSync />
              </button>
            </div>
            <div className="tips-content">
              <p className="tip-text fade-in">{safetyTips[currentTipIndex]}</p>
            </div>
          </div>
        </section>

        <div className="disclaimer-banner">
          <FaExclamationTriangle className="disclaimer-icon" />
          <p>
            Regularly review and update your emergency preparedness kit. 
            Replace expired items and ensure all supplies are in good condition.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PreparednessKit;
