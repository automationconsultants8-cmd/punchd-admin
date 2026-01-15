import { useState, useEffect } from 'react';
import { breakComplianceApi, usersApi } from '../services/api';
import './CompliancePage.css';
import { withFeatureGate } from '../components/FeatureGate';

function CompliancePage() {
  const [stats, setStats] = useState(null);
  const [violations, setViolations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [workerFilter, setWorkerFilter] = useState('');
  const [waiveModal, setWaiveModal] = useState({ open: false, violation: null, reason: '' });
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, violationsRes, workersRes, settingsRes] = await Promise.all([
        breakComplianceApi.getStats().catch(() => ({ data: {} })),
        breakComplianceApi.getViolations().catch(() => ({ data: [] })),
        usersApi.getAll().catch(() => ({ data: [] })),
        breakComplianceApi.getSettings().catch(() => ({ data: {} })),
      ]);

      setStats(statsRes.data);
      setViolations(violationsRes.data || []);
      setWorkers(workersRes.data || []);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error('Failed to load compliance data:', err);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

const formatTime = (dateString) => {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' });
};

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${Number(amount).toFixed(2)}`;
  };

  const getViolationIcon = (type) => {
    switch (type) {
      case 'MISSED_MEAL_BREAK': return '🍽️';
      case 'SHORT_MEAL_BREAK': return '⏱️';
      case 'MISSED_SECOND_MEAL': return '🍽️';
      case 'MISSED_REST_BREAK': return '☕';
      case 'LATE_MEAL_BREAK': return '⏰';
      default: return '⚠️';
    }
  };

  const getViolationLabel = (type) => {
    switch (type) {
      case 'MISSED_MEAL_BREAK': return 'Missed Meal Break';
      case 'SHORT_MEAL_BREAK': return 'Short Meal Break';
      case 'MISSED_SECOND_MEAL': return 'Missed 2nd Meal';
      case 'MISSED_REST_BREAK': return 'Missed Rest Break';
      case 'LATE_MEAL_BREAK': return 'Late Meal Break';
      default: return type;
    }
  };

  const activeViolations = violations.filter(v => !v.waived);
  const waivedViolations = violations.filter(v => v.waived);

  const getFilteredViolations = () => {
    const list = activeTab === 'active' ? activeViolations : activeTab === 'waived' ? waivedViolations : [];
    if (!workerFilter) return list;
    return list.filter(v => v.userId === workerFilter);
  };

  const handleWaive = async () => {
    if (!waiveModal.reason.trim()) {
      alert('Please provide a reason for waiving this violation');
      return;
    }

    try {
      await breakComplianceApi.waiveViolation(waiveModal.violation.id, waiveModal.reason);
      setViolations(prev => prev.map(v => 
        v.id === waiveModal.violation.id 
          ? { ...v, waived: true, waivedReason: waiveModal.reason }
          : v
      ));
      setWaiveModal({ open: false, violation: null, reason: '' });
      loadData();
    } catch (err) {
      console.error('Failed to waive violation:', err);
      alert('Failed to waive violation');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await breakComplianceApi.updateSettings(settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="compliance-page">
        <div className="loading-state"><div className="spinner"></div><p>Loading compliance data...</p></div>
      </div>
    );
  }

  return (
    <div className="compliance-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Break Compliance</h1>
          <p className="page-subtitle">Monitor meal and rest break violations (California Labor Code)</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card stat-violations" onClick={() => setActiveTab('active')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activeViolations || 0}</div>
            <div className="stat-label">Active Violations</div>
          </div>
        </div>
        <div className="stat-card stat-penalty">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats?.totalPenalty)}</div>
            <div className="stat-label">Penalty Liability</div>
          </div>
        </div>
        <div className="stat-card stat-workers">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.affectedWorkers || 0}</div>
            <div className="stat-label">Affected Workers</div>
          </div>
        </div>
        <div className="stat-card stat-waived" onClick={() => setActiveTab('waived')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.waivedViolations || 0}</div>
            <div className="stat-label">Waived</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`} 
          onClick={() => setActiveTab('active')}
        >
          Active Violations {activeViolations.length > 0 && <span className="tab-badge">{activeViolations.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'waived' ? 'active' : ''}`} 
          onClick={() => setActiveTab('waived')}
        >
          Waived {waivedViolations.length > 0 && <span className="tab-badge tab-badge-success">{waivedViolations.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {(activeTab === 'active' || activeTab === 'waived') && (
        <>
          {/* Filter */}
          <div className="filters-bar">
            <div className="filter-group">
              <label>Worker</label>
              <select 
                value={workerFilter} 
                onChange={(e) => setWorkerFilter(e.target.value)} 
                className="form-select"
              >
                <option value="">All Workers</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            {workerFilter && (
              <button className="btn btn-ghost" onClick={() => setWorkerFilter('')}>Clear</button>
            )}
          </div>

          {/* Violations List */}
          <div className="violations-list">
            {getFilteredViolations().length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <span className="empty-icon">{activeTab === 'active' ? '✓' : '📋'}</span>
                  <p className="empty-title">
                    {activeTab === 'active' ? 'No active violations' : 'No waived violations'}
                  </p>
                  <p className="empty-text">
                    {activeTab === 'active' 
                      ? 'All workers are compliant with break requirements' 
                      : 'No violations have been waived yet'}
                  </p>
                </div>
              </div>
            ) : (
              getFilteredViolations().map(violation => (
                <div key={violation.id} className={`card violation-card ${violation.waived ? 'waived' : ''}`}>
                  <div className="violation-header">
                    <div className="violation-icon">{getViolationIcon(violation.violationType)}</div>
                    <div className="violation-info">
                      <div className="violation-type">{getViolationLabel(violation.violationType)}</div>
                      <div className="violation-worker">{violation.user?.name || 'Unknown Worker'}</div>
                    </div>
                    <div className="violation-meta">
                      {violation.waived ? (
                        <span className="badge badge-success">✓ Waived</span>
                      ) : (
                        <span className="badge badge-danger">Active</span>
                      )}
                      <span className={`violation-penalty ${violation.waived ? 'waived' : ''}`}>
                        {formatCurrency(violation.penaltyAmount)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="violation-description">
                    {violation.description}
                  </div>

                  <div className="violation-details">
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{formatDate(violation.timeEntry?.clockInTime)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Shift</span>
                      <span className="detail-value">
                        {formatTime(violation.timeEntry?.clockInTime)} - {formatTime(violation.timeEntry?.clockOutTime)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{((violation.timeEntry?.durationMinutes || 0) / 60).toFixed(1)}h</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Penalty Hours</span>
                      <span className="detail-value">{Number(violation.penaltyHours).toFixed(1)}h</span>
                    </div>
                  </div>

                  {violation.waived && violation.waivedReason && (
                    <div className="violation-waived-info">
                      <strong>Waived:</strong> {violation.waivedReason}
                    </div>
                  )}

                  {!violation.waived && (
                    <div className="violation-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setWaiveModal({ open: true, violation, reason: '' })}
                      >
                        Waive Violation
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'settings' && settings && (
        <div className="card settings-card">
          {settingsSaved && (
            <div className="alert alert-success">✓ Settings saved successfully</div>
          )}

          <div className="settings-section">
            <h3>Compliance Rules</h3>
            <p className="settings-description">Configure break requirements based on your state's labor laws</p>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.enabled} 
                  onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                />
                Enable break compliance tracking
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">State</label>
                <select 
                  value={settings.state} 
                  onChange={(e) => setSettings(prev => ({ ...prev, state: e.target.value }))}
                  className="form-select"
                >
                  <option value="CA">California</option>
                  <option value="WA">Washington</option>
                  <option value="OR">Oregon</option>
                  <option value="OTHER">Other (Federal)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Penalty Rate (hours of pay per violation)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={settings.penaltyRate} 
                  onChange={(e) => setSettings(prev => ({ ...prev, penaltyRate: parseFloat(e.target.value) }))}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Meal Break Rules</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First meal break required after (hours)</label>
                <input 
                  type="number" 
                  value={settings.mealBreakThreshold / 60} 
                  onChange={(e) => setSettings(prev => ({ ...prev, mealBreakThreshold: parseFloat(e.target.value) * 60 }))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Meal break duration (minutes)</label>
                <input 
                  type="number" 
                  value={settings.mealBreakDuration} 
                  onChange={(e) => setSettings(prev => ({ ...prev, mealBreakDuration: parseInt(e.target.value) }))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Second meal break after (hours)</label>
                <input 
                  type="number" 
                  value={settings.secondMealThreshold / 60} 
                  onChange={(e) => setSettings(prev => ({ ...prev, secondMealThreshold: parseFloat(e.target.value) * 60 }))}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Rest Break Rules</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rest break every (hours)</label>
                <input 
                  type="number" 
                  value={settings.restBreakInterval / 60} 
                  onChange={(e) => setSettings(prev => ({ ...prev, restBreakInterval: parseFloat(e.target.value) * 60 }))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rest break duration (minutes)</label>
                <input 
                  type="number" 
                  value={settings.restBreakDuration} 
                  onChange={(e) => setSettings(prev => ({ ...prev, restBreakDuration: parseInt(e.target.value) }))}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="settings-actions">
            <button className="btn btn-primary" onClick={handleSaveSettings}>Save Settings</button>
          </div>

          <div className="settings-info">
            <h4>California Labor Code Summary</h4>
            <ul>
              <li><strong>Meal Break:</strong> 30-minute unpaid break for shifts over 5 hours</li>
              <li><strong>Second Meal:</strong> Additional 30-minute break for shifts over 10 hours</li>
              <li><strong>Rest Breaks:</strong> 10-minute paid break for every 4 hours worked</li>
              <li><strong>Penalty:</strong> 1 hour of pay at regular rate for each violation</li>
            </ul>
          </div>
        </div>
      )}

      {/* Waive Modal */}
      {waiveModal.open && (
        <div className="modal-overlay" onClick={() => setWaiveModal({ open: false, violation: null, reason: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Waive Violation</h3>
              <button className="modal-close" onClick={() => setWaiveModal({ open: false, violation: null, reason: '' })}>×</button>
            </div>
            <div className="modal-body">
              <p>You are waiving a <strong>{getViolationLabel(waiveModal.violation?.violationType)}</strong> violation for <strong>{waiveModal.violation?.user?.name}</strong>.</p>
              <p className="text-warning">This will remove the {formatCurrency(waiveModal.violation?.penaltyAmount)} penalty. Please provide a reason.</p>
              
              <div className="form-group">
                <label className="form-label">Reason for waiving</label>
                <textarea 
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g., Worker voluntarily skipped break, documented waiver on file..."
                  value={waiveModal.reason}
                  onChange={(e) => setWaiveModal(prev => ({ ...prev, reason: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setWaiveModal({ open: false, violation: null, reason: '' })}>Cancel</button>
              <button className="btn btn-primary" onClick={handleWaive}>Waive Violation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withFeatureGate(CompliancePage, 'BREAK_COMPLIANCE');