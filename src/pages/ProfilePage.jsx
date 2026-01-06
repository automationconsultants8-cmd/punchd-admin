import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../services/api';
import './ProfilePage.css';

// SVG Icons
const Icons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4c0-.27.1-.52.3-.71.2-.2.44-.29.7-.29h10c.27 0 .52.1.71.29.2.2.29.45.29.71v18"/>
      <path d="M6 12H4c-.27 0-.52.1-.71.29-.2.2-.29.45-.29.71v9"/>
      <path d="M18 9h2c.27 0 .52.1.71.29.2.2.29.45.29.71v12"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
};

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }

        // Fetch company info from API
        try {
          const response = await companyApi.get();
          if (response.data?.name) {
            setCompanyName(response.data.name);
          }
        } catch (err) {
          console.log('Could not fetch company info');
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <div className="empty-icon">{Icons.user}</div>
          <h3>Unable to load profile</h3>
          <p>Please try logging in again.</p>
        </div>
      </div>
    );
  }

  // Get company name from various possible locations
  const displayCompanyName = companyName || user.company?.name || user.companyName || 'Not set';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-icon">{Icons.user}</div>
        <h1>My Profile</h1>
      </div>
      
      <div className="profile-card">
        <div className="profile-user">
          <div className="profile-avatar">
            {user.name?.split(' ').map(n => n[0]).join('') || '?'}
          </div>
          <div className="profile-user-info">
            <h2>{user.name}</h2>
            <span className="profile-role-badge">{user.role}</span>
          </div>
        </div>
        
        <div className="profile-details">
          <div className="profile-detail-row">
            <div className="detail-icon">{Icons.mail}</div>
            <div className="detail-content">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon">{Icons.building}</div>
            <div className="detail-content">
              <span className="detail-label">Company</span>
              <span className="detail-value">{displayCompanyName}</span>
            </div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon">{Icons.shield}</div>
            <div className="detail-content">
              <span className="detail-label">Role</span>
              <span className="detail-value">{user.role}</span>
            </div>
          </div>
          {user.phone && (
            <div className="profile-detail-row">
              <div className="detail-icon">{Icons.phone}</div>
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{user.phone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;