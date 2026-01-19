import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { shiftRequestsApi, timeOffApi, messagesApi } from '../services/api';
import './Sidebar.css';

// SVG Icon Components
const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  arrowLeftRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L4 7l4 4"/>
      <path d="M4 7h16"/>
      <path d="M16 21l4-4-4-4"/>
      <path d="M20 17H4"/>
    </svg>
  ),
  calendarOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.18 4.18A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18"/>
      <path d="M21 15.5V6a2 2 0 0 0-2-2H9.5"/>
      <path d="M16 2v4"/>
      <path d="M3 10h7"/>
      <path d="M21 10h-5.5"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  ),
  messageSquare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  barChart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  scrollText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/>
      <path d="M19 17V5a2 2 0 0 0-2-2H4"/>
      <path d="M15 8h-5"/>
      <path d="M15 12h-5"/>
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  creditCard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  userPlus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  leave: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18"/>
      <path d="M8 6c0 0-3 2-3 6s3 6 3 6"/>
      <path d="M16 6c0 0 3 2 3 6s-3 6-3 6"/>
      <path d="M7 3c0 3 2 5 5 5s5-2 5-5"/>
    </svg>
  ),
  hourly: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  salary: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  contractor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  volunteer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
};

// Shield + Clock Logo
const PunchdLogo = () => (
  <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L42 12V24C42 34 34 42 24 46C14 42 6 34 6 24V12L24 4Z" fill="#C9A227"/>
    <circle cx="24" cy="24" r="12" fill="#FFFFFF"/>
    <path d="M24 16V24L30 27" stroke="#C9A227" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Helper to get permissions from localStorage
const getPermissions = () => {
  try {
    const perms = localStorage.getItem('adminPermissions');
    return perms ? JSON.parse(perms) : null;
  } catch {
    return null;
  }
};

function Sidebar({ collapsed, onToggle, userRole }) {
  const [requestCounts, setRequestCounts] = useState({
    shiftRequests: 0,
    timeOff: 0,
    messages: 0,
  });
  
  const permissions = getPermissions();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [shiftStats, timeOffStats, msgCount] = await Promise.all([
          shiftRequestsApi.getStats().catch(() => ({ data: { pending: 0 } })),
          timeOffApi.getStats().catch(() => ({ data: { pending: 0 } })),
          messagesApi.getUnreadCount().catch(() => ({ data: 0 })),
        ]);
        
        setRequestCounts({
          shiftRequests: shiftStats.data?.pending || 0,
          timeOff: timeOffStats.data?.pending || 0,
          messages: typeof msgCount.data === 'number' ? msgCount.data : 0,
        });
      } catch (err) {
        console.error('Failed to fetch request counts:', err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasPermission = (permKey) => {
    if (userRole === 'OWNER' || userRole === 'ADMIN') return true;
    if (userRole === 'MANAGER' && permissions) {
      return permissions[permKey] === true;
    }
    return false;
  };

  const mainNavItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/time', icon: 'clock', label: 'Time Tracking' },
    { path: '/workers', icon: 'users', label: 'Team', roles: ['ADMIN', 'OWNER', 'MANAGER'] },
    { path: '/locations', icon: 'mapPin', label: 'Locations', roles: ['ADMIN', 'OWNER', 'MANAGER'] },
    { path: '/scheduling', icon: 'calendar', label: 'Schedule', roles: ['ADMIN', 'OWNER', 'MANAGER'], permission: 'canCreateShifts' },
    { path: '/leave', icon: 'leave', label: 'Leave', roles: ['ADMIN', 'OWNER', 'MANAGER'] },
  ];

  const requestsNavItems = [
    { path: '/requests/shifts', icon: 'arrowLeftRight', label: 'Shift Requests', roles: ['ADMIN', 'OWNER', 'MANAGER'], permission: 'canApproveShiftSwaps', badgeKey: 'shiftRequests' },
    { path: '/requests/time-off', icon: 'calendarOff', label: 'Time Off', roles: ['ADMIN', 'OWNER', 'MANAGER'], permission: 'canApproveTimeOff', badgeKey: 'timeOff' },
    { path: '/requests/messages', icon: 'messageSquare', label: 'Messages', roles: ['ADMIN', 'OWNER', 'MANAGER'], badgeKey: 'messages' },
  ];

  const reportsNavItems = [
    { path: '/analytics', icon: 'barChart', label: 'Analytics', roles: ['ADMIN', 'OWNER'], managerPerm: 'canViewAnalytics' },
    { path: '/compliance', icon: 'shield', label: 'Break Compliance', roles: ['ADMIN', 'OWNER', 'MANAGER'], permission: 'canReviewViolations' },
    { path: '/audit', icon: 'scrollText', label: 'Audit Log', roles: ['ADMIN', 'OWNER'] },
    { path: '/compliance-reports', icon: 'fileText', label: 'Compliance Reports', roles: ['ADMIN', 'OWNER', 'MANAGER'], permission: 'canGenerateReports' },
  ];

  const workerManagementNavItems = [
    { path: '/workers/hourly', icon: 'hourly', label: 'Hourly Workers', roles: ['ADMIN', 'OWNER'] },
    { path: '/workers/salaried', icon: 'salary', label: 'Salaried Workers', roles: ['ADMIN', 'OWNER'] },
    { path: '/workers/contractors', icon: 'contractor', label: 'Contractors', roles: ['ADMIN', 'OWNER'] },
    { path: '/workers/volunteers', icon: 'volunteer', label: 'Volunteers', roles: ['ADMIN', 'OWNER'] },
  ];

  const adminNavItems = [
    { path: '/team-management', icon: 'userPlus', label: 'Role Management', roles: ['ADMIN', 'OWNER'] },
  ];

  const settingsNavItems = [
    { path: '/billing', icon: 'creditCard', label: 'Billing', roles: ['OWNER'] },
    { path: '/settings', icon: 'settings', label: 'Settings', roles: ['ADMIN', 'OWNER'] },
  ];

  const filterByRoleAndPermission = (items) => {
    return items.filter(item => {
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }
      if (userRole === 'MANAGER') {
        if (item.managerPerm && !hasPermission(item.managerPerm)) {
          return false;
        }
        if (item.permission && !hasPermission(item.permission)) {
          return false;
        }
      }
      return true;
    });
  };

  const NavItem = ({ item }) => {
    const badge = item.badgeKey ? requestCounts[item.badgeKey] : 0;
    
    return (
      <NavLink 
        to={item.path} 
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <span className="sidebar-link-icon">{Icons[item.icon]}</span>
        <span className="sidebar-link-text">{item.label}</span>
        {badge > 0 && <span className="sidebar-badge">{badge}</span>}
      </NavLink>
    );
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <a href="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <PunchdLogo />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-name">Punch'd</span>
              <span className="sidebar-logo-byline">by Krynovo</span>
            </div>
          )}
        </a>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          {!collapsed && <div className="sidebar-section-title">Main</div>}
          {filterByRoleAndPermission(mainNavItems).map(item => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        {filterByRoleAndPermission(requestsNavItems).length > 0 && (
          <div className="sidebar-section">
            {!collapsed && <div className="sidebar-section-title">Requests</div>}
            {filterByRoleAndPermission(requestsNavItems).map(item => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}

        {filterByRoleAndPermission(reportsNavItems).length > 0 && (
          <div className="sidebar-section">
            {!collapsed && <div className="sidebar-section-title">Reports</div>}
            {filterByRoleAndPermission(reportsNavItems).map(item => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}

        {filterByRoleAndPermission(workerManagementNavItems).length > 0 && (
          <div className="sidebar-section">
            {!collapsed && <div className="sidebar-section-title">Worker Management</div>}
            {filterByRoleAndPermission(workerManagementNavItems).map(item => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}

        {filterByRoleAndPermission(adminNavItems).length > 0 && (
          <div className="sidebar-section">
            {!collapsed && <div className="sidebar-section-title">Admin</div>}
            {filterByRoleAndPermission(adminNavItems).map(item => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}

        {filterByRoleAndPermission(settingsNavItems).length > 0 && (
          <div className="sidebar-section">
            {!collapsed && <div className="sidebar-section-title">Settings</div>}
            {filterByRoleAndPermission(settingsNavItems).map(item => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-toggle" onClick={onToggle}>
          <span className="sidebar-toggle-icon">
            {collapsed ? Icons.chevronRight : Icons.chevronLeft}
          </span>
          {!collapsed && <span className="sidebar-toggle-text">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
