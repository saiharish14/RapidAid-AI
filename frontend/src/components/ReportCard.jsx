import React from 'react';
import { formatTimestamp, getSeverityColor } from '../services/reportService';
import '../css/ReportCard.css';

const ReportCard = ({ report, onClick }) => {
  const severityColor = getSeverityColor(report.severity);

  return (
    <div className="report-card" onClick={() => onClick(report)}>
      <div className="report-card-header">
        <div className="report-id">#{report.id}</div>
        <div 
          className="severity-badge"
          style={{ backgroundColor: severityColor }}
        >
          {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
        </div>
      </div>

      <div className="report-card-body">
        <h3 className="report-symptoms">{report.symptoms}</h3>
        
        <div className="report-meta">
          <div className="meta-item">
            <span className="meta-label">Confidence:</span>
            <span className="meta-value">{report.confidence}%</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Specialist:</span>
            <span className="meta-value">{report.recommended_specialist}</span>
          </div>
        </div>

        <div className="report-causes">
          <span className="causes-label">Possible Causes:</span>
          <div className="causes-list">
            {report.possible_causes.slice(0, 2).map((cause, index) => (
              <span key={index} className="cause-tag">
                {cause}
              </span>
            ))}
            {report.possible_causes.length > 2 && (
              <span className="cause-tag more">
                +{report.possible_causes.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="report-card-footer">
        <div className="report-date">
          {formatTimestamp(report.created_at)}
        </div>
        <div className="report-arrow">
          →
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
