/**
 * Emergency SOS Page Component
 * 
 * Emergency dashboard with quick-dial emergency numbers and first-aid guides.
 * Phase 1 – Lesson 1.1 implementation.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPhone, FaAmbulance, FaShieldAlt, FaFireExtinguisher, FaHeartbeat, FaTint, FaBurn, FaExclamationTriangle, FaHospital, FaTimes, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { createHomeNavigation, scrollToSection, SCROLL_TARGETS } from '../utils/scrollNavigation';
import '../css/EmergencySOS.css';

function EmergencySOS() {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [assistantState, setAssistantState] = useState({
    currentQuestionIndex: 0,
    answers: {},
    showResult: false,
    result: null
  });
  const navigate = useNavigate();

  // Detect mobile device
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const emergencyNumbers = [
    { number: '112', label: 'Emergency', icon: FaPhone, color: '#dc2626' },
    { number: '108', label: 'Ambulance', icon: FaAmbulance, color: '#2563eb' },
    { number: '100', label: 'Police', icon: FaShieldAlt, color: '#059669' },
    { number: '101', label: 'Fire', icon: FaFireExtinguisher, color: '#d97706' },
  ];

  const firstAidGuides = [
    {
      id: 'cpr',
      title: 'CPR Guide',
      icon: FaHeartbeat,
      color: '#dc2626',
      questions: [
        {
          id: 'conscious',
          text: 'Is the person conscious?',
          options: ['Yes', 'No']
        },
        {
          id: 'breathing',
          text: 'Is the person breathing?',
          options: ['Yes', 'No']
        }
      ],
      getResult: (answers) => {
        if (answers.conscious === 'No' && answers.breathing === 'No') {
          return {
            severity: 'emergency',
            title: 'Start CPR Immediately',
            actions: [
              'Call emergency services (112) immediately',
              'Place hands on center of chest, interlock fingers',
              'Push hard and fast (100-120 compressions/minute)',
              'Allow chest to recoil completely between compressions',
              'Continue until help arrives or person recovers'
            ],
            emergencyNumber: '112'
          };
        } else if (answers.conscious === 'No' && answers.breathing === 'Yes') {
          return {
            severity: 'urgent',
            title: 'Recovery Position',
            actions: [
              'Call emergency services (112)',
              'Place person in recovery position',
              'Monitor breathing continuously',
              'Keep airway clear',
              'Do not leave person alone'
            ],
            emergencyNumber: '112'
          };
        } else {
          return {
            severity: 'informational',
            title: 'Monitor Condition',
            actions: [
              'Keep person calm and comfortable',
              'Check for any injuries',
              'Call emergency services if condition worsens',
              'Stay with person until help arrives'
            ],
            emergencyNumber: '112'
          };
        }
      }
    },
    {
      id: 'bleeding',
      title: 'Severe Bleeding',
      icon: FaTint,
      color: '#dc2626',
      questions: [
        {
          id: 'heavy',
          text: 'Is the bleeding heavy or spurting?',
          options: ['Yes', 'No']
        },
        {
          id: 'soaking',
          text: 'Is blood soaking through the cloth?',
          options: ['Yes', 'No']
        }
      ],
      getResult: (answers) => {
        if (answers.heavy === 'Yes' || answers.soaking === 'Yes') {
          return {
            severity: 'emergency',
            title: 'Severe Bleeding - Act Fast',
            actions: [
              'Apply direct pressure with clean cloth',
              'Do not remove cloth if soaked - add more layers',
              'Elevate injured area above heart level',
              'Call emergency services (112) immediately',
              'Keep person calm and warm'
            ],
            emergencyNumber: '112'
          };
        } else {
          return {
            severity: 'informational',
            title: 'Minor Bleeding Care',
            actions: [
              'Clean wound with water if possible',
              'Apply direct pressure with clean cloth',
              'Apply bandage once bleeding stops',
              'Monitor for infection',
              'Seek medical attention if needed'
            ],
            emergencyNumber: '112'
          };
        }
      }
    },
    {
      id: 'burns',
      title: 'Burn Treatment',
      icon: FaBurn,
      color: '#d97706',
      questions: [
        {
          id: 'size',
          text: 'Is the burn larger than the person\'s palm?',
          options: ['Yes', 'No']
        },
        {
          id: 'type',
          text: 'Was it caused by chemicals or electricity?',
          options: ['Yes', 'No']
        }
      ],
      getResult: (answers) => {
        if (answers.size === 'Yes' || answers.type === 'Yes') {
          return {
            severity: 'emergency',
            title: 'Severe Burn - Seek Help',
            actions: [
              'Call emergency services (112) immediately',
              'Cool burn under running water for at least 20 minutes',
              'Remove jewelry/tight clothing near burn',
              'Do NOT apply ice, butter, or ointments',
              'Cover with sterile, non-stick bandage',
              'Seek immediate medical attention'
            ],
            emergencyNumber: '112'
          };
        } else {
          return {
            severity: 'informational',
            title: 'Minor Burn Care',
            actions: [
              'Cool burn under running water for 10-15 minutes',
              'Remove jewelry near burn area',
              'Apply burn ointment or aloe vera if available',
              'Cover with sterile bandage',
              'Take pain relievers if needed'
            ],
            emergencyNumber: '112'
          };
        }
      }
    },
    {
      id: 'choking',
      title: 'Choking',
      icon: FaExclamationTriangle,
      color: '#d97706',
      questions: [
        {
          id: 'speak',
          text: 'Can the person speak or cough?',
          options: ['Yes', 'No']
        },
        {
          id: 'conscious',
          text: 'Is the person conscious?',
          options: ['Yes', 'No']
        }
      ],
      getResult: (answers) => {
        if (answers.speak === 'No' && answers.conscious === 'Yes') {
          return {
            severity: 'urgent',
            title: 'Perform Heimlich Maneuver',
            actions: [
              'Stand behind person, wrap arms around waist',
              'Make fist, place above navel',
              'Grasp fist with other hand, thrust upward',
              'Repeat until object dislodges',
              'Call emergency services (112) if unsuccessful'
            ],
            emergencyNumber: '112'
          };
        } else if (answers.speak === 'No' && answers.conscious === 'No') {
          return {
            severity: 'emergency',
            title: 'Unconscious - Start CPR',
            actions: [
              'Call emergency services (112) immediately',
              'Begin CPR immediately',
              'Check mouth for visible object',
              'Continue until help arrives',
              'Do not attempt blind finger sweep'
            ],
            emergencyNumber: '112'
          };
        } else {
          return {
            severity: 'informational',
            title: 'Encourage Coughing',
            actions: [
              'Encourage person to cough forcefully',
              'Stay with person and monitor',
              'Do not slap back',
              'Call emergency services if condition worsens',
              'Keep person calm'
            ],
            emergencyNumber: '112'
          };
        }
      }
    },
    {
      id: 'heart-attack',
      title: 'Heart Attack',
      icon: FaHeartbeat,
      color: '#dc2626',
      questions: [
        {
          id: 'chest_pain',
          text: 'Is there chest pain or pressure?',
          options: ['Yes', 'No']
        },
        {
          id: 'breathing',
          text: 'Is there difficulty breathing?',
          options: ['Yes', 'No']
        },
        {
          id: 'sweating',
          text: 'Is there unusual sweating?',
          options: ['Yes', 'No']
        },
        {
          id: 'spreading',
          text: 'Is pain spreading to arm or jaw?',
          options: ['Yes', 'No']
        }
      ],
      getResult: (answers) => {
        const symptomCount = Object.values(answers).filter(a => a === 'Yes').length;
        if (symptomCount >= 3) {
          return {
            severity: 'emergency',
            title: 'Possible Heart Attack - Act Now',
            actions: [
              'Call emergency services (112) IMMEDIATELY',
              'Have person sit down and rest',
              'Loosen tight clothing',
              'If prescribed, help take nitroglycerin',
              'If not allergic, give aspirin',
              'Begin CPR if person becomes unresponsive'
            ],
            emergencyNumber: '112'
          };
        } else if (symptomCount >= 1) {
          return {
            severity: 'urgent',
            title: 'Possible Heart Attack - Monitor',
            actions: [
              'Call emergency services (112)',
              'Have person sit down and rest',
              'Monitor symptoms closely',
              'Loosen tight clothing',
              'Be prepared to begin CPR'
            ],
            emergencyNumber: '112'
          };
        } else {
          return {
            severity: 'informational',
            title: 'Monitor for Symptoms',
            actions: [
              'Keep person calm and comfortable',
              'Monitor for any changes',
              'Call emergency services if symptoms develop',
              'Do not ignore any chest discomfort'
            ],
            emergencyNumber: '112'
          };
        }
      }
    },
    {
      id: 'stroke',
      title: 'Stroke',
      icon: FaExclamationTriangle,
      color: '#dc2626',
      questions: [
        {
          id: 'face',
          text: 'Does one side of the face droop when smiling?',
          options: ['Yes', 'No']
        },
        {
          id: 'arms',
          text: 'Does one arm drift down when raised?',
          options: ['Yes', 'No']
        },
        {
          id: 'speech',
          text: 'Is speech slurred or strange?',
          options: ['Yes', 'No']
        }
      ],
      getResult: (answers) => {
        const hasSymptom = Object.values(answers).some(a => a === 'Yes');
        if (hasSymptom) {
          return {
            severity: 'emergency',
            title: 'POSSIBLE STROKE - Call 112 NOW',
            actions: [
              'Call emergency services (112) IMMEDIATELY',
              'Note the time symptoms started',
              'Do NOT give food or drink',
              'Keep person calm and still',
              'Lie on side if nauseous',
              'Do not give any medication'
            ],
            emergencyNumber: '112'
          };
        } else {
          return {
            severity: 'informational',
            title: 'No Stroke Signs Detected',
            actions: [
              'Continue monitoring person',
              'Remember FAST for future reference',
              'Call emergency services if symptoms appear',
              'Face, Arms, Speech, Time',
              'Seek medical evaluation if concerned'
            ],
            emergencyNumber: '112'
          };
        }
      }
    }
  ];

  const handleEmergencyCall = (number) => {
    if (isMobile) {
      window.location.href = `tel:${number}`;
    }
  };

  const openGuide = (guide) => {
    setSelectedGuide(guide);
    setAssistantState({
      currentQuestionIndex: 0,
      answers: {},
      showResult: false,
      result: null
    });
  };

  const closeGuide = () => {
    setSelectedGuide(null);
    setAssistantState({
      currentQuestionIndex: 0,
      answers: {},
      showResult: false,
      result: null
    });
  };

  const handleAnswer = (answer) => {
    const currentQuestion = selectedGuide.questions[assistantState.currentQuestionIndex];
    const newAnswers = {
      ...assistantState.answers,
      [currentQuestion.id]: answer
    };

    if (assistantState.currentQuestionIndex < selectedGuide.questions.length - 1) {
      setAssistantState({
        ...assistantState,
        currentQuestionIndex: assistantState.currentQuestionIndex + 1,
        answers: newAnswers
      });
    } else {
      const result = selectedGuide.getResult(newAnswers);
      setAssistantState({
        ...assistantState,
        answers: newAnswers,
        showResult: true,
        result
      });
    }
  };

  const handleBack = () => {
    if (assistantState.currentQuestionIndex > 0) {
      const currentQuestion = selectedGuide.questions[assistantState.currentQuestionIndex];
      const newAnswers = { ...assistantState.answers };
      delete newAnswers[currentQuestion.id];
      setAssistantState({
        ...assistantState,
        currentQuestionIndex: assistantState.currentQuestionIndex - 1,
        answers: newAnswers
      });
    }
  };

  const handleReset = () => {
    setAssistantState({
      currentQuestionIndex: 0,
      answers: {},
      showResult: false,
      result: null
    });
  };

  const handleBackToHome = () => {
    createHomeNavigation(navigate, SCROLL_TARGETS.HERO);
  };

  return (
    <div className="emergency-sos-page">
      {/* Hero Section */}
      <section className="emergency-hero">
        <button className="back-to-home-button" onClick={handleBackToHome} aria-label="Back to Home">
          <FaArrowLeft className="back-icon" />
          <span>Back to Home</span>
        </button>
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <FaPhone className="hero-icon" />
          </div>
          <h1 className="hero-title">Emergency SOS Center</h1>
          <p className="hero-subtitle">
            Life-saving guidance when every second matters. Quickly access emergency numbers, first-aid instructions, and emergency resources.
          </p>
          <div className="hero-warning">
            <FaExclamationTriangle className="warning-icon" />
            <span>In a real emergency, call emergency services immediately</span>
          </div>
        </div>
      </section>

      {/* Emergency Call Buttons */}
      <section className="emergency-calls-section">
        <div className="container">
          <h2 className="section-title">Emergency Numbers</h2>
          <div className="emergency-calls-grid">
            {emergencyNumbers.map((emergency, index) => (
              <button
                key={index}
                className={`emergency-call-button ${isMobile ? 'mobile-call' : 'desktop-call'}`}
                onClick={() => handleEmergencyCall(emergency.number)}
                style={{ '--emergency-color': emergency.color }}
              >
                <div className="call-icon-wrapper">
                  <emergency.icon className="call-icon" />
                </div>
                <div className="call-info">
                  <span className="call-number">{emergency.number}</span>
                  <span className="call-label">{emergency.label}</span>
                  {isMobile && <span className="call-helper">Tap to Call</span>}
                </div>
                {isMobile && <FaPhone className="call-action-icon" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* First Aid Guides */}
      <section className="first-aid-section">
        <div className="container">
          <h2 className="section-title">First Aid Guides</h2>
          <p className="section-subtitle">Click on a card to view step-by-step instructions</p>
          <div className="guides-grid">
            {firstAidGuides.map((guide, index) => (
              <div
                key={guide.id}
                className="guide-card"
                onClick={() => openGuide(guide)}
                style={{ '--guide-color': guide.color, '--animation-delay': `${index * 0.1}s` }}
              >
                <div className="guide-icon-wrapper">
                  <guide.icon className="guide-icon" />
                </div>
                <h3 className="guide-title">{guide.title}</h3>
                <div className="guide-arrow">
                  <FaChevronRight />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Disclaimer */}
      <section className="emergency-disclaimer-section">
        <div className="container">
          <div className="disclaimer-banner">
            <div className="disclaimer-icon-wrapper">
              <FaExclamationTriangle className="disclaimer-icon" />
            </div>
            <div className="disclaimer-content">
              <h3 className="disclaimer-title">Important Medical Disclaimer</h3>
              <p className="disclaimer-text">
                RapidAid AI is not a substitute for professional medical advice, diagnosis, or treatment. 
                These first-aid guides are for educational purposes only and should not replace professional 
                medical care. In any emergency situation, call emergency services immediately and seek 
                professional medical help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <FaHospital className="cta-icon" />
              <h3 className="cta-title">Find Nearby Hospitals</h3>
              <p className="cta-subtitle">
                Locate the nearest medical facilities for immediate care
              </p>
            </div>
            <button className="cta-button" disabled>
              <span>Find Nearby Hospitals</span>
              <FaChevronRight className="cta-arrow" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Assistant Modal */}
      {selectedGuide && (
        <div className="guide-modal-overlay" onClick={closeGuide}>
          <div className="guide-modal assistant-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ '--guide-color': selectedGuide.color }}>
              <div className="modal-icon-wrapper">
                <selectedGuide.icon className="modal-icon" />
              </div>
              <h2 className="modal-title">{selectedGuide.title}</h2>
              <button className="modal-close" onClick={closeGuide} aria-label="Close">
                <FaTimes />
              </button>
            </div>
            
            {!assistantState.showResult ? (
              <div className="modal-body assistant-body">
                <div className="progress-indicator">
                  Step {assistantState.currentQuestionIndex + 1} of {selectedGuide.questions.length}
                </div>
                
                <div className="question-container">
                  <h3 className="question-text">
                    {selectedGuide.questions[assistantState.currentQuestionIndex].text}
                  </h3>
                  
                  <div className="answer-buttons">
                    {selectedGuide.questions[assistantState.currentQuestionIndex].options.map((option) => (
                      <button
                        key={option}
                        className="answer-button"
                        onClick={() => handleAnswer(option)}
                        style={{ '--guide-color': selectedGuide.color }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="assistant-footer">
                  <button
                    className="back-button"
                    onClick={handleBack}
                    disabled={assistantState.currentQuestionIndex === 0}
                  >
                    <FaArrowLeft className="back-icon-small" />
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-body result-body">
                <div className={`severity-badge severity-${assistantState.result.severity}`}>
                  {assistantState.result.severity === 'emergency' && '⚠️ Emergency'}
                  {assistantState.result.severity === 'urgent' && '⚡ Urgent'}
                  {assistantState.result.severity === 'informational' && 'ℹ️ Informational'}
                </div>
                
                <h3 className="result-title">{assistantState.result.title}</h3>
                
                <div className="result-actions">
                  {assistantState.result.actions.map((action, index) => (
                    <div key={index} className="action-item">
                      <span className="action-number">{index + 1}</span>
                      <span className="action-text">{action}</span>
                    </div>
                  ))}
                </div>
                
                <div className="emergency-reminder">
                  <FaPhone className="reminder-icon" />
                  <div>
                    <strong>Emergency Number:</strong> {assistantState.result.emergencyNumber}
                  </div>
                </div>
                
                <div className="result-footer">
                  <button className="reset-button" onClick={handleReset}>
                    Start Over
                  </button>
                  <button className="modal-close-btn" onClick={closeGuide}>
                    Close
                  </button>
                </div>
              </div>
            )}
            
            {!assistantState.showResult && (
              <div className="modal-footer">
                <div className="modal-disclaimer">
                  <FaExclamationTriangle className="modal-warning-icon" />
                  <p>
                    This information is for guidance only. In an emergency, call 112 immediately.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencySOS;
