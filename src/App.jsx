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
import OnboardingPage from './pages/OnboardingPage';
import { authApi, companyApi } from './services/api';
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
import HourlyWorkersPage from './pages/HourlyWorkersPage';
import SalariedWorkersPage from './pages/SalariedWorkersPage';
import ContractorsPage from './pages/ContractorsPage';
import VolunteersPage from './pages/VolunteersPage';
import MyTimePage from './pages/MyTimePage';

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
  '/workers/hourly': 'Hourly Workers',
  '/workers/salaried': 'Salaried Workers',
  '/workers/contractors': 'Contractors',
  '/workers/volunteers': 'Volunteers',
  '/my-time': 'My Time',
};

function AppContent({ user, onLogout, subscription, needsOnboarding }) {
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

        {needsOnboarding && location.pathname !== '/onboarding' && (
          <div className="onboarding-reminder-banner">
            <span>👋 Complete your setup to get the most out of Punch'd</span>
            <a href="/onboarding">Finish Setup →</a>
          </div>
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
            <Route path="/leave" element={<LeaveManagementPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/workers/hourly" element={<HourlyWorkersPage />} />
            <Route path="/workers/salaried" element={<SalariedWorkersPage />} />
            <Route path="/workers/contractors" element={<ContractorsPage />} />
            <Route path="/workers/volunteers" element={<VolunteersPage />} />
            <Route path="/my-time" element={<MyTimePage />} />
            
            {/* Legacy route redirects */}
            <Route path="/job-sites" element={<Navigate to="/locations" replace />} />
            <Route path="/certified-payroll" element={<Navigate to="/compliance-reports" replace />} />
            
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
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

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

  // Check if onboarding is needed
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      
      try {
        const response = await companyApi.get();
        const settings = response.data.settings || {};
        
        // Needs onboarding if never completed AND never skipped
        const needsIt = !settings.onboardingCompletedAt && !settings.onboardingSkippedAt;
        setNeedsOnboarding(needsIt);
      } catch (err) {
        console.error('Failed to check onboarding status:', err);
      }
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, [user]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
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
    
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.removeItem('subscription');
    setOnboardingChecked(false); // Re-check onboarding on new login
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('subscription');
    setUser(null);
    setSubscription(null);
    setNeedsOnboarding(false);
    setOnboardingChecked(false);
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
      ) : !onboardingChecked ? (
        <div className="app-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : subscription?.trialExpired ? (
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
      ) : needsOnboarding && !sessionStorage.getItem('skipOnboardingRedirect') ? (
        // First time user - show onboarding
        <FeaturesProvider>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </FeaturesProvider>
      ) : (
        // Normal access
        <FeaturesProvider>
          <AppContent 
            user={user} 
            onLogout={handleLogout} 
            subscription={subscription}
            needsOnboarding={needsOnboarding}
          />
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