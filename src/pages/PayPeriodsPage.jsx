import { useState, useEffect } from 'react';
import { payPeriodsApi } from '../services/api';
import './PayPeriodsPage.css';

const Icons = {
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  unlock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: '#10b981', bg: '#dcfce7' },
  LOCKED: { label: 'Locked', color: '#6366f1', bg: '#e0e7ff' },
  EXPORTED: { label: 'Exported', color: '#64748b', bg: '#f1f5f9' },
};

const PAY_PERIOD_TYPES = [
  { value: 'WEEKLY', label: 'Weekly', description: 'Every 7 days' },
  { value: 'BIWEEKLY', label: 'Bi-weekly', description: 'Every 14 days' },
  { value: 'SEMIMONTHLY', label: 'Semi-monthly', description: '1st-15th and 16th-end' },
  { value: 'MONTHLY', label: 'Monthly', description: 'Once per month' },
  { value: 'CUSTOM', label: 'Custom', description: 'Set your own cycle' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatHours(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function PayPeriodsPage() {
  const [payPeriods, setPayPeriods] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periodDetails, setPeriodDetails] = useState(null);
  
  // Form states
  const [setupForm, setSetupForm] = useState({
    payPeriodType: 'WEEKLY',
    payPeriodStartDay: 1,
    payPeriodAnchorDate: '',
    customPayPeriodDays: 14,
  });
  const [createForm, setCreateForm] = useState({ startDate: '', endDate: '' });
  const [unlockReason, setUnlockReason] = useState('');
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isOwner = currentUser.role === 'OWNER';
  const API_URL = import.meta.env.VITE_API_URL || 'https://punchd-backend.onrender.com';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, periodsRes] = await Promise.all([
        payPeriodsApi.getSettings(),
        payPeriodsApi.getAll(),
      ]);
      setSettings(settingsRes.data);
      setPayPeriods(periodsRes.data);
      
      // Pre-fill setup form if already configured
      if (settingsRes.data.isConfigured) {
        setSetupForm({
          payPeriodType: settingsRes.data.payPeriodType,
          payPeriodStartDay: settingsRes.data.payPeriodStartDay,
          payPeriodAnchorDate: settingsRes.data.payPeriodAnchorDate 
            ? new Date(settingsRes.data.payPeriodAnchorDate).toISOString().split('T')[0]
            : '',
          customPayPeriodDays: settingsRes.data.customPayPeriodDays || 14,
        });
      }
    } catch (err) {
      setError('Failed to load pay periods');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await payPeriodsApi.configureSettings(setupForm);
      setShowSetupModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to configure pay periods');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await payPeriodsApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({ startDate: '', endDate: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create pay period');
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async (periodId) => {
    if (!confirm('Are you sure you want to lock this pay period? Time entries will become immutable.')) {
      return;
    }
    
    try {
      await payPeriodsApi.lock(periodId);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock pay period');
    }
  };

  const handleUnlock = async () => {
    if (!selectedPeriod) return;
    setSaving(true);
    setError('');
    
    try {
      await payPeriodsApi.unlock(selectedPeriod.id, { reason: unlockReason });
      setShowUnlockModal(false);
      setUnlockReason('');
      setSelectedPeriod(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlock pay period');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (periodId) => {
    const token = localStorage.getItem('adminToken');
    window.open(`${API_URL}/pay-periods/${periodId}/export?format=CSV`, '_blank');
  };

  const handleViewDetails = async (period) => {
    try {
      const res = await payPeriodsApi.getDetails(period.id);
      setPeriodDetails(res.data);
      setSelectedPeriod(period);
      setShowDetailsModal(true);
    } catch (err) {
      setError('Failed to load period details');
    }
  };

  const openUnlockModal = (period) => {
    setSelectedPeriod(period);
    setShowUnlockModal(true);
  };

  if (loading) {
    return (
      <div className="pay-periods-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading pay periods...</p>
        </div>
      </div>
    );
  }

  // Show setup prompt if not configured
  if (!settings?.isConfigured) {
    return (
      <div className="pay-periods-page">
        <div className="page-header">
          <div>
            <h1>Pay Periods</h1>
            <p>Configure your payroll schedule</p>
          </div>
        </div>

        <div className="setup-prompt">
          <div className="setup-icon">{Icons.settings}</div>
          <h2>Set Up Pay Periods</h2>
          <p>Configure your recurring pay period schedule to automatically track and lock timesheets.</p>
          <button className="btn-primary" onClick={() => setShowSetupModal(true)}>
            {Icons.settings}
            <span>Configure Pay Periods</span>
          </button>
        </div>

        {/* Setup Modal */}
        {showSetupModal && (
          <SetupModal 
            form={setupForm}
            setForm={setSetupForm}
            onSubmit={handleSetup}
            onClose={() => setShowSetupModal(false)}
            saving={saving}
            error={error}
          />
        )}
      </div>
    );
  }

  return (
    <div className="pay-periods-page">
      <div className="page-header">
        <div>
          <h1>Pay Periods</h1>
          <p>
            {PAY_PERIOD_TYPES.find(t => t.value === settings.payPeriodType)?.label} schedule • 
            {settings.payPeriodType === 'WEEKLY' || settings.payPeriodType === 'BIWEEKLY'
              ? ` Starts ${DAYS_OF_WEEK.find(d => d.value === settings.payPeriodStartDay)?.label}`
              : settings.payPeriodType === 'MONTHLY'
              ? ` Day ${settings.payPeriodStartDay}`
              : ''
            }
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowSetupModal(true)}>
            {Icons.settings}
            <span>Settings</span>
          </button>
          <button className="btn-secondary" onClick={() => setShowCreateModal(true)}>
            {Icons.plus}
            <span>Manual Period</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>{Icons.x}</button>
        </div>
      )}

      {/* Pay Periods List */}
      <div className="periods-list">
        {payPeriods.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{Icons.clock}</span>
            <h3>No Pay Periods Yet</h3>
            <p>Your first pay period will be created automatically when time entries are logged.</p>
          </div>
        ) : (
          payPeriods.map(period => {
            const statusConfig = STATUS_CONFIG[period.status];
            const hasWarning = period.pendingCount > 0 && period.status === 'OPEN';
            
            return (
              <div key={period.id} className={`period-card ${hasWarning ? 'has-warning' : ''}`}>
                <div className="period-header">
                  <div className="period-dates">
                    <span className="date-range">
                      {formatDate(period.startDate)} — {formatDate(period.endDate)}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ color: statusConfig.color, background: statusConfig.bg }}
                    >
                      {period.status === 'LOCKED' && Icons.lock}
                      {statusConfig.label}
                    </span>
                    {period.isAutoGenerated && (
                      <span className="auto-badge">Auto</span>
                    )}
                  </div>
                  
                  <div className="period-actions">
                    <button className="btn-icon" onClick={() => handleViewDetails(period)} title="View details">
                      {Icons.eye}
                    </button>
                    
                    <button className="btn-icon" onClick={() => handleExport(period.id)} title="Export CSV">
                      {Icons.download}
                    </button>
                    
                    {period.status === 'OPEN' && (
                      <button 
                        className="btn-lock" 
                        onClick={() => handleLock(period.id)}
                        disabled={period.pendingCount > 0}
                        title={period.pendingCount > 0 ? 'Approve all entries first' : 'Lock pay period'}
                      >
                        {Icons.lock} Lock
                      </button>
                    )}
                    
                    {period.status === 'LOCKED' && isOwner && (
                      <button 
                        className="btn-unlock" 
                        onClick={() => openUnlockModal(period)}
                        title="Unlock pay period"
                      >
                        {Icons.unlock} Unlock
                      </button>
                    )}
                  </div>
                </div>

                <div className="period-stats">
                  <div className="stat">
                    <span className="stat-value">{period.entryCount}</span>
                    <span className="stat-label">Entries</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{formatHours(period.totalMinutes)}</span>
                    <span className="stat-label">Total Hours</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{formatHours(period.regularMinutes)}</span>
                    <span className="stat-label">Regular</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value overtime">{formatHours(period.overtimeMinutes)}</span>
                    <span className="stat-label">Overtime</span>
                  </div>
                  {period.pendingCount > 0 && (
                    <div className="stat warning">
                      <span className="stat-value">{period.pendingCount}</span>
                      <span className="stat-label">Pending</span>
                    </div>
                  )}
                </div>

                {hasWarning && (
                  <div className="period-warning">
                    {Icons.alert} {period.pendingCount} entries need approval before locking
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <SetupModal 
          form={setupForm}
          setForm={setSetupForm}
          onSubmit={handleSetup}
          onClose={() => setShowSetupModal(false)}
          saving={saving}
          error={error}
          isEdit={true}
        />
      )}

      {/* Create Manual Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Manual Pay Period</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>{Icons.x}</button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={e => setCreateForm({ ...createForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={e => setCreateForm({ ...createForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && selectedPeriod && (
        <div className="modal-overlay" onClick={() => setShowUnlockModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Unlock Pay Period</h2>
              <button className="btn-close" onClick={() => setShowUnlockModal(false)}>{Icons.x}</button>
            </div>
            
            <div className="modal-body">
              <div className="warning-box">
                <span>{Icons.alert}</span>
                <div>
                  <strong>This action will be logged</strong>
                  <p>Unlocking allows edits to previously locked entries. A reason is required for audit purposes.</p>
                </div>
              </div>
              
              <div className="form-group">
                <label>Reason for Unlocking</label>
                <textarea
                  value={unlockReason}
                  onChange={e => setUnlockReason(e.target.value)}
                  placeholder="e.g., Correcting missed clock-out for employee"
                  rows={3}
                  minLength={10}
                  required
                />
                <span className="input-hint">Minimum 10 characters</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowUnlockModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleUnlock}
                disabled={saving || unlockReason.length < 10}
              >
                {saving ? 'Unlocking...' : 'Unlock Period'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPeriod && periodDetails && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {formatDate(selectedPeriod.startDate)} — {formatDate(selectedPeriod.endDate)}
              </h2>
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>{Icons.x}</button>
            </div>
            
            <div className="modal-body">
              <div className="details-summary">
                <div className="summary-stat">
                  <span className="value">{periodDetails.summary.totalEntries}</span>
                  <span className="label">Total Entries</span>
                </div>
                <div className="summary-stat">
                  <span className="value">{formatHours(periodDetails.summary.totalMinutes)}</span>
                  <span className="label">Total Hours</span>
                </div>
                <div className="summary-stat">
                  <span className="value approved">{periodDetails.summary.approvedCount}</span>
                  <span className="label">Approved</span>
                </div>
                <div className="summary-stat">
                  <span className="value pending">{periodDetails.summary.pendingCount}</span>
                  <span className="label">Pending</span>
                </div>
              </div>

              <h3>Hours by Employee</h3>
              <div className="user-hours-list">
                {periodDetails.byUser.length === 0 ? (
                  <p className="no-data">No time entries in this period</p>
                ) : (
                  periodDetails.byUser.map(item => (
                    <div key={item.user.id} className="user-hours-row">
                      <div className="user-info">
                        <span className="user-name">{item.user.name}</span>
                        <span className="entry-count">{item.entries.length} entries</span>
                      </div>
                      <div className="hours-breakdown">
                        <span className="regular">{formatHours(item.regularMinutes)} reg</span>
                        {item.overtimeMinutes > 0 && (
                          <span className="overtime">{formatHours(item.overtimeMinutes)} OT</span>
                        )}
                        {item.doubleTimeMinutes > 0 && (
                          <span className="doubletime">{formatHours(item.doubleTimeMinutes)} DT</span>
                        )}
                      </div>
                      <div className="total-pay">
                        ${item.totalPay.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => handleExport(selectedPeriod.id)}>
                {Icons.download} Export CSV
              </button>
              <button className="btn-primary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Setup Modal Component
function SetupModal({ form, setForm, onSubmit, onClose, saving, error, isEdit }) {
  const needsAnchor = form.payPeriodType === 'BIWEEKLY' || form.payPeriodType === 'CUSTOM';
  const needsStartDay = ['WEEKLY', 'BIWEEKLY'].includes(form.payPeriodType);
  const needsMonthDay = ['SEMIMONTHLY', 'MONTHLY'].includes(form.payPeriodType);
  const needsCustomDays = form.payPeriodType === 'CUSTOM';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-setup" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Pay Period Settings' : 'Set Up Pay Periods'}</h2>
          <button className="btn-close" onClick={onClose}>{Icons.x}</button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Pay Period Type</label>
            <div className="type-options">
              {PAY_PERIOD_TYPES.map(type => (
                <label 
                  key={type.value} 
                  className={`type-option ${form.payPeriodType === type.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payPeriodType"
                    value={type.value}
                    checked={form.payPeriodType === type.value}
                    onChange={e => setForm({ ...form, payPeriodType: e.target.value })}
                  />
                  <div className="type-content">
                    <span className="type-label">{type.label}</span>
                    <span className="type-desc">{type.description}</span>
                  </div>
                  {form.payPeriodType === type.value && (
                    <span className="type-check">{Icons.check}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {needsStartDay && (
            <div className="form-group">
              <label>Week Starts On</label>
              <select
                value={form.payPeriodStartDay}
                onChange={e => setForm({ ...form, payPeriodStartDay: parseInt(e.target.value) })}
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
          )}

          {needsMonthDay && (
            <div className="form-group">
              <label>
                {form.payPeriodType === 'SEMIMONTHLY' 
                  ? 'First Period Starts On Day' 
                  : 'Period Starts On Day'}
              </label>
              <select
                value={form.payPeriodStartDay}
                onChange={e => setForm({ ...form, payPeriodStartDay: parseInt(e.target.value) })}
              >
                {Array.from({ length: form.payPeriodType === 'SEMIMONTHLY' ? 15 : 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              {form.payPeriodType === 'SEMIMONTHLY' && (
                <span className="input-hint">Second period automatically starts on the 16th</span>
              )}
            </div>
          )}

          {needsAnchor && (
            <div className="form-group">
              <label>
                {form.payPeriodType === 'BIWEEKLY' 
                  ? 'First Pay Period Start Date' 
                  : 'Anchor Date (First Period Start)'}
              </label>
              <input
                type="date"
                value={form.payPeriodAnchorDate}
                onChange={e => setForm({ ...form, payPeriodAnchorDate: e.target.value })}
                required
              />
              <span className="input-hint">All future periods are calculated from this date</span>
            </div>
          )}

          {needsCustomDays && (
            <div className="form-group">
              <label>Days Per Period</label>
              <input
                type="number"
                min="1"
                max="31"
                value={form.customPayPeriodDays}
                onChange={e => setForm({ ...form, customPayPeriodDays: parseInt(e.target.value) })}
                required
              />
            </div>
          )}

          {error && <div className="form-error">{error}</div>}
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PayPeriodsPage;