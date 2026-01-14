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
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
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
};

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: '#10b981', bg: '#dcfce7' },
  LOCKED: { label: 'Locked', color: '#6366f1', bg: '#e0e7ff' },
  EXPORTED: { label: 'Exported', color: '#64748b', bg: '#f1f5f9' },
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periodDetails, setPeriodDetails] = useState(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [createForm, setCreateForm] = useState({ startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isOwner = currentUser.role === 'OWNER';

  useEffect(() => {
    fetchPayPeriods();
  }, []);

  const fetchPayPeriods = async () => {
    try {
      setLoading(true);
      const res = await payPeriodsApi.getAll();
      setPayPeriods(res.data);
    } catch (err) {
      setError('Failed to load pay periods');
      console.error(err);
    } finally {
      setLoading(false);
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
      fetchPayPeriods();
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
      fetchPayPeriods();
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
      fetchPayPeriods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlock pay period');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="pay-periods-page">
      <div className="page-header">
        <div>
          <h1>Pay Periods</h1>
          <p>Lock timesheets after payroll to prevent edits</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          {Icons.plus}
          <span>New Pay Period</span>
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>{Icons.x}</button>
        </div>
      )}

      {/* Info Banner */}
      <div className="info-banner">
        <span className="info-icon">{Icons.alert}</span>
        <div>
          <strong>How Pay Period Locking Works</strong>
          <p>Once locked, time entries in that period cannot be edited or deleted. Only owners can unlock a pay period with a documented reason.</p>
        </div>
      </div>

      {/* Pay Periods List */}
      <div className="periods-list">
        {payPeriods.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{Icons.clock}</span>
            <h3>No Pay Periods</h3>
            <p>Create your first pay period to start tracking</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              {Icons.plus} Create Pay Period
            </button>
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
                  </div>
                  
                  <div className="period-actions">
                    <button className="btn-icon" onClick={() => handleViewDetails(period)} title="View details">
                      {Icons.eye}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Pay Period</h2>
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
                  <p>Unlocking a pay period allows edits to previously locked time entries. A reason is required for audit purposes.</p>
                </div>
              </div>
              
              <div className="form-group">
                <label>Reason for Unlocking</label>
                <textarea
                  value={unlockReason}
                  onChange={e => setUnlockReason(e.target.value)}
                  placeholder="e.g., Correcting missed clock-out for employee John Smith"
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
              {/* Summary */}
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

              {/* By User */}
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
                      <div className="status-counts">
                        {item.pendingCount > 0 && (
                          <span className="pending-badge">{item.pendingCount} pending</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="modal-footer">
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

export default PayPeriodsPage;