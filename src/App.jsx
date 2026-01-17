// ============================================
// FILE: src/App.jsx (ADMIN DASHBOARD)
// ACTION: REPLACE ENTIRE FILE
// ============================================

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TrialWarningBanner from './components/TrialWarningBanner';
import TrialExpiredPaywall from './components/TrialExpiredPaywall';
import DashboardPage from './pages/DashboardPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import WorkersPage from './pages/WorkersPage';
import LocationsPage from './pages/LocationsPage';
import SchedulingPage from './pages/SchedulingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditPage from './pages/AuditPage';
import BillingPage from './pages/BillingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { authApi } from './services/api';
import './styles/design-system.css';
import './styles/theme-override.css';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CompliancePage from './pages/CompliancePage';
import CertifiedPayrollPage from './pages/CertifiedPayrollPage';
import ShiftRequestsPage from './pages/ShiftRequestsPage';
import MessagesPage from './pages/MessagesPage';
import { FeaturesProvider } from './hooks/useFeatures';
import RoleManagementPage from './pages/RoleManagementPage';
import LeaveManagementPage from './pages/LeaveManagementPage';


const pageTitles = {
  '/dashboard': 'Dashboard',
  '/time': 'Time Tracking',
  '/timesheets': 'Timesheets',
  '/workers': 'Workers',
  '/locations': 'Locations',
  '/scheduling': 'Scheduling',
  '/analytics': 'Analytics',
  '/audit': 'Audit Log',
  '/billing': 'Billing',
  '/compliance': 'Break Compliance',
  '/compliance-reports': 'Compliance Reports',
  '/requests/shifts': 'Shift Requests',
  '/requests/time-off': 'Time Off Requests',
  '/requests/messages': 'Messages',
};

function AppContent({ user, onLogout, subscription }) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';
  const showWarningBanner = subscription?.isWarningPeriod && !subscription?.trialExpired;

  return (
    <div className="app-layout">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={user.role}
      />
      
      <main className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${showWarningBanner ? 'has-warning-banner' : ''}`}>
        <Header 
          user={user}
          pageTitle={pageTitle}
          onLogout={onLogout}
        />
        
        {showWarningBanner && (
          <TrialWarningBanner daysRemaining={subscription.daysRemaining} />
        )}
        
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/time" element={<TimeTrackingPage />} />
            <Route path="/timesheets" element={<TimeTrackingPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/scheduling" element={<SchedulingPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/compliance-reports" element={<CertifiedPayrollPage />} />
            <Route path="/team-management" element={<RoleManagementPage />} />
            {/* Legacy route redirects */}
            <Route path="/job-sites" element={<Navigate to="/locations" replace />} />
            <Route path="/certified-payroll" element={<Navigate to="/compliance-reports" replace />} />
            <Route path="/leave" element={<LeaveManagementPage />} />
            
            {/* Phase 1: Requests */}
            <Route path="/requests/shifts" element={<ShiftRequestsPage />} />
            <Route path="/requests/time-off" element={<ShiftRequestsPage />} />
            <Route path="/requests/messages" element={<MessagesPage />} />
            
            {/* Catch-all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');
    const cachedSubscription = sessionStorage.getItem('subscription');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      
      if (cachedSubscription) {
        setSubscription(JSON.parse(cachedSubscription));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      // Always check fresh - don't cache expired state
      setSubscriptionLoading(true);
      try {
        const response = await authApi.getSubscriptionStatus();
        setSubscription(response.data);
        sessionStorage.setItem('subscription', JSON.stringify(response.data));
      } catch (err) {
        console.error('Failed to check subscription:', err);
        const fallback = { isActive: true };
        setSubscription(fallback);
        sessionStorage.setItem('subscription', JSON.stringify(fallback));
      }
      setSubscriptionLoading(false);
    };

    checkSubscription();
    
    // Recheck every 5 minutes in case trial expires while using app
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.removeItem('subscription');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('subscription');
    setUser(null);
    setSubscription(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : subscriptionLoading && !subscription ? (
        <div className="app-loading">
          <div className="spinner"></div>
          <p>Checking subscription...</p>
        </div>
      ) : subscription?.trialExpired ? (
        // Trial expired - admin can only access billing page
        <Routes>
          <Route path="/billing" element={
            <FeaturesProvider>
              <BillingOnlyView user={user} onLogout={handleLogout} />
            </FeaturesProvider>
          } />
          <Route path="*" element={
            <TrialExpiredPaywall onLogout={handleLogout} />
          } />
        </Routes>
      ) : (
        // Normal access (trial active or paid)
        <FeaturesProvider>
          <AppContent user={user} onLogout={handleLogout} subscription={subscription} />
        </FeaturesProvider>
      )}
    </BrowserRouter>
  );
}

// Billing-only view for expired trials
function BillingOnlyView({ user, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={user.role}
      />
      
      <main className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          user={user}
          pageTitle="Billing"
          onLogout={onLogout}
        />
        
        <div className="trial-expired-banner">
          <span>⚠️ Your trial has expired. Please upgrade to continue using Punch'd.</span>
        </div>
        
        <div className="app-content">
          <BillingPage />
        </div>
      </main>
    </div>
  );
}

export default App;