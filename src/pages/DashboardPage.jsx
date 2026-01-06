import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, jobsApi, timeEntriesApi, shiftRequestsApi, timeOffApi } from '../services/api';
import './DashboardPage.css';

// SVG Icons
const Icons = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  dollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M9 14l2 2 4-4"/>
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  arrowLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
      <line x1="6" y1="2" x2="6" y2="4"/>
      <line x1="10" y1="2" x2="10" y2="4"/>
      <line x1="14" y1="2" x2="14" y2="4"/>
    </svg>
  ),
  alertTriangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  userPlus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
      <line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M12 6h.01"/>
      <path d="M12 10h.01"/>
      <path d="M12 14h.01"/>
      <path d="M16 10h.01"/>
      <path d="M16 14h.01"/>
      <path d="M8 10h.01"/>
      <path d="M8 14h.01"/>
    </svg>
  ),
  clockEdit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  barChart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  trendingUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
};

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeWorkers: 0,
    totalHoursToday: 0,
    laborCostToday: 0,
    pendingApprovals: 0,
    pendingRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeWorkers, setActiveWorkers] = useState([]);
  const [jobBreakdown, setJobBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const [workersRes, jobsRes, timeRes, approvalStatsRes, shiftStatsRes, timeOffStatsRes] = await Promise.all([
        usersApi.getAll().catch(() => ({ data: [] })),
        jobsApi.getAll().catch(() => ({ data: [] })),
        timeEntriesApi.getAll({ 
          startDate: startOfDay.toISOString(), 
          endDate: endOfDay.toISOString() 
        }).catch(() => ({ data: [] })),
        timeEntriesApi.getApprovalStats().catch(() => ({ data: { pending: 0 } })),
        shiftRequestsApi.getStats().catch(() => ({ data: { pending: 0 } })),
        timeOffApi.getStats().catch(() => ({ data: { pending: 0 } })),
      ]);

      const workers = workersRes.data || [];
      const jobs = jobsRes.data || [];
      const timeEntries = timeRes.data || [];
      const approvalStats = approvalStatsRes.data || { pending: 0 };
      const shiftStats = shiftStatsRes.data || { pending: 0 };
      const timeOffStats = timeOffStatsRes.data || { pending: 0 };

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
      });

      setActiveWorkers(clockedIn.slice(0, 6).map(e => ({
        id: e.userId,
        name: e.user?.name || 'Worker',
        job: e.job?.name || 'Unknown Site',
        clockedIn: e.clockInTime,
        status: e.isOnBreak ? 'break' : 'working',
      })));

      const jobCounts = {};
      timeEntries.forEach(e => {
        const jobName = e.job?.name || 'Unassigned';
        jobCounts[jobName] = (jobCounts[jobName] || 0) + 1;
      });
      setJobBreakdown(Object.entries(jobCounts).map(([name, count]) => ({ name, count })));

      const activity = timeEntries.slice(0, 6).map((e) => ({
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

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
    setLoading(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getElapsedTime = (clockedIn) => {
    const now = new Date();
    const start = new Date(clockedIn);
    const diffMs = now - start;
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}:${mins.toString().padStart(2, '0')}`;
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

  return (
    <div className="dashboard-page">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon gold">
              {Icons.users}
            </div>
            <div className="stat-trend up">
              {Icons.trendingUp}
              <span>Active</span>
            </div>
          </div>
          <div className="stat-value">{stats.activeWorkers}</div>
          <div className="stat-label">Workers Clocked In</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">
              {Icons.clock}
            </div>
          </div>
          <div className="stat-value">{stats.totalHoursToday}</div>
          <div className="stat-label">Hours Today</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              {Icons.dollarSign}
            </div>
          </div>
          <div className="stat-value">${stats.laborCostToday}</div>
          <div className="stat-label">Labor Cost Today</div>
        </div>

        <div 
          className={`stat-card ${stats.pendingApprovals > 0 ? 'clickable' : ''}`}
          onClick={() => stats.pendingApprovals > 0 && navigate('/time?tab=approvals')}
        >
          <div className="stat-header">
            <div className="stat-icon blue">
              {Icons.clipboard}
            </div>
            {stats.pendingApprovals > 0 && (
              <div className="stat-badge">{stats.pendingApprovals}</div>
            )}
          </div>
          <div className="stat-value">{stats.pendingApprovals}</div>
          <div className="stat-label">Pending Approvals</div>
          {stats.pendingApprovals > 0 && (
            <div className="stat-action">
              Review now {Icons.chevronRight}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                {Icons.activity}
                Recent Activity
              </div>
              <button className="card-action" onClick={() => navigate('/time')}>
                View All {Icons.chevronRight}
              </button>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{Icons.inbox}</div>
                  <h3>No activity today</h3>
                  <p>Time entries will appear here</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}>
                        {activity.type === 'clock-in' && Icons.arrowRight}
                        {activity.type === 'clock-out' && Icons.arrowLeft}
                        {activity.type === 'break' && Icons.coffee}
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                          <strong>{activity.user}</strong> {activity.action}
                        </div>
                        <div className="activity-meta">
                          {activity.location} · {activity.time}
                        </div>
                      </div>
                      {activity.status === 'warning' && (
                        <div className="activity-warning">{Icons.alertTriangle}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job Site Breakdown */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                {Icons.mapPin}
                Job Site Breakdown
              </div>
              <button className="card-action" onClick={() => navigate('/job-sites')}>
                Manage Sites {Icons.chevronRight}
              </button>
            </div>
            <div className="card-body">
              {jobBreakdown.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{Icons.building}</div>
                  <h3>No entries today</h3>
                  <p>Job site activity will appear here</p>
                  <button className="btn-primary-sm" onClick={() => navigate('/job-sites')}>
                    Add Job Site
                  </button>
                </div>
              ) : (
                <div className="jobs-list">
                  {jobBreakdown.map((job, idx) => (
                    <div key={idx} className="job-item">
                      <div className="job-info">
                        <div className="job-name">{job.name}</div>
                        <div className="job-bar">
                          <div 
                            className="job-bar-fill" 
                            style={{ width: `${(job.count / Math.max(...jobBreakdown.map(j => j.count))) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="job-count">{job.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Who's Working */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                {Icons.users}
                Who's Working
              </div>
              <span className="card-badge">{activeWorkers.length} active</span>
            </div>
            <div className="card-body">
              {activeWorkers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{Icons.users}</div>
                  <h3>No active workers</h3>
                  <p>Workers will appear here when they clock in</p>
                </div>
              ) : (
                <div className="workers-list">
                  {activeWorkers.map(worker => (
                    <div key={worker.id} className="worker-item">
                      <div className="worker-avatar">
                        {getInitials(worker.name)}
                      </div>
                      <div className="worker-info">
                        <div className="worker-name">{worker.name}</div>
                        <div className="worker-job">{worker.job}</div>
                      </div>
                      <div className="worker-timer">
                        <div className={`timer-value ${worker.status}`}>
                          {getElapsedTime(worker.clockedIn)}
                        </div>
                        <div className="timer-label">
                          {worker.status === 'break' ? 'On Break' : 'Elapsed'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeWorkers.length > 0 && (
                <div className="card-footer">
                  <button className="card-action" onClick={() => navigate('/workers')}>
                    View all workers {Icons.chevronRight}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          {stats.pendingRequests > 0 && (
            <div className="card highlight">
              <div className="card-header">
                <div className="card-title">
                  {Icons.inbox}
                  Pending Requests
                </div>
                <span className="card-badge warning">{stats.pendingRequests}</span>
              </div>
              <div className="card-body">
                <p className="requests-summary">
                  You have {stats.pendingRequests} pending request{stats.pendingRequests > 1 ? 's' : ''} to review
                </p>
                <button className="btn-primary" onClick={() => navigate('/requests/shifts')}>
                  Review Requests {Icons.chevronRight}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="quick-action" onClick={() => navigate('/workers')}>
          <div className="quick-action-icon">{Icons.userPlus}</div>
          <span>Add Worker</span>
        </div>
        <div className="quick-action" onClick={() => navigate('/job-sites')}>
          <div className="quick-action-icon">{Icons.building}</div>
          <span>Add Job Site</span>
        </div>
        <div className="quick-action" onClick={() => navigate('/time?tab=manual')}>
          <div className="quick-action-icon">{Icons.clockEdit}</div>
          <span>Manual Entry</span>
        </div>
        <div className="quick-action" onClick={() => navigate('/analytics')}>
          <div className="quick-action-icon">{Icons.barChart}</div>
          <span>Run Report</span>
        </div>
        <div className="quick-action" onClick={() => navigate('/time')}>
          <div className="quick-action-icon">{Icons.fileText}</div>
          <span>View Timesheets</span>
        </div>
        <div className="quick-action" onClick={() => navigate('/settings')}>
          <div className="quick-action-icon">{Icons.settings}</div>
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;