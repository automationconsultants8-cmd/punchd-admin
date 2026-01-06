import { useState, useRef, useEffect } from 'react';
import './Header.css';

// SVG Icons
const Icons = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  creditCard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  logOut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  alertTriangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

function Header({ user, pageTitle, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const notifications = [
    { id: 1, type: 'alert', message: 'Alex T. clocked in outside geofence', time: '5m ago' },
    { id: 2, type: 'info', message: 'Weekly timesheet report ready', time: '1h ago' },
    { id: 3, type: 'warning', message: "Maria's OSHA cert expires in 7 days", time: '2h ago' },
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">{pageTitle || 'Dashboard'}</h1>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <span className="header-search-icon">{Icons.search}</span>
          <input 
            type="text" 
            placeholder="Search workers, jobs..."
          />
        </div>

        <div className="header-actions">
          {/* Notifications */}
          <div className="dropdown" ref={notifRef}>
            <button 
              className="header-icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {Icons.bell}
              {notifications.length > 0 && <span className="badge"></span>}
            </button>

            {showNotifications && (
              <div className="dropdown-menu notifications-menu">
                <div className="notifications-header">
                  <span>Notifications</span>
                  <button className="btn btn-ghost btn-sm">Mark all read</button>
                </div>
                <div className="notifications-list">
                  {notifications.map(notif => (
                    <div key={notif.id} className="notification-item">
                      <span className={`notification-icon ${notif.type}`}>
                        {notif.type === 'alert' && Icons.alertTriangle}
                        {notif.type === 'warning' && Icons.clock}
                        {notif.type === 'info' && Icons.info}
                      </span>
                      <div className="notification-content">
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notifications-footer">
                  <a href="/notifications">View all notifications</a>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button className="header-icon-btn">
            {Icons.help}
          </button>
        </div>

        {/* Profile */}
        <div className="dropdown" ref={profileRef}>
          <button 
            className="header-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="header-profile-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="header-profile-info">
              <div className="header-profile-name">{user?.name || 'User'}</div>
              <div className="header-profile-role">{user?.role || 'Member'}</div>
            </div>
            <span className="header-profile-chevron">{Icons.chevronDown}</span>
          </button>

          {showProfileMenu && (
            <div className="dropdown-menu profile-menu">
              <div className="profile-menu-header">
                <div className="avatar avatar-lg">{getInitials(user?.name)}</div>
                <div>
                  <div className="profile-menu-name">{user?.name}</div>
                  <div className="profile-menu-email">{user?.email}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a href="/profile" className="dropdown-item">
                {Icons.user} My Profile
              </a>
              <a href="/settings" className="dropdown-item">
                {Icons.settings} Settings
              </a>
              <a href="/billing" className="dropdown-item">
                {Icons.creditCard} Billing
              </a>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={onLogout}>
                {Icons.logOut} Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;