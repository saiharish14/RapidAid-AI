import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionTitle from '../components/SectionTitle';
import ReportCard from '../components/ReportCard';
import ReportDetailsModal from '../components/ReportDetailsModal';
import { getReports, deleteReport } from '../services/reportService';
import { FaSearch, FaFilter, FaTrash, FaFileMedical, FaStethoscope } from 'react-icons/fa';
import '../css/Reports.css';

function Reports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load reports. Please try again later.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply severity filter
    if (filter !== 'all') {
      filtered = filtered.filter(report => {
        const severity = report.severity.toLowerCase();
        if (filter === 'low') return severity === 'mild';
        if (filter === 'moderate') return severity === 'moderate';
        if (filter === 'high') return severity === 'severe' || severity === 'emergency';
        return true;
      });
    }

    setFilteredReports(filtered);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  const handleDeleteClick = (report, e) => {
    e.stopPropagation();
    setReportToDelete(report);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteReport(reportToDelete.id);
      setReports(reports.filter(r => r.id !== reportToDelete.id));
      setShowDeleteDialog(false);
      setReportToDelete(null);
      showNotification('Report deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting report:', err);
      showNotification('Failed to delete report', 'error');
      setShowDeleteDialog(false);
      setReportToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setReportToDelete(null);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getSeverityLabel = (severity) => {
    const s = severity?.toLowerCase() || 'moderate';
    if (s === 'mild') return 'Low';
    if (s === 'moderate') return 'Moderate';
    if (s === 'severe' || s === 'emergency') return 'High';
    return 'Moderate';
  };

  const getSeverityColor = (severity) => {
    const s = severity?.toLowerCase() || 'moderate';
    if (s === 'mild') return '#4CAF50';
    if (s === 'moderate') return '#FF9800';
    if (s === 'severe' || s === 'emergency') return '#F44336';
    return '#FF9800';
  };

  return (
    <div className="page">
      <Navbar />
      <main className="reports-page">
        <div className="container">
          {/* Hero Section */}
          <section className="reports-hero">
            <SectionTitle 
              title="Report History"
              subtitle="View your previous AI-powered medical analysis reports"
            />
          </section>

          {/* Search and Filter */}
          <section className="reports-controls">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search reports by symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-bar">
              <FaFilter className="filter-icon" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
          </section>

          {/* Reports Content */}
          <section className="reports-content">
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading reports...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button className="retry-button" onClick={fetchReports}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && filteredReports.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaFileMedical />
                </div>
                <h3>{reports.length === 0 ? 'No Reports Yet' : 'No Matching Reports'}</h3>
                <p>
                  {reports.length === 0 
                    ? "You haven't analyzed any symptoms yet. Start by using the Symptom Checker."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {reports.length === 0 && (
                  <Link to="/symptom-checker" className="analyze-button">
                    <FaStethoscope className="button-icon" />
                    <span>Analyze Symptoms</span>
                  </Link>
                )}
              </div>
            )}

            {!loading && !error && filteredReports.length > 0 && (
              <div className="reports-grid">
                {filteredReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <div 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(report.severity) }}
                      >
                        {getSeverityLabel(report.severity)}
                      </div>
                      <button
                        className="delete-button"
                        onClick={(e) => handleDeleteClick(report, e)}
                        title="Delete report"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="report-body" onClick={() => handleReportClick(report)}>
                      <h3 className="report-symptoms">
                        {report.symptoms.length > 60 
                          ? report.symptoms.substring(0, 60) + '...' 
                          : report.symptoms}
                      </h3>
                      <p className="report-date">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="report-footer">
                      <button 
                        className="view-button"
                        onClick={() => handleReportClick(report)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedReport && (
        <ReportDetailsModal 
          report={selectedReport} 
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="delete-dialog-overlay" onClick={handleDeleteCancel}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <h3>Delete Report</h3>
            </div>
            <div className="delete-dialog-body">
              <p>Are you sure you want to delete this report? This action cannot be undone.</p>
            </div>
            <div className="delete-dialog-footer">
              <button onClick={handleDeleteCancel} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="confirm-button">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Reports;
