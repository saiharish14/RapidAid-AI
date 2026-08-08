import React from 'react';
import { formatTimestamp, getSeverityColor } from '../services/reportService';
import '../css/ReportDetailsModal.css';

const ReportDetailsModal = ({ report, onClose }) => {
  if (!report) return null;

  const severityColor = getSeverityColor(report.severity);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>Report #{report.id}</h2>
            <div 
              className="severity-badge"
              style={{ backgroundColor: severityColor }}
            >
              {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="report-section">
            <h3 className="section-title">Symptoms</h3>
            <p className="section-content">{report.symptoms}</p>
          </div>

          <div className="report-section">
            <h3 className="section-title">Possible Causes</h3>
            <div className="causes-list">
              {report.possible_causes.map((cause, index) => (
                <div key={index} className="cause-item">
                  <span className="cause-number">{index + 1}</span>
                  <span className="cause-text">{cause}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="report-section">
            <h3 className="section-title">First Aid Recommendations</h3>
            <div className="first-aid-list">
              {report.first_aid.map((recommendation, index) => (
                <div key={index} className="first-aid-item">
                  <span className="checkmark">✓</span>
                  <span className="recommendation-text">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="report-section">
            <h3 className="section-title">Assessment Details</h3>
            <div className="assessment-grid">
              <div className="assessment-item">
                <span className="assessment-label">Severity</span>
                <span 
                  className="assessment-value"
                  style={{ color: severityColor }}
                >
                  {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                </span>
              </div>
              <div className="assessment-item">
                <span className="assessment-label">Confidence</span>
                <span className="assessment-value">{report.confidence}%</span>
              </div>
              <div className="assessment-item">
                <span className="assessment-label">Specialist</span>
                <span className="assessment-value">{report.recommended_specialist}</span>
              </div>
            </div>
          </div>

          <div className="report-section">
            <h3 className="section-title">Report Information</h3>
            <div className="report-info">
              <div className="info-row">
                <span className="info-label">Report ID:</span>
                <span className="info-value">#{report.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Created:</span>
                <span className="info-value">{formatTimestamp(report.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;
