import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionTitle from '../components/SectionTitle';
import { getReports } from '../services/reportService';
import { 
  FaFileMedical, 
  FaHeartbeat, 
  FaChartLine, 
  FaExclamationTriangle,
  FaStethoscope,
  FaCalendarAlt,
  FaTrophy,
  FaLightbulb
} from 'react-icons/fa';
import '../css/HealthDashboard.css';

function HealthDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load health data. Please try again later.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    if (reports.length === 0) {
      return {
        totalAnalyses: 0,
        lastDiagnosis: 'N/A',
        averageConfidence: 0,
        highestRisk: 'N/A',
        mostFrequentCondition: 'N/A'
      };
    }

    const totalAnalyses = reports.length;
    const lastDiagnosis = reports[0]?.symptoms ? reports[0].symptoms.substring(0, 50) + '...' : 'N/A';
    
    const confidences = reports.map(r => r.confidence || 85);
    const averageConfidence = Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length);
    
    const riskLevels = reports.map(r => getRiskLevel(r.severity));
    const severityOrder = { 'Critical': 3, 'High': 2, 'Moderate': 1, 'Low': 0 };
    const highestRisk = riskLevels.sort((a, b) => severityOrder[b] - severityOrder[a])[0];
    
    const conditions = reports.map(r => r.possible_causes?.[0] || r.symptoms?.substring(0, 30) || 'Unknown');
    const conditionCounts = conditions.reduce((acc, cond) => {
      acc[cond] = (acc[cond] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalAnalyses,
      lastDiagnosis,
      averageConfidence,
      highestRisk,
      mostFrequentCondition
    };
  };

  const getRiskLevel = (severity) => {
    const s = severity?.toLowerCase() || 'moderate';
    if (s === 'mild') return 'Low';
    if (s === 'moderate') return 'Moderate';
    if (s === 'severe' || s === 'emergency') return 'High';
    return 'Moderate';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Critical': return '#F44336';
      case 'High': return '#FF5722';
      case 'Moderate': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  // Calculate risk level distribution
  const getRiskDistribution = () => {
    if (reports.length === 0) return { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    
    const distribution = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    reports.forEach(report => {
      const risk = getRiskLevel(report.severity);
      distribution[risk]++;
    });
    return distribution;
  };

  // Calculate monthly analysis count
  const getMonthlyAnalysis = () => {
    if (reports.length === 0) return {};
    
    const monthlyData = {};
    reports.forEach(report => {
      const date = new Date(report.created_at);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    // Sort by date (last 6 months)
    const sortedMonths = Object.entries(monthlyData)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .slice(0, 6)
      .reverse();
    
    return Object.fromEntries(sortedMonths);
  };

  // Calculate Health Score (0-100)
  const calculateHealthScore = () => {
    if (reports.length === 0) return 0;
    
    let score = 100;
    
    // Factor 1: Average risk level (weight: 30%)
    const riskLevels = reports.map(r => getRiskLevel(r.severity));
    const riskValues = riskLevels.map(r => {
      switch(r) {
        case 'Critical': return 0;
        case 'High': return 25;
        case 'Moderate': return 50;
        case 'Low': return 75;
        default: return 50;
      }
    });
    const avgRiskValue = riskValues.reduce((a, b) => a + b, 0) / riskValues.length;
    score -= (100 - avgRiskValue) * 0.3;
    
    // Factor 2: Number of Critical reports (weight: 25%)
    const criticalCount = riskLevels.filter(r => r === 'Critical').length;
    score -= (criticalCount / reports.length) * 25;
    
    // Factor 3: Frequency of analyses (weight: 15%)
    // More regular monitoring is better
    const analysisFrequency = Math.min(reports.length / 10, 1);
    score += analysisFrequency * 15;
    
    // Factor 4: Trend (weight: 30%)
    if (reports.length >= 2) {
      const recentRisk = riskValues.slice(0, Math.ceil(reports.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(reports.length / 2);
      const olderRisk = riskValues.slice(Math.ceil(reports.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(reports.length / 2);
      const trend = recentRisk - olderRisk;
      score += trend * 30;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Get Health Score status
  const getHealthScoreStatus = (score) => {
    if (score >= 85) return { label: 'Excellent', color: '#4CAF50' };
    if (score >= 70) return { label: 'Good', color: '#8BC34A' };
    if (score >= 50) return { label: 'Fair', color: '#FF9800' };
    return { label: 'Needs Attention', color: '#F44336' };
  };

  // Generate AI Health Insights
  const generateHealthInsights = () => {
    const insights = [];
    
    if (reports.length < 3) {
      return ['Complete more symptom analyses to unlock AI Health Insights.'];
    }
    
    // Check for frequent symptoms
    const symptomWords = reports.map(r => r.symptoms?.toLowerCase().split(' ') || []);
    const allWords = symptomWords.flat();
    const wordCounts = allWords.reduce((acc, word) => {
      if (word.length > 3) {
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {});
    const frequentSymptoms = Object.entries(wordCounts)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (frequentSymptoms.length > 0) {
      const symptomNames = frequentSymptoms.map(([word]) => word).join(', ');
      insights.push(`You have reported "${symptomNames}" frequently in your analyses.`);
    }
    
    // Check risk trend
    if (reports.length >= 2) {
      const recentRisks = reports.slice(0, Math.ceil(reports.length / 2)).map(r => getRiskLevel(r.severity));
      const olderRisks = reports.slice(Math.ceil(reports.length / 2)).map(r => getRiskLevel(r.severity));
      
      const riskOrder = { 'Critical': 4, 'High': 3, 'Moderate': 2, 'Low': 1 };
      const recentAvg = recentRisks.reduce((sum, r) => sum + riskOrder[r], 0) / recentRisks.length;
      const olderAvg = olderRisks.reduce((sum, r) => sum + riskOrder[r], 0) / olderRisks.length;
      
      if (recentAvg < olderAvg) {
        insights.push('Your average risk level has decreased over time, which is a positive trend.');
      } else if (recentAvg > olderAvg) {
        insights.push('Your average risk level has increased over time. Monitor your health closely.');
      }
    }
    
    // Check for respiratory symptoms
    const respiratoryKeywords = ['cough', 'breath', 'chest', 'lung', 'respiratory', 'asthma'];
    const hasRespiratory = reports.some(r => 
      respiratoryKeywords.some(keyword => r.symptoms?.toLowerCase().includes(keyword))
    );
    if (hasRespiratory) {
      insights.push('Respiratory symptoms appear in your history. Consider monitoring air quality and avoiding irritants.');
    }
    
    // Check overall risk distribution
    const distribution = getRiskDistribution();
    const lowModerateCount = distribution.Low + distribution.Moderate;
    const highCriticalCount = distribution.High + distribution.Critical;
    
    if (lowModerateCount > highCriticalCount) {
      insights.push('Most of your analyses indicate low to moderate risk conditions, which is encouraging.');
    } else if (highCriticalCount > lowModerateCount) {
      insights.push('Several analyses indicate higher risk conditions. Consider consulting a physician for a comprehensive evaluation.');
    }
    
    // Check for repeated patterns
    if (frequentSymptoms.length >= 2) {
      insights.push('Similar symptom patterns appear repeatedly. If symptoms persist, seek professional medical advice.');
    }
    
    return insights.length > 0 ? insights : ['Continue monitoring your health with regular symptom analyses.'];
  };

  // Get top 5 most frequent conditions
  const getTopConditions = () => {
    if (reports.length === 0) return [];
    
    const conditions = reports.map(r => r.possible_causes?.[0] || r.symptoms?.substring(0, 30) || 'Unknown');
    const conditionCounts = conditions.reduce((acc, cond) => {
      acc[cond] = (acc[cond] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }));
  };

  // Get most frequent symptoms
  const getTopSymptoms = () => {
    if (reports.length === 0) return [];
    
    const symptomWords = reports.map(r => r.symptoms?.toLowerCase().split(' ') || []);
    const allWords = symptomWords.flat();
    const wordCounts = allWords.reduce((acc, word) => {
      if (word.length > 3) {
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {});
    
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));
  };

  // Get health trends data for line chart
  const getHealthTrendsData = () => {
    if (reports.length === 0) return [];
    
    // Get last 7 analyses in chronological order (oldest to newest)
    const last7Reports = reports.slice(0, 7).reverse();
    
    return last7Reports.map((report, index) => ({
      label: `Analysis ${index + 1}`,
      riskScore: (() => {
        const risk = getRiskLevel(report.severity);
        switch(risk) {
          case 'Critical': return 4;
          case 'High': return 3;
          case 'Moderate': return 2;
          case 'Low': return 1;
          default: return 2;
        }
      })()
    }));
  };

  // Get risk distribution for pie chart
  const getRiskDistributionData = () => {
    const distribution = getRiskDistribution();
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const stats = calculateStats();
  const riskDistribution = getRiskDistribution();
  const monthlyAnalysis = getMonthlyAnalysis();
  const recentActivity = reports.slice(0, 5);
  const healthScore = calculateHealthScore();
  const healthScoreStatus = getHealthScoreStatus(healthScore);
  const healthInsights = generateHealthInsights();
  const topConditions = getTopConditions();
  const topSymptoms = getTopSymptoms();
  const healthTrendsData = getHealthTrendsData();
  const riskDistributionData = getRiskDistributionData();
  const hasInsufficientHistory = reports.length < 3;

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <main className="health-dashboard-page">
          <div className="container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading health data...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Navbar />
        <main className="health-dashboard-page">
          <div className="container">
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-button" onClick={fetchReports}>Retry</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <main className="health-dashboard-page">
        <div className="container">
          {/* Hero Section */}
          <section className="dashboard-hero">
            <SectionTitle 
              title="Personal Health Dashboard"
              subtitle="Track your health analysis history and insights"
            />
          </section>

          {reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaFileMedical />
              </div>
              <h3>No Health Data Yet</h3>
              <p>You haven't analyzed any symptoms yet. Start by using the Symptom Checker.</p>
              <Link to="/symptom-checker" className="analyze-button">
                <FaStethoscope className="button-icon" />
                <span>Analyze Symptoms</span>
              </Link>
            </div>
          ) : hasInsufficientHistory ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaLightbulb />
              </div>
              <h3>AI Health Insights Locked</h3>
              <p>Complete more symptom analyses to unlock AI Health Insights and advanced trends.</p>
              <p className="hint-text">You need at least 3 analyses to unlock full insights.</p>
              <Link to="/symptom-checker" className="analyze-button">
                <FaStethoscope className="button-icon" />
                <span>Analyze Symptoms</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Cards with Health Score */}
              <section className="stats-section">
                <div className="stats-grid">
                  {/* Health Score Card */}
                  <div className="stat-card health-score-card">
                    <div className="health-score-circle">
                      <svg viewBox="0 0 36 36" className="circular-chart">
                        <path
                          className="circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="circle"
                          stroke={healthScoreStatus.color}
                          strokeDasharray={`${healthScore}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="percentage">
                          {healthScore}
                        </text>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Health Score</p>
                      <h3 className="stat-value" style={{ color: healthScoreStatus.color }}>
                        {healthScoreStatus.label}
                      </h3>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon total">
                      <FaFileMedical />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Total Analyses</p>
                      <h3 className="stat-value">{stats.totalAnalyses}</h3>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon condition">
                      <FaHeartbeat />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Most Common</p>
                      <h3 className="stat-value">{stats.mostFrequentCondition?.substring(0, 18)}...</h3>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon risk" style={{ color: getRiskColor(stats.highestRisk) }}>
                      <FaExclamationTriangle />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Highest Risk</p>
                      <h3 className="stat-value" style={{ color: getRiskColor(stats.highestRisk) }}>
                        {stats.highestRisk}
                      </h3>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon date">
                      <FaCalendarAlt />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Last Analysis</p>
                      <h3 className="stat-value">
                        {reports[0] ? new Date(reports[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                      </h3>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Health Insights */}
              <section className="insights-section">
                <h3 className="section-title">
                  <FaLightbulb className="title-icon" />
                  AI Health Insights
                </h3>
                <div className="insights-grid">
                  {healthInsights.map((insight, index) => (
                    <div key={index} className="insight-card">
                      <div className="insight-number">{index + 1}</div>
                      <p className="insight-text">{insight}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Health Trends Chart */}
              <section className="charts-section">
                <h3 className="section-title">
                  <FaChartLine className="title-icon" />
                  Health Trends Over Time
                </h3>
                <div className="chart-card full-width">
                  {healthTrendsData.length > 0 ? (
                    <div className="svg-chart-container">
                      <svg viewBox="0 0 700 350" className="line-chart-svg" preserveAspectRatio="xMidYMid meet">
                        {/* Grid lines and Y-axis labels */}
                        {[1, 2, 3, 4].map((i) => (
                          <g key={i}>
                            <line
                              x1="80"
                              y1={300 - i * 60}
                              x2="680"
                              y2={300 - i * 60}
                              stroke="#e3f2fd"
                              strokeWidth="1"
                            />
                            <text
                              x="70"
                              y={305 - i * 60}
                              textAnchor="end"
                              fontSize="12"
                              fill="#64748b"
                              fontWeight="500"
                            >
                              {['Low', 'Moderate', 'High', 'Critical'][i - 1]}
                            </text>
                          </g>
                        ))}
                        
                        {/* X-axis labels */}
                        {healthTrendsData.map((d, i) => (
                          <text
                            key={i}
                            x={80 + (i * (600 / (healthTrendsData.length - 1 || 1)))}
                            y="325"
                            textAnchor="middle"
                            fontSize="11"
                            fill="#64748b"
                          >
                            {d.label}
                          </text>
                        ))}
                        
                        {/* Line path */}
                        <polyline
                          fill="none"
                          stroke="#1976d2"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={healthTrendsData.map((d, i) => {
                            const x = 80 + (i * (600 / (healthTrendsData.length - 1 || 1)));
                            const y = 300 - (d.riskScore * 60);
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                        
                        {/* Data points */}
                        {healthTrendsData.map((d, i) => {
                          const x = 80 + (i * (600 / (healthTrendsData.length - 1 || 1)));
                          const y = 300 - (d.riskScore * 60);
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="6"
                              fill="#1976d2"
                              stroke="#fff"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <p className="no-data-placeholder">Complete more analyses to view trends</p>
                  )}
                </div>
              </section>

              {/* Diagnosis Insights */}
              <section className="diagnosis-insights-section">
                <h3 className="section-title">
                  <FaTrophy className="title-icon" />
                  Diagnosis Insights
                </h3>
                <div className="diagnosis-grid">
                  {/* Top Conditions */}
                  <div className="diagnosis-card">
                    <h4 className="diagnosis-card-title">Top 5 Conditions</h4>
                    {topConditions.length > 0 ? (
                      <>
                        {topConditions.length === 1 && (
                          <p className="conditions-subtitle">
                            Only one unique condition found from {stats.totalAnalyses} {stats.totalAnalyses === 1 ? 'analysis' : 'analyses'}.
                          </p>
                        )}
                        <div className="diagnosis-list">
                          {topConditions.map((item, index) => {
                            const percentage = Math.round((item.count / stats.totalAnalyses) * 100);
                            return (
                              <div key={index} className="diagnosis-item">
                                <span className="diagnosis-rank">#{index + 1}</span>
                                <div className="diagnosis-info">
                                  <span className="diagnosis-name">{item.condition?.substring(0, 30)}...</span>
                                  <div className="progress-bar-container">
                                    <div 
                                      className="progress-bar-fill"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="diagnosis-stats">
                                  <span className="diagnosis-count">{item.count}x</span>
                                  <span className="diagnosis-percentage">{percentage}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <p className="no-data-placeholder">Complete more analyses to view conditions</p>
                    )}
                  </div>

                  {/* Top Symptoms */}
                  <div className="diagnosis-card">
                    <h4 className="diagnosis-card-title">Frequent Symptoms</h4>
                    {topSymptoms.length > 0 ? (
                      <div className="diagnosis-list symptoms-list">
                        {topSymptoms.map((item, index) => (
                          <div key={index} className="diagnosis-item">
                            <span className="diagnosis-rank">#{index + 1}</span>
                            <div className="diagnosis-info">
                              <span className="diagnosis-name">{item.symptom}</span>
                            </div>
                            <span className="diagnosis-count">{item.count}x</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data-placeholder">Complete more analyses to view symptoms</p>
                    )}
                  </div>

                  {/* Risk Distribution */}
                  <div className="diagnosis-card">
                    <h4 className="diagnosis-card-title">Risk Distribution</h4>
                    {riskDistributionData.some(entry => entry.value > 0) ? (
                      <>
                        <p className="risk-subtitle">Distribution of analysis severity across all reports</p>
                        <div className="risk-bars-container">
                          {riskDistributionData.map((entry) => {
                            const percentage = Math.round((entry.value / stats.totalAnalyses) * 100);
                            return (
                              <div key={entry.name} className="risk-bar-item">
                                <div className="risk-bar-info">
                                  <span className="risk-bar-label">{entry.name}</span>
                                  <span className="risk-bar-percentage">{percentage}%</span>
                                </div>
                                <div className="risk-bar-track">
                                  <div 
                                    className="risk-bar-fill"
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: getRiskColor(entry.name)
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="risk-footer">
                          <div className="risk-footer-item">
                            <span className="risk-footer-label">Total Analyses</span>
                            <span className="risk-footer-value">{stats.totalAnalyses}</span>
                          </div>
                          <div className="risk-footer-item">
                            <span className="risk-footer-label">Dominant Risk</span>
                            <span 
                              className="risk-footer-value" 
                              style={{ color: getRiskColor(stats.highestRisk) }}
                            >
                              {stats.highestRisk}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="no-data-placeholder">Complete more analyses to view risk distribution</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Monthly Analysis Count */}
              <section className="charts-section">
                <h3 className="section-title">
                  <FaCalendarAlt className="title-icon" />
                  Monthly Analysis Count
                </h3>
                <div className="chart-card full-width">
                  <div className="chart-content">
                    {Object.entries(monthlyAnalysis).length > 0 ? (
                      Object.entries(monthlyAnalysis).map(([month, count]) => (
                        <div key={month} className="chart-bar">
                          <div className="bar-label">
                            <span className="month-label">{month}</span>
                            <span className="bar-count">{count}</span>
                          </div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(monthlyAnalysis))) * 100}%`,
                                backgroundColor: '#1976d2'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">No data available</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="recent-activity-section">
                <h3 className="section-title">
                  <FaCalendarAlt className="title-icon" />
                  Recent Activity
                </h3>
                <div className="activity-list">
                  {recentActivity.map((report, index) => (
                    <div key={report.id} className="activity-item">
                      <div className="activity-number">{index + 1}</div>
                      <div className="activity-content">
                        <h4 className="activity-symptoms">
                          {report.symptoms?.substring(0, 60)}...
                        </h4>
                        <div className="activity-meta">
                          <span 
                            className="activity-risk"
                            style={{ color: getRiskColor(getRiskLevel(report.severity)) }}
                          >
                            {getRiskLevel(report.severity)}
                          </span>
                          <span className="activity-date">
                            {new Date(report.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <Link to={`/reports`} className="activity-link">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HealthDashboard;
