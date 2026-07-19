/**
 * How It Works Page
 * 
 * Explains the step-by-step process of using RapidAid AI.
 * Guides users through the symptom checking workflow.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionTitle from '../components/SectionTitle';
import FeatureCard from '../components/FeatureCard';
import { FaKeyboard, FaBrain, FaListAlt, FaShieldAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import '../css/HowItWorks.css';

function HowItWorks() {
  const steps = [
    {
      icon: <FaKeyboard />,
      title: 'Describe Symptoms',
      description: 'Enter your symptoms and medical information through our intuitive interface. Be as detailed as possible for accurate assessment.'
    },
    {
      icon: <FaBrain />,
      title: 'AI Analysis',
      description: 'Our advanced AI analyzes your symptoms using medical knowledge bases to identify potential conditions and severity levels.'
    },
    {
      icon: <FaListAlt />,
      title: 'Receive Recommendations',
      description: 'Get personalized first aid recommendations, triage level, and guidance on whether to seek immediate medical attention.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Stay Safe',
      description: 'Follow the provided recommendations while monitoring your condition. Always consult healthcare professionals for serious concerns.'
    }
  ];

  const features = [
    {
      icon: <FaClock />,
      title: 'Instant Results',
      description: 'Get immediate medical guidance without waiting for appointments or long queues.'
    },
    {
      icon: <FaCheckCircle />,
      title: 'Evidence-Based',
      description: 'Our AI is trained on verified medical information and follows established healthcare protocols.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Privacy First',
      description: 'Your health information is processed securely and never shared without your consent.'
    }
  ];

  return (
    <div className="page">
      <Navbar />
      <main className="how-it-works-page">
        <div className="container">
          {/* Hero Section */}
          <section className="how-hero">
            <SectionTitle 
              title="How It Works"
              subtitle="Simple steps to get instant medical guidance"
            />
            <p className="how-intro">
              RapidAid AI makes it easy to get medical guidance when you need it most. 
              Follow these simple steps to receive personalized first aid recommendations.
            </p>
          </section>

          {/* Steps Section */}
          <section className="steps-section">
            <h2 className="section-heading">Step-by-Step Process</h2>
            <div className="steps-container">
              {steps.map((step, index) => (
                <div key={index} className="step-card">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <div className="step-icon">{step.icon}</div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <h2 className="section-heading">Why Choose RapidAid AI</h2>
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
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Try our symptom checker now and receive instant medical guidance.
            </p>
            <Link to="/symptom-checker" className="cta-button">
              Start Symptom Check
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HowItWorks;
