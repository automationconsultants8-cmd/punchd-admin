import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, jobsApi, timeEntriesApi, shiftRequestsApi, timeOffApi } from '../services/api';
import './Header.css';

const Icons = {
  search: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  bell: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>),
  help: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
  chevronDown: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>),
  user: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  settings: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
  creditCard: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>),
  logOut: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  alertTriangle: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
  clock: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  info: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>),
  copy: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>),
  x: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  users: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  briefcase: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>),
  externalLink: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>),
  mail: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
  book: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>),
  messageCircle: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>),
  star: (<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
  check: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>),
  checkCircle: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
  trash: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>),
  phone: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>),
};

function Header({ user, pageTitle, onLogout }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFounderModal, setShowFounderModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ workers: [], jobs: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('readNotifications');
    if (saved) {
      setReadNotifications(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ workers: [], jobs: [] });
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(() => performSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadNotifications = async () => {
    try {
      const [approvalRes, shiftReqRes, timeOffRes] = await Promise.all([
        timeEntriesApi.getApprovalStats().catch(() => ({ data: { pending: 0 } })),
        shiftRequestsApi.getStats().catch(() => ({ data: { pending: 0 } })),
        timeOffApi.getStats().catch(() => ({ data: { pending: 0 } })),
      ]);
      const newNotifications = [];
      const pendingApprovals = approvalRes.data?.pending || 0;
      if (pendingApprovals > 0) {
        newNotifications.push({ id: 'approvals', type: 'warning', message: `${pendingApprovals} timesheet${pendingApprovals > 1 ? 's' : ''} pending approval`, time: 'Now', link: '/time?tab=approvals' });
      }
      const pendingShiftReqs = shiftReqRes.data?.pending || 0;
      if (pendingShiftReqs > 0) {
        newNotifications.push({ id: 'shift-requests', type: 'info', message: `${pendingShiftReqs} shift request${pendingShiftReqs > 1 ? 's' : ''} pending`, time: 'Now', link: '/requests/shifts' });
      }
      const pendingTimeOff = timeOffRes.data?.pending || 0;
      if (pendingTimeOff > 0) {
        newNotifications.push({ id: 'time-off', type: 'info', message: `${pendingTimeOff} time off request${pendingTimeOff > 1 ? 's' : ''} pending`, time: 'Now', link: '/requests/time-off' });
      }
      setNotifications(newNotifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const performSearch = async (query) => {
    setSearchLoading(true);
    try {
      const [workersRes, jobsRes] = await Promise.all([
        usersApi.getAll().catch(() => ({ data: [] })),
        jobsApi.getAll().catch(() => ({ data: [] })),
      ]);
      const q = query.toLowerCase();
      const workers = (workersRes.data || []).filter(w => w.name?.toLowerCase().includes(q) || w.email?.toLowerCase().includes(q) || w.role?.toLowerCase().includes(q)).slice(0, 5);
      const jobs = (jobsRes.data || []).filter(j => j.name?.toLowerCase().includes(q) || j.address?.toLowerCase().includes(q)).slice(0, 5);
      setSearchResults({ workers, jobs });
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search failed:', err);
    }
    setSearchLoading(false);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const copyInviteCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSearchResultClick = (type, id) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (type === 'worker') {
      navigate('/workers');
    } else if (type === 'job') {
      navigate('/locations');
    }
  };

  const markNotificationRead = (id) => {
    const newRead = new Set(readNotifications);
    newRead.add(id);
    setReadNotifications(newRead);
    localStorage.setItem('readNotifications', JSON.stringify([...newRead]));
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    const newRead = new Set([...readNotifications, ...allIds]);
    setReadNotifications(newRead);
    localStorage.setItem('readNotifications', JSON.stringify([...newRead]));
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    setShowNotifications(false);
    navigate(notif.link);
  };

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;
  const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN';

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <h1 className="header-title">{pageTitle || 'Dashboard'}</h1>
          {user?.inviteCode && (
            <div className="invite-code-badge" onClick={copyInviteCode} title="Click to copy">
              <span className="invite-code-label">Invite Code:</span>
              <span className="invite-code-value">{user.inviteCode}</span>
              <span className="invite-code-icon">{Icons.copy}</span>
              {copied && <span className="invite-code-copied">Copied!</span>}
            </div>
          )}
        </div>

        <div className="header-right">
          <div className="header-search" ref={searchRef}>
            <span className="header-search-icon">{Icons.search}</span>
            <input type="text" placeholder="Search workers, jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => searchQuery && setShowSearchResults(true)} />
            {searchLoading && <span className="search-loading"></span>}
            
            {showSearchResults && (searchResults.workers.length > 0 || searchResults.jobs.length > 0) && (
              <div className="search-results-dropdown">
                {searchResults.workers.length > 0 && (
                  <div className="search-results-section">
                    <div className="search-results-header">{Icons.users} Workers</div>
                    {searchResults.workers.map(worker => (
                      <div key={worker.id} className="search-result-item" onClick={() => handleSearchResultClick('worker', worker.id)}>
                        <div className="search-result-avatar">{getInitials(worker.name)}</div>
                        <div className="search-result-info">
                          <span className="search-result-name">{worker.name}</span>
                          <span className="search-result-sub">{worker.email}</span>
                        </div>
                        <span className="search-result-badge">{worker.role}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.jobs.length > 0 && (
                  <div className="search-results-section">
                    <div className="search-results-header">{Icons.briefcase} Job Sites</div>
                    {searchResults.jobs.map(job => (
                      <div key={job.id} className="search-result-item" onClick={() => handleSearchResultClick('job', job.id)}>
                        <div className="search-result-icon">{Icons.briefcase}</div>
                        <div className="search-result-info">
                          <span className="search-result-name">{job.name}</span>
                          <span className="search-result-sub">{job.address || 'No address'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showSearchResults && searchQuery && searchResults.workers.length === 0 && searchResults.jobs.length === 0 && !searchLoading && (
              <div className="search-results-dropdown">
                <div className="search-no-results">No results found for "{searchQuery}"</div>
              </div>
            )}
          </div>

          <div className="header-actions">
            <div className="dropdown" ref={notifRef}>
              <button className="header-icon-btn notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                {Icons.bell}
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="dropdown-menu notifications-menu">
                  <div className="notifications-header">
                    <span>Notifications</span>
                    <div className="notifications-header-actions">
                      {notifications.length > 0 && (
                        <button className="clear-all-btn" onClick={() => setNotifications([])} title="Clear all">
                          {Icons.trash}
                        </button>
                      )}
                      {unreadCount > 0 && <button className="mark-all-read-btn" onClick={markAllRead}>{Icons.checkCircle} Mark all read</button>}
                    </div>
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="notifications-empty">
                        <span className="notifications-empty-icon">{Icons.bell}</span>
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${readNotifications.has(notif.id) ? 'read' : 'unread'}`} onClick={() => handleNotificationClick(notif)}>
                          <span className={`notification-icon ${notif.type}`}>
                            {notif.type === 'alert' && Icons.alertTriangle}
                            {notif.type === 'warning' && Icons.clock}
                            {notif.type === 'info' && Icons.info}
                          </span>
                          <div className="notification-content">
                            <p>{notif.message}</p>
                            <span className="notification-time">{notif.time}</span>
                          </div>
                          {!readNotifications.has(notif.id) && <span className="unread-dot"></span>}
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="notifications-footer">
                      <button onClick={() => navigate('/approvals')}>View all notifications</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="header-icon-btn help-btn" onClick={() => setShowHelpModal(true)} title="Help & Support">{Icons.help}</button>
            <button className="founder-hub-btn" onClick={() => setShowFounderModal(true)} title="Founding Partner Hub">{Icons.star}<span>Founder</span></button>
          </div>

          <div className="dropdown" ref={profileRef}>
            <button className="header-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="header-profile-avatar">{getInitials(user?.name)}</div>
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
                <a href="/profile" className="dropdown-item">{Icons.user} My Profile</a>
                {isOwnerOrAdmin && <a href="/settings" className="dropdown-item">{Icons.settings} Settings</a>}
                {isOwnerOrAdmin && <a href="/billing" className="dropdown-item">{Icons.creditCard} Billing</a>}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={onLogout}>{Icons.logOut} Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <div className="help-modal-header">
              <h2>Help & Support</h2>
              <button className="modal-close" onClick={() => setShowHelpModal(false)}>{Icons.x}</button>
            </div>
            <div className="help-modal-body">
              <div className="help-section">
                <h3>Contact Us</h3>
                <div className="help-links">
                  <a href="mailto:support@gopunchd.com" className="help-link">
                    {Icons.mail}
                    <div>
                      <span>Email Support</span>
                      <p>support@gopunchd.com</p>
                    </div>
                    {Icons.externalLink}
                  </a>
                  <a href="https://calendly.com/automationconsultants8/new-meeting" target="_blank" rel="noopener noreferrer" className="help-link">
                    {Icons.clock}
                    <div>
                      <span>Schedule a Call</span>
                      <p>15-min support call</p>
                    </div>
                    {Icons.externalLink}
                  </a>
                  <a href="tel:+17348820690" className="help-link">
                    {Icons.phone}
                    <div>
                      <span>Call Us</span>
                      <p>+1 (734) 882-0690</p>
                    </div>
                    {Icons.externalLink}
                  </a>
                </div>
              </div>
              <div className="help-section">
                <h3>Keyboard Shortcuts</h3>
                <div className="help-shortcuts">
                  <div className="shortcut"><kbd>⌘</kbd> + <kbd>K</kbd><span>Quick search</span></div>
                  <div className="shortcut"><kbd>⌘</kbd> + <kbd>N</kbd><span>New time entry</span></div>
                  <div className="shortcut"><kbd>⌘</kbd> + <kbd>/</kbd><span>Open help</span></div>
                </div>
              </div>
              <div className="help-section">
                <h3>App Version</h3>
                <p className="help-version">Punch'd v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Founding Partner Modal */}
      {showFounderModal && (
        <div className="modal-overlay" onClick={() => setShowFounderModal(false)}>
          <div className="founder-modal" onClick={e => e.stopPropagation()}>
            <div className="founder-modal-header">
              <div className="founder-badge">{Icons.star}<span>Founding Partner</span></div>
              <button className="modal-close" onClick={() => setShowFounderModal(false)}>{Icons.x}</button>
            </div>
            <div className="founder-modal-body">
              <div className="founder-welcome">
                <h2>Welcome, Founding Partner</h2>
                <p>Thank you for being part of our early journey. Your feedback directly shapes Punch'd.</p>
              </div>
              <div className="founder-perks">
                <h3>Your Founding Partner Benefits</h3>
                <div className="perk-list">
                  <div className="perk-item">{Icons.check}<span>90-day full platform access</span></div>
                  <div className="perk-item">{Icons.check}<span>Direct founder support line</span></div>
                  <div className="perk-item">{Icons.check}<span>Priority feature requests</span></div>
                  <div className="perk-item">{Icons.check}<span>Locked-in early partner pricing</span></div>
                  <div className="perk-item">{Icons.check}<span>Roadmap influence</span></div>
                </div>
              </div>
              <div className="founder-actions">
                <a href="mailto:krynovo@gmail.com?subject=[Founding Partner] Feature Request" className="founder-action-btn primary">
                  {Icons.messageCircle}
                  <div>
                    <span>Submit Feedback</span>
                    <p>Feature requests, bugs, ideas</p>
                  </div>
                </a>
                <a href="mailto:krynovo@gmail.com?subject=[Founding Partner] Direct Support" className="founder-action-btn">
                  {Icons.mail}
                  <div>
                    <span>Contact Founder</span>
                    <p>Direct line to Jude</p>
                  </div>
                </a>
                <a href="https://calendly.com/automationconsultants8/new-meeting" target="_blank" rel="noopener noreferrer" className="founder-action-btn">
                  {Icons.clock}
                  <div>
                    <span>Schedule a Call</span>
                    <p>15-min check-in or demo</p>
                  </div>
                </a>
              </div>
              <div className="founder-note">
                <p>🚀 This exclusive access will be removed after the pilot program. Enjoy it while it lasts!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;