/**
 * Login Page Component
 * Handles user authentication through login form.
 * Premium healthcare authentication experience.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHeartbeat, FaBrain, FaShieldAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import '../css/Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await login(formData);
      navigate('/analyze');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Decorative Elements */}
      <div className="auth-background">
        <div className="floating-icon floating-icon-1">
          <FaHeartbeat />
        </div>
        <div className="floating-icon floating-icon-2">
          <FaBrain />
        </div>
        <div className="floating-icon floating-icon-3">
          <FaShieldAlt />
        </div>
        <div className="blur-circle blur-circle-1"></div>
        <div className="blur-circle blur-circle-2"></div>
      </div>

      <div className="auth-container">
        {/* Branding Section */}
        <div className="auth-branding">
          <div className="branding-logo">
            <FaHeartbeat className="branding-icon" />
            <h1 className="branding-title">RapidAid AI</h1>
          </div>
          <h2 className="branding-subtitle">Welcome Back</h2>
          <p className="branding-description">
            Sign in to access your personalized health dashboard and AI-powered medical analysis.
          </p>
          <div className="branding-features">
            <div className="branding-feature">
              <FaHeartbeat className="feature-icon" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="branding-feature">
              <FaShieldAlt className="feature-icon" />
              <span>Secure & Private</span>
            </div>
            <div className="branding-feature">
              <FaBrain className="feature-icon" />
              <span>24/7 Availability</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h3 className="auth-title">Sign In</h3>
              <p className="auth-subtitle">Enter your credentials to continue</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : (
                  <>
                    <span>Sign In</span>
                    <FaArrowRight className="btn-icon" />
                  </>
                )}
              </button>

              <div className="auth-footer auth-footer-spaced">
                <p>
                  <Link to="/reset-password" className="auth-link">
                    Forgot Password?
                  </Link>
                </p>
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-link">
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
