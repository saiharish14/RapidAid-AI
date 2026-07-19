import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/ResultsDashboard.css';

const ResultsDashboard = ({ analysisData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentData, setCurrentData] = useState(analysisData);

  const mockData = {
    triageLevel: 'moderate',
    confidence: 87,
    possibleCauses: [
      'Viral infection',
      'Tension headache',
      'Dehydration',
      'Sinusitis'
    ],
    firstAid: [
      'Rest in a quiet, dark room',
      'Stay hydrated with water',
      'Apply cold compress to forehead',
      'Take over-the-counter pain relief',
      'Monitor temperature regularly'
    ],
    recommendedSpecialist: 'General Physician',
    seekEmergencyCare: false,
    disclaimer: 'This analysis is for educational purposes only and should not replace professional medical advice. If symptoms worsen or persist, please consult a healthcare provider immediately.'
  };

  const data = currentData || mockData;

  // Map backend API data to dashboard format
  const mappedData = {
    triageLevel: data.severity || data.triageLevel || 'moderate',
    confidence: data.confidence || 85,
    possibleCauses: data.possible_causes || data.possibleCauses || mockData.possibleCauses,
    firstAid: data.first_aid || data.firstAid || mockData.firstAid,
    recommendedSpecialist: data.recommended_specialist || data.recommendedSpecialist || mockData.recommendedSpecialist,
    seekEmergencyCare: data.triage_level === 'emergency' || data.triageLevel === 'emergency' || false,
    disclaimer: data.disclaimer || mockData.disclaimer
  };

  const handleAnalyzeAgain = () => {
    // Clear current data and navigate back to symptom checker
    setCurrentData(null);
    navigate('/symptom-checker');
  };

  const getSeverityColor = (level) => {
    switch (level.toLowerCase()) {
      case 'mild':
        return '#4CAF50';
      case 'moderate':
        return '#FF9800';
      case 'severe':
      case 'emergency':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getSeverityLabel = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getPatientName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email;
    return 'Guest User';
  };

  const generateReportId = () => {
    const randomSegment = Math.floor(Math.random() * 900000 + 100000);
    return `RPT-${Date.now().toString().slice(-8)}-${randomSegment}`;
  };

  const getSymptomsText = () => {
    return (
      data.symptoms || data.symptomDescription || data.description || 'N/A'
    );
  };

  const reportId = data.report_id || data.reportId || generateReportId();
  const reportDate = new Date();
  const reportDateTime = reportDate.toLocaleString();

  const downloadReportPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 25;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#1a237e');
    doc.text('RapidAid AI', margin, currentY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#64748b');
    doc.text('Professional Healthcare Analysis Report', margin, currentY + 8);
    doc.setLineWidth(0.5);
    doc.setDrawColor('#cbd5e1');
    doc.line(margin, currentY + 12, pageWidth - margin, currentY + 12);

    currentY += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#2563eb');
    doc.text('Report Details', margin, currentY);

    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const details = [
      `Report ID: ${reportId}`,
      `Date & Time: ${reportDateTime}`,
      `Patient Name: ${getPatientName()}`,
      `Severity Level: ${getSeverityLabel(mappedData.triageLevel)}`,
      `AI Confidence: ${mappedData.confidence}%`,
      `Recommended Specialist: ${mappedData.recommendedSpecialist}`
    ];

    details.forEach((line) => {
      doc.text(line, margin, currentY);
      currentY += 7;
    });

    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Symptoms', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const symptomLines = doc.splitTextToSize(getSymptomsText(), pageWidth - margin * 2);
    doc.text(symptomLines, margin, currentY);
    currentY += symptomLines.length * 6 + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Possible Causes', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    mappedData.possibleCauses.forEach((cause, index) => {
      const causeText = `${index + 1}. ${cause}`;
      const causeLines = doc.splitTextToSize(causeText, pageWidth - margin * 2);
      doc.text(causeLines, margin, currentY);
      currentY += causeLines.length * 6;
    });

    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('First Aid Recommendations', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    mappedData.firstAid.forEach((item, index) => {
      const itemText = `• ${item}`;
      const itemLines = doc.splitTextToSize(itemText, pageWidth - margin * 2);
      doc.text(itemLines, margin, currentY);
      currentY += itemLines.length * 6;
    });

    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Medical Disclaimer', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const disclaimerLines = doc.splitTextToSize(mappedData.disclaimer, pageWidth - margin * 2);
    doc.text(disclaimerLines, margin, currentY);
    currentY += disclaimerLines.length * 6 + 15;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor('#94a3b8');
    doc.text('Generated by RapidAid AI', margin, doc.internal.pageSize.getHeight() - 20);

    doc.save(`RapidAidAI_Report_${reportId}.pdf`);
  };

  return (
    <div className="results-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">AI Analysis Results</h1>
        <p className="dashboard-subtitle">Based on your symptoms and medical information</p>
      </div>

      {/* Severity Badge */}
      <div className="severity-section">
        <div 
          className="severity-badge"
          style={{ backgroundColor: getSeverityColor(mappedData.triageLevel) }}
        >
          <div className="severity-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM13 7H11V11H7V13H11V17H13V13H17V11H13V7Z"/>
            </svg>
          </div>
          <div className="severity-content">
            <h2 className="severity-label">Severity Level</h2>
            <p className="severity-value">{getSeverityLabel(mappedData.triageLevel)}</p>
          </div>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="confidence-section">
        <h3 className="section-title">AI Confidence</h3>
        <div className="confidence-meter">
          <div className="confidence-bar">
            <div 
              className="confidence-fill"
              style={{ width: `${mappedData.confidence}%` }}
            ></div>
          </div>
          <div className="confidence-value">{mappedData.confidence}%</div>
        </div>
        <p className="confidence-description">
          Based on symptom patterns and medical knowledge base
        </p>
      </div>

      {/* Possible Causes */}
      <div className="causes-section">
        <h3 className="section-title">Possible Causes</h3>
        <div className="causes-list">
          {mappedData.possibleCauses.map((cause, index) => (
            <div key={index} className="cause-item">
              <div className="cause-number">{index + 1}</div>
              <div className="cause-text">{cause}</div>
            </div>
          ))}
        </div>
      </div>

      {/* First Aid Recommendations */}
      <div className="firstaid-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>
          </span>
          First Aid Recommendations
        </h3>
        <div className="firstaid-list">
          {mappedData.firstAid.map((recommendation, index) => (
            <div key={index} className="firstaid-item">
              <div className="firstaid-bullet">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </div>
              <p className="firstaid-text">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Specialist */}
      <div className="specialist-section">
        <h3 className="section-title">Recommended Specialist</h3>
        <div className="specialist-card">
          <div className="specialist-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
            </svg>
          </div>
          <div className="specialist-info">
            <p className="specialist-label">Consult with</p>
            <p className="specialist-name">{mappedData.recommendedSpecialist}</p>
          </div>
        </div>
      </div>

      {/* Emergency Warning Card */}
      {mappedData.seekEmergencyCare && (
        <div className="emergency-section">
          <div className="emergency-card">
            <div className="emergency-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
              </svg>
            </div>
            <div className="emergency-content">
              <h3 className="emergency-title">⚠️ Seek Emergency Care</h3>
              <p className="emergency-text">
                Based on your symptoms, immediate medical attention is recommended.
                Please visit the nearest emergency room or call emergency services.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="disclaimer-section">
        <div className="disclaimer-card">
          <div className="disclaimer-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 17H13V19H11V17ZM11 15H13V7H11V15Z"/>
            </svg>
          </div>
          <p className="disclaimer-text">{mappedData.disclaimer}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions-section">
        <button onClick={handleAnalyzeAgain} className="action-button primary">
          <span className="button-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/>
            </svg>
          </span>
          Analyze Again
        </button>
        <button onClick={downloadReportPdf} className="action-button secondary">
          <span className="button-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V9H7V19H17V9H19ZM14 1H10V5H5.01L5 23H19V5H14V1ZM13 3H11V5H13V3ZM12 8.59L8.29 12.29L9.71 13.71L11 12.41V17H13V12.41L14.29 13.71L15.71 12.29L12 8.59Z"/>
            </svg>
          </span>
          Download Report
        </button>
      </div>
    </div>
  );
};

export default ResultsDashboard;
