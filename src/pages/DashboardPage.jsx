import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

// SVG Icons
const Icons = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  dollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    </svg>
  ),
  alertTriangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  checkCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  userPlus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/>
      <path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/>
      <path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  pieChart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  userCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  messageSquare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
};

import { usersApi, jobsApi, timeEntriesApi, shiftRequestsApi, timeOffApi, shiftsApi } from '../services/api';

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeWorkers: 0,
    totalHoursToday: 0,
    laborCostToday: 0,
    pendingApprovals: 0,
    pendingRequests: 0,
    totalWorkers: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [todayShifts, setTodayShifts] = useState({ byJob: [], total: 0, covered: 0, open: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeWorkers, setActiveWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('feature');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const todayStr = startOfDay.toISOString().split('T')[0];

      const [workersRes, jobsRes, timeRes, approvalStatsRes, shiftStatsRes, timeOffStatsRes, shiftsRes] = await Promise.all([
        usersApi.getAll().catch(() => ({ data: [] })),
        jobsApi.getAll().catch(() => ({ data: [] })),
        timeEntriesApi.getAll({ 
          startDate: startOfDay.toISOString(), 
          endDate: endOfDay.toISOString() 
        }).catch(() => ({ data: [] })),
        timeEntriesApi.getApprovalStats().catch(() => ({ data: { pending: 0 } })),
        shiftRequestsApi.getStats().catch(() => ({ data: { pending: 0 } })),
        timeOffApi.getStats().catch(() => ({ data: { pending: 0 } })),
        shiftsApi.getAll({ startDate: todayStr, endDate: todayStr }).catch(() => ({ data: [] })),
      ]);

      const workers = workersRes.data || [];
      const timeEntries = timeRes.data || [];
      const approvalStats = approvalStatsRes.data || { pending: 0 };
      const shiftStats = shiftStatsRes.data || { pending: 0 };
      const timeOffStats = timeOffStatsRes.data || { pending: 0 };
      const shifts = shiftsRes.data || [];

      const clockedIn = timeEntries.filter(e => !e.clockOutTime);
      const completedEntries = timeEntries.filter(e => e.clockOutTime);
      const totalLaborCost = completedEntries.reduce((sum, e) => sum + (e.laborCost ? Number(e.laborCost) : 0), 0);
      const totalMinutes = completedEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
      
      setStats({
        activeWorkers: clockedIn.length,
        totalHoursToday: (totalMinutes / 60).toFixed(1),
        laborCostToday: totalLaborCost.toFixed(2),
        pendingApprovals: approvalStats.pending || 0,
        pendingRequests: (shiftStats.pending || 0) + (timeOffStats.pending || 0),
        totalWorkers: workers.filter(w => w.status === 'active' || w.isActive).length,
      });

      const todayShiftsByJob = {};
      shifts.forEach(shift => {
        const jobName = shift.job?.name || 'Unassigned';
        if (!todayShiftsByJob[jobName]) {
          todayShiftsByJob[jobName] = { name: jobName, total: 0, covered: 0, open: 0 };
        }
        todayShiftsByJob[jobName].total++;
        if (shift.isOpen || shift.status === 'OPEN') {
          todayShiftsByJob[jobName].open++;
        } else if (shift.userId) {
          todayShiftsByJob[jobName].covered++;
        }
      });
      
      const shiftsByJobArray = Object.values(todayShiftsByJob);
      const totalShifts = shifts.length;
      const coveredShifts = shifts.filter(s => s.userId && !s.isOpen).length;
      const openShifts = shifts.filter(s => s.isOpen || s.status === 'OPEN').length;
      
      setTodayShifts({
        byJob: shiftsByJobArray,
        total: totalShifts,
        covered: coveredShifts,
        open: openShifts,
      });

      const newAlerts = [];
      
      if (approvalStats.pending > 0) {
        newAlerts.push({
          id: 'pending-approvals',
          type: 'warning',
          icon: Icons.clipboard,
          title: `${approvalStats.pending} timesheet${approvalStats.pending > 1 ? 's' : ''} pending approval`,
          link: '/time?tab=approvals',
          actionText: 'Review',
        });
      }
      
      const totalRequests = (shiftStats.pending || 0) + (timeOffStats.pending || 0);
      if (totalRequests > 0) {
        newAlerts.push({
          id: 'pending-requests',
          type: 'warning',
          icon: Icons.inbox,
          title: `${totalRequests} request${totalRequests > 1 ? 's' : ''} awaiting your review`,
          link: '/approvals',
          actionText: 'View',
        });
      }
      
      if (openShifts > 0) {
        newAlerts.push({
          id: 'open-shifts',
          type: 'info',
          icon: Icons.briefcase,
          title: `${openShifts} open shift${openShifts > 1 ? 's' : ''} today need coverage`,
          link: '/scheduling',
          actionText: 'Assign',
        });
      }
      
      const longBreaks = clockedIn.filter(e => {
        if (!e.isOnBreak || !e.breakStartTime) return false;
        const breakStart = new Date(e.breakStartTime);
        const now = new Date();
        return (now - breakStart) > 45 * 60 * 1000;
      });
      if (longBreaks.length > 0) {
        newAlerts.push({
          id: 'long-breaks',
          type: 'warning',
          icon: Icons.coffee,
          title: `${longBreaks.length} worker${longBreaks.length > 1 ? 's' : ''} on break over 45 minutes`,
          link: '/time',
          actionText: 'Check',
        });
      }
      
      const overtimeWorkers = completedEntries.filter(e => (e.durationMinutes || 0) > 480);
      if (overtimeWorkers.length > 0) {
        newAlerts.push({
          id: 'overtime',
          type: 'error',
          icon: Icons.alertTriangle,
          title: `${overtimeWorkers.length} worker${overtimeWorkers.length > 1 ? 's' : ''} in overtime today`,
          link: '/analytics',
          actionText: 'View',
        });
      }

      if (newAlerts.length === 0) {
        newAlerts.push({
          id: 'all-good',
          type: 'success',
          icon: Icons.checkCircle,
          title: 'All caught up! No immediate actions needed.',
          link: null,
          actionText: null,
        });
      }

      setAlerts(newAlerts);

      setActiveWorkers(clockedIn.slice(0, 5).map(e => ({
        id: e.userId,
        name: e.user?.name || 'Worker',
        job: e.job?.name || 'Unknown Site',
        clockedIn: e.clockInTime,
        status: e.isOnBreak ? 'break' : 'working',
      })));

      const activity = timeEntries.slice(0, 5).map((e) => ({
        id: e.id,
        type: e.clockOutTime ? 'clock-out' : e.isOnBreak ? 'break' : 'clock-in',
        user: e.user?.name || 'Unknown',
        action: e.clockOutTime ? 'clocked out' : e.isOnBreak ? 'on break' : 'clocked in',
        location: e.job?.name || 'Unknown',
        time: new Date(e.clockOutTime || e.clockInTime).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        status: e.isFlagged ? 'warning' : 'success',
      }));
      setRecentActivity(activity);
      setLastRefresh(new Date());

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
    setLoading(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getElapsedTime = (clockedIn) => {
    const now = new Date();
    const start = new Date(clockedIn);
    const diffMs = now - start;
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setFeedbackSending(true);
    try {
      const subject = encodeURIComponent(`[Punch'd Feedback] ${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} Request`);
      const body = encodeURIComponent(`Feedback Type: ${feedbackType}\n\n${feedbackText}\n\n---\nSent from Punch'd Dashboard`);
      window.location.href = `mailto:krynovo@gmail.com?subject=${subject}&body=${body}`;
      
      setFeedbackSent(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackText('');
        setFeedbackType('feature');
        setFeedbackSent(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to send feedback:', err);
    }
    setFeedbackSending(false);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const coveragePercent = todayShifts.total > 0 
    ? Math.round((todayShifts.covered / todayShifts.total) * 100) 
    : 100;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Dashboard</h1>
          <span className="last-updated">
            Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <div className="dashboard-header-actions">
          <button className="feedback-btn" onClick={() => setShowFeedbackModal(true)}>
            {Icons.messageSquare}
            <span>Give Feedback</span>
          </button>
          <button className="refresh-btn" onClick={loadDashboardData}>
            {Icons.refresh}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-card ${alert.type}`}>
              <div className="alert-icon">{alert.icon}</div>
              <div className="alert-content">
                <span className="alert-title">{alert.title}</span>
              </div>
              {alert.link && (
                <button className="alert-action" onClick={() => navigate(alert.link)}>
                  {alert.actionText} {Icons.chevronRight}
                </button>
              )}
              {alert.type !== 'success' && (
                <button className="alert-dismiss" onClick={() => dismissAlert(alert.id)}>
                  {Icons.x}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card compact" onClick={() => navigate('/time')}>
          <div className="stat-icon-sm gold">{Icons.users}</div>
          <div className="stat-info">
            <div className="stat-value">{stats.activeWorkers}</div>
            <div className="stat-label">Clocked In</div>
          </div>
        </div>
        <div className="stat-card compact" onClick={() => navigate('/time')}>
          <div className="stat-icon-sm purple">{Icons.clock}</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalHoursToday}h</div>
            <div className="stat-label">Hours Today</div>
          </div>
        </div>
        <div className="stat-card compact" onClick={() => navigate('/analytics')}>
          <div className="stat-icon-sm green">{Icons.dollarSign}</div>
          <div className="stat-info">
            <div className="stat-value">${stats.laborCostToday}</div>
            <div className="stat-label">Labor Cost</div>
          </div>
        </div>
        <div className="stat-card compact" onClick={() => navigate('/workers')}>
          <div className="stat-icon-sm blue">{Icons.userCheck}</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalWorkers}</div>
            <div className="stat-label">Total Workers</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-col">
          {/* Today's Shifts Widget */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{Icons.calendar} Today's Shifts</div>
              <button className="card-action" onClick={() => navigate('/scheduling')}>
                View Schedule {Icons.chevronRight}
              </button>
            </div>
            <div className="card-body">
              {todayShifts.total === 0 ? (
                <div className="empty-state-sm">
                  <p>No shifts scheduled for today</p>
                  <button className="btn-sm" onClick={() => navigate('/scheduling')}>
                    Create Shifts
                  </button>
                </div>
              ) : (
                <>
                  <div className="coverage-summary">
                    <div className="coverage-header">
                      <span className="coverage-percent">{coveragePercent}% Covered</span>
                      <span className="coverage-detail">
                        {todayShifts.covered}/{todayShifts.total} shifts
                        {todayShifts.open > 0 && <span className="open-count"> · {todayShifts.open} open</span>}
                      </span>
                    </div>
                    <div className="coverage-bar">
                      <div 
                        className="coverage-fill" 
                        style={{ width: `${coveragePercent}%` }}
                      />
                    </div>
                  </div>
                  {todayShifts.byJob.length > 0 && (
                    <div className="shifts-by-job">
                      {todayShifts.byJob.slice(0, 4).map((job, idx) => (
                        <div key={idx} className="job-shift-row">
                          <div className="job-shift-info">
                            <span className="job-shift-name">{job.name}</span>
                            <span className="job-shift-count">
                              {job.covered}/{job.total} filled
                              {job.open > 0 && <span className="job-open"> · {job.open} open</span>}
                            </span>
                          </div>
                          <div className="job-shift-bar">
                            <div 
                              className="job-shift-fill" 
                              style={{ width: `${job.total > 0 ? (job.covered / job.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {todayShifts.open > 0 && (
                    <button className="btn-open-shifts" onClick={() => navigate('/scheduling')}>
                      Fill {todayShifts.open} Open Shift{todayShifts.open > 1 ? 's' : ''} {Icons.chevronRight}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{Icons.activity} Recent Activity</div>
              <button className="card-action" onClick={() => navigate('/time')}>
                View All {Icons.chevronRight}
              </button>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <div className="empty-state-sm">
                  <p>No activity today yet</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-dot ${activity.type}`}></div>
                      <div className="activity-content">
                        <span className="activity-user">{activity.user}</span>
                        <span className="activity-action"> {activity.action}</span>
                        <span className="activity-location"> at {activity.location}</span>
                      </div>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-col">
          {/* Who's Working */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{Icons.users} Who's Working</div>
              <span className="card-badge">{activeWorkers.length} active</span>
            </div>
            <div className="card-body">
              {activeWorkers.length === 0 ? (
                <div className="empty-state-sm">
                  <p>No one clocked in yet</p>
                </div>
              ) : (
                <div className="workers-list">
                  {activeWorkers.map(worker => (
                    <div key={worker.id} className="worker-row">
                      <div className="worker-avatar">{getInitials(worker.name)}</div>
                      <div className="worker-info">
                        <span className="worker-name">{worker.name}</span>
                        <span className="worker-job">{worker.job}</span>
                      </div>
                      <div className={`worker-status ${worker.status}`}>
                        {worker.status === 'break' ? 'Break' : getElapsedTime(worker.clockedIn)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeWorkers.length > 0 && (
                <button className="card-footer-btn" onClick={() => navigate('/time')}>
                  View all activity {Icons.chevronRight}
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{Icons.zap} Quick Actions</div>
            </div>
            <div className="card-body">
              <div className="quick-actions-grid">
                <button className="quick-action-btn" onClick={() => navigate('/workers')}>
                  {Icons.userPlus}
                  <span>Add Worker</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/locations')}>
                  {Icons.building}
                  <span>Add Location</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/scheduling')}>
                  {Icons.calendar}
                  <span>Schedule</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/time?tab=manual')}>
                  {Icons.clock}
                  <span>Manual Entry</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/shift-templates')}>
                  {Icons.briefcase}
                  <span>Shift Templates</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/analytics')}>
                  {Icons.pieChart}
                  <span>Reports</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/compliance-reports')}>
                  {Icons.download}
                  <span>Pay Periods</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/settings')}>
                  {Icons.settings}
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="feedback-modal" onClick={e => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h2>Share Your Feedback</h2>
              <p>As a Founding Partner, your input directly shapes Punch'd's development.</p>
              <button className="modal-close" onClick={() => setShowFeedbackModal(false)}>
                {Icons.x}
              </button>
            </div>
            <div className="feedback-modal-body">
              {feedbackSent ? (
                <div className="feedback-success">
                  {Icons.checkCircle}
                  <p>Thank you for your feedback!</p>
                </div>
              ) : (
                <>
                  <div className="feedback-type-selector">
                    <label className={feedbackType === 'feature' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="feedbackType" 
                        value="feature" 
                        checked={feedbackType === 'feature'}
                        onChange={(e) => setFeedbackType(e.target.value)}
                      />
                      <span>Feature Request</span>
                    </label>
                    <label className={feedbackType === 'bug' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="feedbackType" 
                        value="bug" 
                        checked={feedbackType === 'bug'}
                        onChange={(e) => setFeedbackType(e.target.value)}
                      />
                      <span>Bug Report</span>
                    </label>
                    <label className={feedbackType === 'improvement' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="feedbackType" 
                        value="improvement" 
                        checked={feedbackType === 'improvement'}
                        onChange={(e) => setFeedbackType(e.target.value)}
                      />
                      <span>Improvement</span>
                    </label>
                    <label className={feedbackType === 'other' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="feedbackType" 
                        value="other" 
                        checked={feedbackType === 'other'}
                        onChange={(e) => setFeedbackType(e.target.value)}
                      />
                      <span>Other</span>
                    </label>
                  </div>
                  <textarea
                    placeholder="Tell us what's on your mind..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={5}
                  />
                  <button 
                    className="feedback-submit-btn" 
                    onClick={sendFeedback}
                    disabled={!feedbackText.trim() || feedbackSending}
                  >
                    {feedbackSending ? 'Sending...' : 'Send Feedback'}
                    {Icons.send}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;