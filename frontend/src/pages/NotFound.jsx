/**
 * 404 Not Found Page
 * 
 * Displayed when users navigate to a non-existent route.
 * Provides navigation back to the home page.
 */

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../css/NotFound.css';

function NotFound() {
  return (
    <div className="page">
      <Navbar />
      <main className="not-found-page">
        <div className="container">
          <div className="not-found-content">
            {/* Error Icon */}
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>

            {/* Error Code */}
            <h1 className="error-code">404</h1>

            {/* Error Message */}
            <h2 className="error-title">Page Not Found</h2>
            <p className="error-description">
              The page you are looking for doesn't exist or has been moved.
              Please check the URL or navigate back to the home page.
            </p>

            {/* Back to Home Button */}
            <Link to="/" className="home-button">
              <FaHome className="button-icon" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
