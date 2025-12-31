import { Link, useLocation } from 'react-router-dom';
import { useFeatures } from '../context/FeatureContext';
import './Sidebar.css';

const PERMISSIONS = {
  WORKER: {
    canManageWorkers: false,
    canManageJobs: false,
    canViewAnalytics: false,
    canManageSchedules: false,
    canViewAuditLogs: false,
    canManageBilling: false,
  },
  MANAGER: {
    canManageWorkers: false,
    canManageJobs: false,
    canViewAnalytics: true,
    canManageSchedules: true,
    canViewAuditLogs: false,
    canManageBilling: false,
  },
  ADMIN: {
    canManageWorkers: true,
    canManageJobs: true,
    canViewAnalytics: true,
    canManageSchedules: true,
    canViewAuditLogs: true,
    canManageBilling: false,
  },
  OWNER: {
    canManageWorkers: true,
    canManageJobs: true,
    canViewAnalytics: true,
    canManageSchedules: true,
    canViewAuditLogs: true,
    canManageBilling: true,
  },
};

function Sidebar({ userRole, collapsed, onToggle }) {
  const location = useLocation();
  const { hasFeature } = useFeatures();
  
  const isActive = (path) => location.pathname === path;
  
  const hasPermission = (permission) => {
    return PERMISSIONS[userRole]?.[permission] ?? false;
  };

  const NavItem = ({ to, icon, label, feature, permission }) => {
    const isLocked = feature && !hasFeature(feature);
    const hasAccess = !permission || hasPermission(permission);
    
    if (!hasAccess) return null;

    return (
      <Link 
        to={to} 
        className={`nav-item ${isActive(to) ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
        title={isLocked ? `${label} - Requires Upgrade` : label}
      >
        <span className="nav-icon">{icon}</span>
        {!collapsed && (
          <>
            <span className="nav-label">{label}</span>
            {isLocked && <span className="lock-icon">🔒</span>}
          </>
        )}
      </Link>
    );
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="logo-icon">⏱️</span>
          {!collapsed && <h2>Punch'd</h2>}
        </div>
        {!collapsed && <p>Admin Panel</p>}
        <button 
          className="collapse-btn"
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavItem to="/timesheets" icon="📋" label="Timesheets" />
        
        <NavItem 
          to="/scheduling" 
          icon="📅" 
          label="Scheduling" 
          feature="SHIFT_SCHEDULING"
          permission="canManageSchedules"
        />
        
        <NavItem 
          to="/workers" 
          icon="👷" 
          label="Workers" 
          permission="canManageWorkers"
        />
        
        <NavItem 
          to="/job-sites" 
          icon="🏗️" 
          label="Job Sites" 
          permission="canManageJobs"
        />
        
        <NavItem 
          to="/analytics" 
          icon="💰" 
          label="Cost Analytics" 
          feature="COST_ANALYTICS"
          permission="canViewAnalytics"
        />
        
        <NavItem 
          to="/audit" 
          icon="🔍" 
          label="Audit Log" 
          feature="AUDIT_LOGS"
          permission="canViewAuditLogs"
        />
        
        <NavItem 
          to="/billing" 
          icon="💳" 
          label="Billing" 
          permission="canManageBilling"
        />
      </nav>

      <div className="sidebar-footer">
        <span className="role-indicator" title={userRole}>
          {collapsed ? userRole.charAt(0) : userRole}
        </span>
      </div>
    </div>
  );
}

export default Sidebar;