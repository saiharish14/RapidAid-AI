/**
 * Navbar Component
 * 
 * Main navigation bar with logo, navigation links, and emergency button.
 * Features responsive mobile menu with hamburger toggle and profile dropdown.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaHeartbeat, FaSignOutAlt, FaUser, FaChevronDown, FaIdCard, FaBoxOpen } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { createHomeNavigation, scrollToSection, SCROLL_TARGETS } from '../utils/scrollNavigation';
import '../css/Navbar.css';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' && isHeroVisible;
    }
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    closeMobileMenu();
    setShowProfileDropdown(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleHomeNavigation = (event) => {
    if (event) event.preventDefault();
    closeMobileMenu();
    if (location.pathname === '/') {
      scrollToSection(SCROLL_TARGETS.HERO);
    } else {
      createHomeNavigation(navigate, SCROLL_TARGETS.HERO);
    }
  };

  const handleAnalyzeNavigation = (event) => {
    if (event) event.preventDefault();
    closeMobileMenu();
    navigate('/symptom-checker');
  };

  const handleEmergencyNavigation = (event) => {
    if (event) event.preventDefault();
    closeMobileMenu();
    navigate('/emergency-sos');
  };

  useEffect(() => {
    closeMobileMenu();
    setShowProfileDropdown(false);
    if (location.pathname !== '/') {
      setIsHeroVisible(false);
      return;
    }

    const heroEl = document.getElementById(SCROLL_TARGETS.HERO);
    if (!heroEl) {
      setIsHeroVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting && entry.intersectionRatio > 0.35);
      },
      {
        root: null,
        rootMargin: '0px 0px -65% 0px',
        threshold: [0.35],
      }
    );

    observer.observe(heroEl);
    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getDisplayName = () => {
    if (user && user.full_name) {
      return user.full_name.split(' ')[0]; // First name only
    }
    return null;
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={handleHomeNavigation}>
            <FaHeartbeat className="logo-icon" />
            <span className="logo-text">RapidAid AI</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="navbar-menu desktop-menu">
            {isAuthenticated ? (
              <>
                <li className="navbar-item">
                  <button type="button" className={`navbar-link ${isActive('/') ? 'active' : ''}`} onClick={handleHomeNavigation}>Home</button>
                </li>
                <li className="navbar-item">
                  <button type="button" className={`navbar-link ${isActive('/symptom-checker') || isActive('/analyze') ? 'active' : ''}`} onClick={handleAnalyzeNavigation}>Analyze</button>
                </li>
                <li className="navbar-item">
                  <Link to="/reports" className={`navbar-link ${isActive('/reports') ? 'active' : ''}`}>Reports</Link>
                </li>
              </>
            ) : (
              <>
                <li className="navbar-item">
                  <button type="button" className={`navbar-link ${isActive('/') ? 'active' : ''}`} onClick={handleHomeNavigation}>Home</button>
                </li>
                <li className="navbar-item">
                  <Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/how-it-works" className={`navbar-link ${isActive('/how-it-works') ? 'active' : ''}`}>How It Works</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/login" className={`navbar-link ${isActive('/login') ? 'active' : ''}`}>Login</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/register" className={`navbar-link ${isActive('/register') ? 'active' : ''}`}>Register</Link>
                </li>
              </>
            )}
          </ul>

          {/* Right Side Actions */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                {/* Emergency Button */}
                <button type="button" className="emergency-button" onClick={handleEmergencyNavigation}>
                  <FaHeartbeat className="emergency-icon" />
                  <span>Emergency</span>
                </button>

                {/* Profile Dropdown */}
                <div className="profile-section" ref={dropdownRef}>
                  <button 
                    className="profile-button" 
                    onClick={toggleProfileDropdown}
                    aria-label="Profile menu"
                  >
                    <div className="profile-avatar">
                      <FaUser className="avatar-icon" />
                    </div>
                    {getDisplayName() && (
                      <span className="profile-name">{getDisplayName()}</span>
                    )}
                    <FaChevronDown className={`dropdown-arrow ${showProfileDropdown ? 'open' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="profile-dropdown">
                      <Link 
                        to="/reports" 
                        className="dropdown-item"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaUser className="dropdown-item-icon" />
                        <span>My Reports</span>
                      </Link>
                      <Link 
                        to="/medical-id" 
                        className="dropdown-item"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaIdCard className="dropdown-item-icon" />
                        <span>Medical ID</span>
                      </Link>
                      <Link 
                        to="/preparedness-kit" 
                        className="dropdown-item"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaBoxOpen className="dropdown-item-icon" />
                        <span>Preparedness Kit</span>
                      </Link>
                      <button 
                        className="dropdown-item dropdown-item-danger"
                        onClick={handleLogoutClick}
                      >
                        <FaSignOutAlt className="dropdown-item-icon" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <ul className={`navbar-menu mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <button type="button" className={`navbar-link ${isActive('/') ? 'active' : ''}`} onClick={handleHomeNavigation}>Home</button>
              </li>
              <li className="navbar-item">
                <button type="button" className={`navbar-link ${isActive('/symptom-checker') || isActive('/analyze') ? 'active' : ''}`} onClick={handleAnalyzeNavigation}>Analyze</button>
              </li>
              <li className="navbar-item">
                <Link to="/reports" className={`navbar-link ${isActive('/reports') ? 'active' : ''}`} onClick={closeMobileMenu}>Reports</Link>
              </li>
              <li className="navbar-item">
                <Link to="/medical-id" className={`navbar-link ${isActive('/medical-id') ? 'active' : ''}`} onClick={closeMobileMenu}>Medical ID</Link>
              </li>
              <li className="navbar-item">
                <Link to="/preparedness-kit" className={`navbar-link ${isActive('/preparedness-kit') ? 'active' : ''}`} onClick={closeMobileMenu}>Preparedness Kit</Link>
              </li>
              <li className="navbar-item">
                <button type="button" className="emergency-button mobile-emergency" onClick={handleEmergencyNavigation}>
                  <FaHeartbeat className="emergency-icon" />
                  <span>Emergency</span>
                </button>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogoutClick} className="mobile-logout-button">
                  <FaSignOutAlt className="logout-icon" />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <button type="button" className="navbar-link" onClick={handleHomeNavigation}>Home</button>
              </li>
              <li className="navbar-item">
                <Link to="/about" className="navbar-link" onClick={closeMobileMenu}>About</Link>
              </li>
              <li className="navbar-item">
                <Link to="/how-it-works" className="navbar-link" onClick={closeMobileMenu}>How It Works</Link>
              </li>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link" onClick={closeMobileMenu}>Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="logout-dialog-overlay" onClick={handleLogoutCancel}>
          <div className="logout-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="logout-dialog-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="logout-dialog-body">
              <p>Are you sure you want to log out?</p>
            </div>
            <div className="logout-dialog-footer">
              <button onClick={handleLogoutCancel} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleLogoutConfirm} className="confirm-button">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
