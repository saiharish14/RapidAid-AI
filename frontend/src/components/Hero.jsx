/**
 * Hero Component
 * 
 * Main hero section with headline, subheadline, and call-to-action buttons.
 * Features healthcare-themed design with responsive layout.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaArrowRight } from 'react-icons/fa';
import { SCROLL_TARGETS } from '../utils/scrollNavigation';
import '../css/Hero.css';

function Hero() {
  return (
    <section id={SCROLL_TARGETS.HERO} className="hero">
      <div className="hero-container">
        <div className="hero-content">
          {/* Icon */}
          <div className="hero-icon">
            <FaHeartbeat />
          </div>

          {/* Headline */}
          <h1 className="hero-title">
            RapidAid AI
          </h1>

          {/* Subheadline */}
          <p className="hero-subtitle">
            AI-powered Emergency Triage & First Aid Assistant
          </p>

          {/* Description */}
          <p className="hero-description">
            Get instant medical guidance and first aid recommendations powered by artificial intelligence. 
            Fast, reliable, and accessible healthcare support when you need it most.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <Link to="/symptom-checker" className="hero-button primary-button">
              Start Symptom Check
              <FaArrowRight className="button-icon" />
            </Link>
            <Link to="/how-it-works" className="hero-button secondary-button">
              Learn More
            </Link>
          </div>
        </div>

        {/* Hero Image/Illustration Area */}
        <div className="hero-visual">
          <div className="hero-circle"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
