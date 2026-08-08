/**
 * SectionTitle Component
 * 
 * Reusable section title with optional subtitle.
 * Provides consistent heading styling across all sections.
 */

import React from 'react';
import '../css/SectionTitle.css';

function SectionTitle({ title, subtitle }) {
  return (
    <div className="section-title">
      <h2 className="section-title-text">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

export default SectionTitle;
