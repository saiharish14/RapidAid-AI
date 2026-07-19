/**
 * FeatureCard Component
 * 
 * Reusable card component for displaying features with icon, title, and description.
 * Used throughout the application for consistent feature presentation.
 */

import React from 'react';
import '../css/FeatureCard.css';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>
      <h3 className="feature-title">
        {title}
      </h3>
      <p className="feature-description">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
