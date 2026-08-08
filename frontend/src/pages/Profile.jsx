/**
 * Profile Page Component
 * 
 * Professional profile management with health summary, preferences, and account actions.
 * Phase 4 – Profile Management Module implementation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaClock, 
  FaEdit, 
  FaCamera,
  FaLock,
  FaChartLine,
  FaHeartbeat,
  FaExclamationTriangle,
  FaIdCard,
  FaUsers,
  FaGlobe,
  FaMapMarkerAlt,
  FaBell,
  FaMoon,
  FaFileMedical,
  FaTrophy,
  FaFirstAid,
  FaSignOutAlt,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { getReports } from '../services/reportService';
import '../css/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  
  // Profile completion state
  const [profileCompletion, setProfileCompletion] = useState(0);
  
  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  
  // Change password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Preferences state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [locationPermission, setLocationPermission] = useState('granted');
  
  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Health summary data
  const [healthSummary, setHealthSummary] = useState({
    totalAnalyses: 0,
    healthScore: 0,
    lastDiagnosis: 'N/A',
    highestRisk: 'N/A',
    medicalIdStatus: 'Not Set',
    emergencyContactsCount: 0
  });

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load reports for health summary
      const reportsData = await getReports();
      setReports(reportsData);
      
      // Calculate health summary
      const totalAnalyses = reportsData.length;
      const lastDiagnosis = reportsData.length > 0 
        ? reportsData[0].possible_causes?.[0] || 'N/A' 
        : 'N/A';
      
      let highestRisk = 'Low';
      reportsData.forEach(report => {
        if (report.severity === 'Critical') highestRisk = 'Critical';
        else if (report.severity === 'High' && highestRisk !== 'Critical') highestRisk = 'High';
        else if (report.severity === 'Moderate' && highestRisk === 'Low') highestRisk = 'Moderate';
      });
      
      // Calculate health score (simplified)
      const healthScore = totalAnalyses > 0 ? 75 : 100;
      
      setHealthSummary({
        totalAnalyses,
        healthScore,
        lastDiagnosis,
        highestRisk,
        medicalIdStatus: 'Active',
        emergencyContactsCount: 3
      });
      
      // Calculate profile completion
      calculateProfileCompletion();
      
      // Set initial edit name
      if (user?.full_name) {
        setEditName(user.full_name);
      }
      
      // Set profile picture preview from user data
      if (user?.profile_picture) {
        setProfilePicturePreview(user.profile_picture);
      } else {
        setProfilePicturePreview('');
      }
      
      // Check location permission
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' })
          .then(result => {
            setLocationPermission(result.state);
          })
          .catch(() => setLocationPermission('unknown'));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    const total = 6;
    
    if (user?.full_name) completed++;
    if (user?.email) completed++;
    if (profilePicturePreview || user?.profile_picture) completed++;
    if (healthSummary.medicalIdStatus === 'Active') completed++;
    if (healthSummary.emergencyContactsCount > 0) completed++;
    if (language !== 'en') completed++;
    
    const percentage = Math.round((completed / total) * 100);
    setProfileCompletion(percentage);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
        setProfilePicture(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const profileData = { full_name: editName };
      if (profilePicture) {
        profileData.profile_picture = profilePicturePreview;
      }
      const response = await updateProfile(profileData);
      setIsEditingProfile(false);
      setProfilePicture(null);
      calculateProfileCompletion();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed successfully');
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }
    
    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      alert('Failed to delete account: ' + error.message);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#2196F3';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Critical': return '#F44336';
      case 'High': return '#FF5722';
      case 'Moderate': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="profile-page">
          <div className="container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <div className="profile-page">
        <div className="container">
          <div className="profile-header">
            <FaUser className="header-icon" />
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your account and preferences</p>
          </div>

          {/* Profile Completion Card */}
          <div className="profile-completion-card">
            <div className="completion-header">
              <h3>Profile Completion</h3>
              <span className="completion-percentage">{profileCompletion}%</span>
            </div>
            <div className="completion-bar">
              <div 
                className="completion-fill" 
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <p className="completion-message">
              {profileCompletion === 100 
                ? 'Your profile is complete!' 
                : `Complete your profile to get ${100 - profileCompletion}% more benefits`}
            </p>
          </div>

          <div className="profile-grid">
            {/* Profile Information Section */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Profile Information</h3>
                <button 
                  className="edit-button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                  <FaEdit />
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <div className="profile-picture-section">
                <div className="profile-picture-wrapper">
                  {profilePicturePreview ? (
                    <img 
                      src={profilePicturePreview} 
                      alt="Profile" 
                      className="profile-picture"
                    />
                  ) : (
                    <div className="profile-picture-placeholder">
                      <FaUser />
                    </div>
                  )}
                  {isEditingProfile && (
                    <label className="picture-upload-label">
                      <FaCamera />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="picture-input"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="profile-info">
                <div className="info-item">
                  <FaUser className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Full Name</span>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="info-value">{user?.full_name || 'Not set'}</span>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <FaEnvelope className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user?.email || 'Not set'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaCalendarAlt className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <FaClock className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Last Login</span>
                    <span className="info-value">Today</span>
                  </div>
                </div>
              </div>

              {isEditingProfile && (
                <button className="save-button" onClick={handleSaveProfile}>
                  Save Changes
                </button>
              )}
            </div>

            {/* Health Summary Section */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Health Summary</h3>
                <FaChartLine className="card-icon" />
              </div>

              <div className="health-summary">
                <div className="summary-item">
                  <FaFileMedical className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Total Analyses</span>
                    <span className="summary-value">{healthSummary.totalAnalyses}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <FaTrophy className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Health Score</span>
                    <span 
                      className="summary-value"
                      style={{ color: getHealthScoreColor(healthSummary.healthScore) }}
                    >
                      {healthSummary.healthScore}/100
                    </span>
                  </div>
                </div>

                <div className="summary-item">
                  <FaHeartbeat className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Last Diagnosis</span>
                    <span className="summary-value">{healthSummary.lastDiagnosis}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <FaExclamationTriangle className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Highest Risk</span>
                    <span 
                      className="summary-value"
                      style={{ color: getRiskColor(healthSummary.highestRisk) }}
                    >
                      {healthSummary.highestRisk}
                    </span>
                  </div>
                </div>

                <div className="summary-item">
                  <FaIdCard className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Medical ID Status</span>
                    <span className="summary-value">{healthSummary.medicalIdStatus}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <FaUsers className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Emergency Contacts</span>
                    <span className="summary-value">{healthSummary.emergencyContactsCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Change Password</h3>
                <FaLock className="card-icon" />
              </div>

              {!isChangingPassword ? (
                <button 
                  className="action-button secondary"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </button>
              ) : (
                <div className="password-form">
                  {passwordError && (
                    <div className="error-message">{passwordError}</div>
                  )}
                  
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      className="action-button secondary"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordError('');
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="action-button primary"
                      onClick={handleChangePassword}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account Preferences Section */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Account Preferences</h3>
                <FaGlobe className="card-icon" />
              </div>

              <div className="preferences-list">
                <div className="preference-item">
                  <div className="preference-info">
                    <FaGlobe className="preference-icon" />
                    <div>
                      <span className="preference-label">Language</span>
                      <span className="preference-value">English</span>
                    </div>
                  </div>
                  <select 
                    className="preference-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="hi">Hindi</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <FaMapMarkerAlt className="preference-icon" />
                    <div>
                      <span className="preference-label">Location Permission</span>
                      <span className={`preference-value ${locationPermission}`}>
                        {locationPermission === 'granted' ? (
                          <><FaCheckCircle /> Granted</>
                        ) : locationPermission === 'denied' ? (
                          <><FaTimesCircle /> Denied</>
                        ) : (
                          'Unknown'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <FaBell className="preference-icon" />
                    <div>
                      <span className="preference-label">Notifications</span>
                      <span className="preference-value">
                        {notificationsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item disabled">
                  <div className="preference-info">
                    <FaMoon className="preference-icon" />
                    <div>
                      <span className="preference-label">Dark Mode</span>
                      <span className="preference-value">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>

              <div className="quick-actions-grid">
                <button 
                  className="quick-action-button"
                  onClick={() => navigate('/reports')}
                >
                  <FaFileMedical />
                  <span>My Reports</span>
                </button>

                <button 
                  className="quick-action-button"
                  onClick={() => navigate('/medical-id')}
                >
                  <FaIdCard />
                  <span>Medical ID</span>
                </button>

                <button 
                  className="quick-action-button"
                  onClick={() => navigate('/health-dashboard')}
                >
                  <FaTrophy />
                  <span>Health Dashboard</span>
                </button>

                <button 
                  className="quick-action-button"
                  onClick={() => navigate('/preparedness-kit')}
                >
                  <FaFirstAid />
                  <span>Preparedness Kit</span>
                </button>
              </div>
            </div>

            {/* Account Actions Section */}
            <div className="profile-card danger-card">
              <div className="card-header">
                <h3>Account Actions</h3>
              </div>

              <div className="account-actions">
                <button 
                  className="action-button logout"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  Logout
                </button>

                <button 
                  className="action-button delete"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FaTrashAlt />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="warning-text">
                <strong>Warning:</strong> This action cannot be undone. All your data including:
              </p>
              <ul className="warning-list">
                <li>Medical reports and history</li>
                <li>Health dashboard data</li>
                <li>Medical ID information</li>
                <li>Emergency contacts</li>
                <li>Account settings and preferences</li>
              </ul>
              <p className="warning-text">
                will be permanently deleted.
              </p>
              
              <div className="delete-confirmation">
                <label>Type "DELETE" to confirm:</label>
                <input 
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-button cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-button danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE'}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
