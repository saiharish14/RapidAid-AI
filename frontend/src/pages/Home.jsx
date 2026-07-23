/**
 * Home Page Component
 * 
 * Main landing page with Hero, Why Choose, Features, How It Works, and Emergency Disclaimer sections.
 * Provides comprehensive overview of RapidAid AI capabilities.
 */

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import FeatureCard from '../components/FeatureCard';
import { FaHeartbeat, FaClock, FaShieldAlt, FaUserMd, FaBrain, FaMobileAlt, FaExclamationTriangle, FaIdCard, FaBoxOpen, FaBell } from 'react-icons/fa';
import { scrollToSection, SCROLL_TARGETS } from '../utils/scrollNavigation';
import '../css/Home.css';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location?.state?.scrollTo) {
      scrollToSection(location.state.scrollTo);
      if (window?.history?.replaceState) {
        const historyState = window.history.state || {};
        window.history.replaceState({ ...historyState, scrollTo: undefined }, '');
      }
    }
  }, [location]);

  const features = [
    {
      icon: <FaBrain />,
      title: 'AI-Powered Analysis',
      description: 'Advanced artificial intelligence analyzes your symptoms and provides accurate medical guidance based on established healthcare protocols.'
    },
    {
      icon: <FaClock />,
      title: 'Instant Results',
      description: 'Receive immediate first aid recommendations and triage assessment without waiting for appointments or long queues.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Privacy Protected',
      description: 'Your health information is processed securely with end-to-end encryption and never shared without your consent.'
    },
    {
      icon: <FaMobileAlt />,
      title: 'Accessible Anywhere',
      description: 'Access medical guidance from anywhere, anytime using any device with internet connectivity.'
    },
    {
      icon: <FaUserMd />,
      title: 'Evidence-Based',
      description: 'Our recommendations are based on verified medical knowledge and follow established clinical guidelines.'
    },
    {
      icon: <FaHeartbeat />,
      title: '24/7 Availability',
      description: 'Get medical guidance around the clock, even when healthcare facilities are closed or unavailable.'
    }
  ];

  const emergencyFeatures = [
    {
      icon: <FaIdCard />,
      title: 'Medical ID',
      description: 'Store your medical information and emergency contacts for quick access during emergencies.',
      onClick: () => navigate('/medical-id')
    },
    {
      icon: <FaBoxOpen />,
      title: 'Preparedness Kit',
      description: 'Track your emergency supplies and stay prepared for any disaster situation.',
      onClick: () => navigate('/preparedness-kit')
    },
    {
      icon: <FaBell />,
      title: 'Disaster Alerts',
      description: 'Stay informed about emergencies and natural disasters in your area with real-time alerts.',
      onClick: () => navigate('/disaster-alerts')
    }
  ];

  const howItWorks = [
    {
      icon: <FaHeartbeat />,
      title: 'Describe Symptoms',
      description: 'Enter your symptoms through our easy-to-use interface'
    },
    {
      icon: <FaBrain />,
      title: 'AI Analysis',
      description: 'Our AI processes your information using medical knowledge bases'
    },
    {
      icon: <FaUserMd />,
      title: 'Get Recommendations',
      description: 'Receive personalized first aid guidance and triage level'
    }
  ];

  return (
    <div className="page">
      <Navbar />
      <main className="home-page">
        {/* Hero Section */}
        <Hero />

        {/* Why Choose Section */}
        <section className="why-choose-section">
          <div className="container">
            <SectionTitle 
              title="Why Choose RapidAid AI"
              subtitle="Fast, reliable, and accessible healthcare support"
            />
            <div className="why-choose-content">
              <div className="why-choose-text">
                <p className="why-description">
                  In emergency situations, every second counts. RapidAid AI bridges the gap between 
                  symptom onset and professional medical care by providing instant, AI-powered guidance 
                  that helps you make informed decisions about your health.
                </p>
                <div className="why-stats">
                  <div className="stat-item">
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">Availability</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">&lt;30s</div>
                    <div className="stat-label">Response Time</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">95%</div>
                    <div className="stat-label">Accuracy Rate</div>
                  </div>
                </div>
              </div>
              <div className="why-choose-visual">
                <div className="visual-circle"></div>
                <div className="visual-circle visual-circle-2"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <SectionTitle 
              title="Key Features"
              subtitle="Comprehensive tools for emergency medical guidance"
            />
            <div className="features-grid">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Features Section */}
        <section className="emergency-features-section">
          <div className="container">
            <SectionTitle 
              title="Emergency Tools"
              subtitle="Quick access to essential emergency features"
            />
            <div className="emergency-features-grid">
              {emergencyFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className="emergency-feature-card"
                  onClick={feature.onClick}
                >
                  <div className="emergency-feature-icon">
                    {feature.icon}
                  </div>
                  <h3 className="emergency-feature-title">{feature.title}</h3>
                  <p className="emergency-feature-description">{feature.description}</p>
                  <div className="emergency-feature-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <div className="container">
            <SectionTitle 
              title="How It Works"
              subtitle="Simple steps to get instant medical guidance"
            />
            <div className="how-it-works-steps">
              {howItWorks.map((step, index) => (
                <div key={index} className="how-step">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <div className="step-icon">{step.icon}</div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Disclaimer Section */}
        <section className="emergency-disclaimer-section">
          <div className="container">
            <div className="disclaimer-banner">
              <div className="disclaimer-icon-wrapper">
                <FaExclamationTriangle className="disclaimer-icon" />
              </div>
              <div className="disclaimer-content">
                <h3 className="disclaimer-title">Emergency Disclaimer</h3>
                <p className="disclaimer-text">
                  RapidAid AI is not a substitute for professional medical advice, diagnosis, or treatment. 
                  If you are experiencing a medical emergency, call emergency services immediately. 
                  Always seek the advice of your physician or qualified health provider with any questions 
                  you may have regarding a medical condition.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
