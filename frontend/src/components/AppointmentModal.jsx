import React from 'react';
import '../css/AppointmentModal.css';

const AppointmentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Schedule Appointment</h2>
          <button onClick={onClose} className="modal-close-button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
          <p className="modal-message">
            This feature will be available in an upcoming update. Soon you'll be able to book appointments, choose doctors, and schedule visits.
          </p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-button secondary">
            Close
          </button>
          <button onClick={onClose} className="modal-button primary">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
