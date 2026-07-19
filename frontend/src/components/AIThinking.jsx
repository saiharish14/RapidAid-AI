import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSymptoms } from '../services/analyzeService';
import '../css/AIThinking.css';

const AIThinking = ({ analysisData }) => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const progressMessages = [
    'Initializing AI...',
    'Analyzing Symptoms...',
    'Consulting Medical Knowledge...',
    'Preparing First Aid Guidance...',
    'Generating Medical Report...'
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => {
        if (prevIndex < progressMessages.length - 1) {
          return prevIndex + 1;
        }
        return prevIndex;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress < 100) {
          return prevProgress + 2;
        }
        return prevProgress;
      });
    }, 100);

    const performAnalysis = async () => {
      try {
        if (!analysisData) {
          throw new Error('No analysis data provided');
        }

        // Make actual API call
        const result = await analyzeSymptoms(analysisData);
        
        // Navigate to results with the analysis data
        navigate('/results', { state: { analysisResult: result } });
      } catch (err) {
        console.error('Analysis failed:', err);
        setError(err.message);
        // Navigate back to symptom checker on error
        setTimeout(() => {
          navigate('/symptom-checker');
        }, 3000);
      }
    };

    // Start analysis after a short delay
    const analysisTimeout = setTimeout(performAnalysis, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(analysisTimeout);
    };
  }, [navigate, analysisData]);

  return (
    <div className="ai-thinking-container">
      <div className="ai-thinking-content">
        {/* AI Brain Icon */}
        <div className="brain-icon-wrapper">
          <div className="brain-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
              <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div className="brain-pulse"></div>
        </div>

        {/* Circular Loading Animation */}
        <div className="circular-loader">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}%</div>
        </div>

        {/* Progress Message */}
        <div className="progress-message">
          <h2 className="message-text">
            {error ? `Error: ${error}` : progressMessages[currentMessageIndex]}
          </h2>
        </div>

        {/* Rotating Medical Icons */}
        <div className="medical-icons">
          <div className="medical-icon icon-1">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM11 7H13V11H17V13H13V17H11V13H7V11H11V7Z"/>
            </svg>
          </div>
          <div className="medical-icon icon-2">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM13 7H11V11H7V13H11V17H13V13H17V11H13V7Z"/>
            </svg>
          </div>
          <div className="medical-icon icon-3">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIThinking;
