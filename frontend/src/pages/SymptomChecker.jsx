/**
 * Symptom Checker Page
 * 
 * Main symptom checking interface where users input their symptoms.
 * This is a UI skeleton - no API calls or AI logic implemented.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionTitle from '../components/SectionTitle';
import AIThinking from '../components/AIThinking';
import { FaStethoscope, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import '../css/SymptomChecker.css';

function SymptomChecker() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState('');
  const [duration, setDuration] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [showAIThinking, setShowAIThinking] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Custom validation for required fields
    const errors = [];
    
    if (!age) {
      errors.push('Age is required');
    } else if (isNaN(age) || parseInt(age) < 0 || parseInt(age) > 150) {
      errors.push('Please enter a valid age between 0 and 150');
    }
    
    if (!gender) {
      errors.push('Gender is required');
    }
    
    if (!duration) {
      errors.push('Duration is required');
    } else if (duration.length < 2) {
      errors.push('Please provide at least 2 characters for duration');
    }
    
    if (!symptoms) {
      errors.push('Symptoms description is required');
    } else if (symptoms.length < 10) {
      errors.push('Please provide at least 10 characters for symptoms description');
    }
    
    if (!severity) {
      errors.push('Pain level is required');
    }
    
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }
    
    // Collect form data matching backend validation requirements
    const formData = {
      symptoms,
      painLevel: severity, // Map severity to painLevel
      duration,
      age: parseInt(age),
      gender,
      medicalHistory: medicalHistory || undefined,
      medications: medications || undefined,
      allergies: allergies || undefined,
    };
    setAnalysisData(formData);
    // Show AI Thinking screen instead of immediate navigation
    setShowAIThinking(true);
  };

  if (showAIThinking) {
    return <AIThinking analysisData={analysisData} />;
  }

  return (
    <div className="page">
      <Navbar />
      <main className="symptom-checker-page">
        <div className="container">
          {/* Hero Section */}
          <section className="checker-hero">
            <SectionTitle 
              title="Symptom Checker"
              subtitle="Describe your symptoms to receive AI-powered medical guidance"
            />
            <div className="disclaimer-banner">
              <FaExclamationTriangle className="disclaimer-icon" />
              <p className="disclaimer-text">
                For medical emergencies, call emergency services immediately. This tool is not a substitute for professional medical advice.
              </p>
            </div>
          </section>

          {/* Symptom Form */}
          <section className="checker-form-section">
            <div className="form-container">
              <form className="symptom-form" onSubmit={handleSubmit} noValidate>
                {/* Age */}
                <div className="form-group">
                  <label className="form-label" htmlFor="age">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    className="form-input"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="0"
                    max="150"
                  />
                </div>

                {/* Gender */}
                <div className="form-group">
                  <label className="form-label">
                    Gender
                  </label>
                  <div className="gender-options">
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={gender === 'male'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span className="gender-label">Male</span>
                    </label>
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={gender === 'female'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span className="gender-label">Female</span>
                    </label>
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={gender === 'other'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span className="gender-label">Other</span>
                    </label>
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="prefer_not_to_say"
                        checked={gender === 'prefer_not_to_say'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span className="gender-label">Prefer not to say</span>
                    </label>
                  </div>
                </div>

                {/* Duration */}
                <div className="form-group">
                  <label className="form-label" htmlFor="duration">
                    Duration of Symptoms
                  </label>
                  <input
                    type="text"
                    id="duration"
                    className="form-input"
                    placeholder="e.g., 2 days, 1 week, 3 hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                {/* Symptoms Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="symptoms">
                    Describe Your Symptoms
                  </label>
                  <textarea
                    id="symptoms"
                    className="form-textarea"
                    placeholder="Please describe your symptoms in detail. Include when they started, severity, and any other relevant information..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={6}
                  />
                </div>

                {/* Severity Selection */}
                <div className="form-group">
                  <label className="form-label">
                    How would you rate your discomfort?
                  </label>
                  <div className="severity-options">
                    <label className="severity-option">
                      <input
                        type="radio"
                        name="severity"
                        value="mild"
                        checked={severity === 'mild'}
                        onChange={(e) => setSeverity(e.target.value)}
                      />
                      <span className="severity-label">Mild</span>
                    </label>
                    <label className="severity-option">
                      <input
                        type="radio"
                        name="severity"
                        value="moderate"
                        checked={severity === 'moderate'}
                        onChange={(e) => setSeverity(e.target.value)}
                      />
                      <span className="severity-label">Moderate</span>
                    </label>
                    <label className="severity-option">
                      <input
                        type="radio"
                        name="severity"
                        value="severe"
                        checked={severity === 'severe'}
                        onChange={(e) => setSeverity(e.target.value)}
                      />
                      <span className="severity-label">Severe</span>
                    </label>
                    <label className="severity-option">
                      <input
                        type="radio"
                        name="severity"
                        value="extreme"
                        checked={severity === 'extreme'}
                        onChange={(e) => setSeverity(e.target.value)}
                      />
                      <span className="severity-label">Extreme</span>
                    </label>
                  </div>
                </div>

                {/* Medical History */}
                <div className="form-group">
                  <label className="form-label" htmlFor="medical-history">
                    Medical History (Optional)
                  </label>
                  <textarea
                    id="medical-history"
                    className="form-textarea"
                    placeholder="Any relevant medical history..."
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Medications */}
                <div className="form-group">
                  <label className="form-label" htmlFor="medications">
                    Current Medications (Optional)
                  </label>
                  <textarea
                    id="medications"
                    className="form-textarea"
                    placeholder="Any medications you are currently taking..."
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Allergies */}
                <div className="form-group">
                  <label className="form-label" htmlFor="allergies">
                    Known Allergies (Optional)
                  </label>
                  <textarea
                    id="allergies"
                    className="form-textarea"
                    placeholder="Any known allergies..."
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-button">
                  <FaStethoscope className="button-icon" />
                  Analyze Symptoms
                  <FaArrowRight className="button-icon-right" />
                </button>
              </form>
            </div>
          </section>

          {/* Info Section */}
          <section className="info-section">
            <div className="info-cards">
              <div className="info-card">
                <h3 className="info-title">What Happens Next</h3>
                <p className="info-text">
                  Our AI will analyze your symptoms and provide personalized first aid recommendations 
                  along with guidance on whether to seek professional medical attention.
                </p>
              </div>
              <div className="info-card">
                <h3 className="info-title">Privacy Assured</h3>
                <p className="info-text">
                  Your health information is processed securely and is never shared with third parties 
                  without your explicit consent.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default SymptomChecker;
