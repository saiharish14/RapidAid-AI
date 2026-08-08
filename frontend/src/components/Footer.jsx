/**
 * Footer Component
 * 
 * Footer with project name, hackathon theme, quick links, and medical disclaimer.
 * Provides essential information and navigation.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeartbeat } from 'react-icons/fa';
import { createHomeNavigation, SCROLL_TARGETS } from '../utils/scrollNavigation';
import '../css/Footer.css';

function Footer() {
  const navigate = useNavigate();

  const handleHomeNavigation = (event) => {
    event.preventDefault();
    createHomeNavigation(navigate, SCROLL_TARGETS.HERO);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and Description */}
        <div className="footer-section">
          <div className="footer-logo">
            <FaHeartbeat className="footer-logo-icon" />
            <span className="footer-logo-text">RapidAid AI</span>
          </div>
          <p className="footer-description">
            AI-powered Emergency Triage & First Aid Assistant
          </p>
          <p className="footer-theme">
            Built for Healthcare Innovation Hackathon
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li>
              <Link to="/" className="footer-link" onClick={handleHomeNavigation}>Home</Link>
            </li>
            <li>
              <Link to="/about" className="footer-link">About</Link>
            </li>
            <li>
              <Link to="/how-it-works" className="footer-link">How It Works</Link>
            </li>
            <li>
              <Link to="/symptom-checker" className="footer-link">Symptom Checker</Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-section">
          <h3 className="footer-title">Resources</h3>
          <ul className="footer-links">
            <li>
              <a href="https://www.redcross.org" target="_blank" rel="noopener noreferrer" className="footer-link">
                Red Cross
              </a>
            </li>
            <li>
              <a href="https://www.mayoclinic.org" target="_blank" rel="noopener noreferrer" className="footer-link">
                Mayo Clinic
              </a>
            </li>
            <li>
              <a href="https://www.who.int" target="_blank" rel="noopener noreferrer" className="footer-link">
                WHO
              </a>
            </li>
          </ul>
        </div>

        {/* Medical Disclaimer */}
        <div className="footer-section disclaimer-section">
          <h3 className="footer-title">Medical Disclaimer</h3>
          <p className="footer-disclaimer">
            This tool provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2024 RapidAid AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
