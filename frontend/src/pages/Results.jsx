/**
 * Results Page
 * 
 * Displays the results of symptom analysis using the premium Results Dashboard.
 * Receives actual AI analysis results from the backend API.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ResultsDashboard from '../components/ResultsDashboard';
import '../css/Results.css';

function Results() {
  const location = useLocation();
  const analysisResult = location.state?.analysisResult;

  return (
    <div className="page">
      <Navbar />
      <main className="results-page">
        <ResultsDashboard analysisData={analysisResult} />
      </main>
      <Footer />
    </div>
  );
}

export default Results;
