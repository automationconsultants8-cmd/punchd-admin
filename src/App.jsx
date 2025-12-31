import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Sidebar from './components/Sidebar';
import TimesheetsPage from './pages/TimesheetsPage';
import WorkersPage from './pages/WorkersPage';
import JobSitesPage from './pages/JobSitesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SchedulingPage from './pages/SchedulingPage';
import AuditPage from './pages/AuditPage';
import BillingPage from './pages/BillingPage';
import SubscriptionWall from './components/SubscriptionWall';
import { FeatureProvider } from './context/FeatureContext';
import { authApi } from './services/api';
import './App.css';

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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Check subscription status when user logs in
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      setSubscriptionLoading(true);
      try {
        const response = await authApi.getSubscriptionStatus();
        setSubscription(response.data);
      } catch (err) {
        console.error('Failed to check subscription:', err);
        // If we can't check, assume active to not block users
        setSubscription({ isActive: true });
      }
      setSubscriptionLoading(false);
    };

    checkSubscription();
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setSubscription(null);
  };

  const copyInviteCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasPermission = (permission) => {
    if (!user?.role) return false;
    return PERMISSIONS[user.role]?.[permission] ?? false;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#1a1a2e',
        color: '#fff'
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route path="/*" element={
          !user ? (
            <LoginPage onLogin={handleLogin} />
          ) : subscriptionLoading ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100vh',
              background: '#1a1a2e',
              color: '#fff'
            }}>
              <h2>Checking subscription...</h2>
            </div>
          ) : subscription && !subscription.isActive ? (
            <SubscriptionWall daysLeft={subscription.daysLeft} />
          ) : (
            <FeatureProvider>
              <div className="dashboard-layout">
                <Sidebar 
                  userRole={user.role} 
                  collapsed={sidebarCollapsed}
                  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                
                <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                  <div className="dashboard-header">
                    <h1>Punch'd Admin</h1>
                    <div className="header-right">
                      {/* Trial banner */}
                      {subscription?.status === 'trial' && subscription?.daysLeft > 0 && (
                        <div className="trial-banner">
                          ⏰ {subscription.daysLeft} days left in trial
                        </div>
                      )}
                      
                      {user?.inviteCode && (user.role === 'OWNER' || user.role === 'ADMIN') && (
                        <div className="invite-code-container">
                          <button 
                            className="invite-code-btn"
                            onClick={() => setShowInviteCode(!showInviteCode)}
                          >
                            📋 Invite Code
                          </button>
                          {showInviteCode && (
                            <div className="invite-code-dropdown">
                              <p>Share this code with your workers:</p>
                              <div className="invite-code-display">
                                <span className="invite-code">{user.inviteCode}</span>
                                <button 
                                  className="copy-btn"
                                  onClick={copyInviteCode}
                                >
                                  {copied ? '✓ Copied!' : '📋 Copy'}
                                </button>
                              </div>
                              <p className="invite-hint">Workers enter this code when registering in the mobile app</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="user-info">
                        <span>Welcome, {user.name}!</span>
                        <span className="role-badge">{user.role}</span>
                        <button onClick={handleLogout}>Logout</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="page-content">
                    <Routes>
                      <Route path="/" element={<Navigate to="/timesheets" replace />} />
                      <Route path="/timesheets" element={<TimesheetsPage />} />
                      {hasPermission('canManageWorkers') && (
                        <Route path="/workers" element={<WorkersPage />} />
                      )}
                      {hasPermission('canManageJobs') && (
                        <Route path="/job-sites" element={<JobSitesPage />} />
                      )}
                      {hasPermission('canViewAnalytics') && (
                        <Route path="/analytics" element={<AnalyticsPage />} />
                      )}
                      {hasPermission('canManageSchedules') && (
                        <Route path="/scheduling" element={<SchedulingPage />} />
                      )}
                      {hasPermission('canViewAuditLogs') && (
                        <Route path="/audit" element={<AuditPage />} />
                      )}
                      {hasPermission('canManageBilling') && (
                        <Route path="/billing" element={<BillingPage />} />
                      )}
                      <Route path="*" element={<Navigate to="/timesheets" replace />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </FeatureProvider>
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;