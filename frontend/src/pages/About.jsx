/**
 * About Page
 * 
 * Information about RapidAid AI, its mission, and the team.
 * Explains the purpose and goals of the application.
 */

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionTitle from '../components/SectionTitle';
import { FaHeartbeat, FaUsers, FaShieldAlt, FaLightbulb } from 'react-icons/fa';
import '../css/About.css';

function About() {
  return (
    <div className="page">
      <Navbar />
      <main className="about-page">
        <div className="container">
          {/* Hero Section */}
          <section className="about-hero">
            <SectionTitle 
              title="About RapidAid AI"
              subtitle="Revolutionizing emergency medical care with artificial intelligence"
            />
            <p className="about-intro">
              RapidAid AI is an innovative healthcare solution designed to provide instant medical guidance 
              and first aid recommendations during emergency situations. Our mission is to make healthcare 
              accessible, reliable, and fast for everyone, everywhere.
            </p>
          </section>

          {/* Mission Section */}
          <section className="about-section">
            <h2 className="section-heading">Our Mission</h2>
            <p className="about-text">
              To bridge the gap between medical emergencies and professional care by providing 
              AI-powered triage and first aid assistance that is accurate, accessible, and 
              available 24/7. We believe that everyone deserves immediate access to medical 
              guidance when they need it most.
            </p>
          </section>

          {/* Values Section */}
          <section className="about-section">
            <h2 className="section-heading">Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <FaHeartbeat className="value-icon" />
                <h3 className="value-title">Health First</h3>
                <p className="value-description">
                  Patient health and safety are our top priorities in every decision we make.
                </p>
              </div>
              <div className="value-card">
                <FaUsers className="value-icon" />
                <h3 className="value-title">Accessibility</h3>
                <p className="value-description">
                  Healthcare should be accessible to everyone, regardless of location or circumstances.
                </p>
              </div>
              <div className="value-card">
                <FaShieldAlt className="value-icon" />
                <h3 className="value-title">Trust & Safety</h3>
                <p className="value-description">
                  We maintain the highest standards of data privacy and medical accuracy.
                </p>
              </div>
              <div className="value-card">
                <FaLightbulb className="value-icon" />
                <h3 className="value-title">Innovation</h3>
                <p className="value-description">
                  Leveraging cutting-edge AI to solve real-world healthcare challenges.
                </p>
              </div>
            </div>
          </section>

          {/* Hackathon Section */}
          <section className="about-section hackathon-section">
            <h2 className="section-heading">Built for Innovation</h2>
            <p className="about-text">
              This project was developed for the Healthcare Innovation Hackathon, bringing together 
              passionate developers, healthcare professionals, and AI experts to create solutions 
              that save lives and improve emergency care outcomes.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default About;
