import { useState, useEffect } from 'react';
import { timeEntriesApi, usersApi, jobsApi, payPeriodsApi } from '../services/api';
import './TimeTrackingPage.css';

function TimeTrackingPage() {
  const [activeTab, setActiveTab] = useState('entries');
  const [timeEntries, setTimeEntries] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalStats, setApprovalStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [exportLoading, setExportLoading] = useState(null);
  const [selectedEntries, setSelectedEntries] = useState([]);
  
  // Pay period state
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(null);
  const [payPeriodLoading, setPayPeriodLoading] = useState(false);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [filters, setFilters] = useState({
    worker: '',
    job: '',
    status: '',
    approvalStatus: '',
  });

  const [manualEntry, setManualEntry] = useState({
    workerId: '',
    jobId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '08:00',
    clockOut: '17:00',
    breakMinutes: 30,
    notes: '',
  });

  const [rejectModal, setRejectModal] = useState({ open: false, entryId: null, reason: '' });
  const [viewModal, setViewModal] = useState({ open: false, entry: null });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [unlockModal, setUnlockModal] = useState({ open: false, reason: '' });
  const [settingsModal, setSettingsModal] = useState({ open: false });
  const [payPeriodSettings, setPayPeriodSettings] = useState({
    payPeriodType: 'BIWEEKLY',
    payPeriodStartDay: 1,
    payPeriodAnchorDate: '',
    customPayPeriodDays: 14,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    loadPayPeriods();
    loadPayPeriodSettings();
  }, []);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedPayPeriod]);

  const loadPayPeriods = async () => {
    try {
      const res = await payPeriodsApi.getAll().catch(() => ({ data: [] }));
      const periods = res.data || [];
      setPayPeriods(periods);
      
      // Auto-select current open period if exists
      const currentPeriod = periods.find(p => p.status === 'OPEN');
      if (currentPeriod) {
        setSelectedPayPeriod(currentPeriod);
        // Update date range to match pay period
        setDateRange({
          start: new Date(currentPeriod.startDate).toISOString().split('T')[0],
          end: new Date(currentPeriod.endDate).toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Failed to load pay periods:', err);
    }
  };

  const loadPayPeriodSettings = async () => {
    try {
      const res = await payPeriodsApi.getSettings().catch(() => ({ data: null }));
      if (res.data && res.data.isConfigured) {
        setPayPeriodSettings({
          payPeriodType: res.data.payPeriodType || 'BIWEEKLY',
          payPeriodStartDay: res.data.payPeriodStartDay ?? 1,
          payPeriodAnchorDate: res.data.payPeriodAnchorDate 
            ? new Date(res.data.payPeriodAnchorDate).toISOString().split('T')[0] 
            : '',
          customPayPeriodDays: res.data.customPayPeriodDays || 14,
        });
      }
    } catch (err) {
      console.error('Failed to load pay period settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await payPeriodsApi.updateSettings({
        payPeriodType: payPeriodSettings.payPeriodType,
        payPeriodStartDay: parseInt(payPeriodSettings.payPeriodStartDay),
        payPeriodAnchorDate: payPeriodSettings.payPeriodAnchorDate || undefined,
        customPayPeriodDays: payPeriodSettings.payPeriodType === 'CUSTOM' 
          ? parseInt(payPeriodSettings.customPayPeriodDays) 
          : undefined,
      });
      setSettingsModal({ open: false });
      await loadPayPeriods(); // Reload periods after settings change
    } catch (err) {
      console.error('Failed to save pay period settings:', err);
      alert(err.response?.data?.message || 'Failed to save settings. Please try again.');
    }
    setSettingsLoading(false);
  };

  const getStartDayOptions = () => {
    if (payPeriodSettings.payPeriodType === 'WEEKLY' || payPeriodSettings.payPeriodType === 'BIWEEKLY') {
      return [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
      ];
    }
    if (payPeriodSettings.payPeriodType === 'SEMIMONTHLY') {
      return Array.from({ length: 15 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }));
    }
    if (payPeriodSettings.payPeriodType === 'MONTHLY') {
      return Array.from({ length: 28 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }));
    }
    return [];
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, workersRes, jobsRes, pendingRes, statsRes] = await Promise.all([
        timeEntriesApi.getAll({ startDate: dateRange.start, endDate: dateRange.end }).catch(() => ({ data: [] })),
        usersApi.getAll().catch(() => ({ data: [] })),
        jobsApi.getAll().catch(() => ({ data: [] })),
        timeEntriesApi.getPending().catch(() => ({ data: [] })),
        timeEntriesApi.getApprovalStats().catch(() => ({ data: { pending: 0, approved: 0, rejected: 0 } })),
      ]);

      setTimeEntries(entriesRes.data || []);
      setWorkers(workersRes.data || []);
      setJobs(jobsRes.data || []);
      setPendingApprovals(pendingRes.data || []);
      setApprovalStats(statsRes.data || { pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error('Failed to load time data:', err);
    }
    setLoading(false);
  };

  const handlePayPeriodChange = (periodId) => {
    if (!periodId) {
      setSelectedPayPeriod(null);
      // Reset to default 7 day range
      setDateRange({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      });
      return;
    }
    
    const period = payPeriods.find(p => p.id === periodId);
    if (period) {
      setSelectedPayPeriod(period);
      setDateRange({
        start: new Date(period.startDate).toISOString().split('T')[0],
        end: new Date(period.endDate).toISOString().split('T')[0],
      });
    }
  };

  const handleLockPayPeriod = async () => {
    if (!selectedPayPeriod) return;
    
    setPayPeriodLoading(true);
    try {
      await payPeriodsApi.lock(selectedPayPeriod.id);
      await loadPayPeriods();
      // Re-select the same period to get updated status
      const updatedPeriods = await payPeriodsApi.getAll();
      const updatedPeriod = (updatedPeriods.data || []).find(p => p.id === selectedPayPeriod.id);
      if (updatedPeriod) {
        setSelectedPayPeriod(updatedPeriod);
      }
    } catch (err) {
      console.error('Failed to lock pay period:', err);
      alert(err.response?.data?.message || 'Failed to lock pay period. Make sure all entries are approved.');
    }
    setPayPeriodLoading(false);
  };

  const handleUnlockPayPeriod = async () => {
    if (!selectedPayPeriod || !unlockModal.reason.trim()) {
      alert('Please provide a reason for unlocking');
      return;
    }
    
    setPayPeriodLoading(true);
    try {
      await payPeriodsApi.unlock(selectedPayPeriod.id, unlockModal.reason);
      setUnlockModal({ open: false, reason: '' });
      await loadPayPeriods();
      const updatedPeriods = await payPeriodsApi.getAll();
      const updatedPeriod = (updatedPeriods.data || []).find(p => p.id === selectedPayPeriod.id);
      if (updatedPeriod) {
        setSelectedPayPeriod(updatedPeriod);
      }
    } catch (err) {
      console.error('Failed to unlock pay period:', err);
      alert(err.response?.data?.message || 'Failed to unlock pay period.');
    }
    setPayPeriodLoading(false);
  };

  const formatPayPeriodLabel = (period, index) => {
    const statusIcon = period.status === 'LOCKED' ? ' 🔒' : period.status === 'EXPORTED' ? ' 📤' : '';
    return `Pay Period ${index + 1}${statusIcon}`;
  };

  const formatPayPeriodDateRange = (period) => {
    if (!period) return '';
    const start = new Date(period.startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'America/Los_Angeles'
    });
    const end = new Date(period.endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'America/Los_Angeles'
    });
    return `${start} — ${end}`;
  };

// Format date in local timezone
const formatDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
};

// Format time in local timezone
const formatTime = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true,
    timeZone: 'America/Los_Angeles'
  });
};

  const formatDuration = (minutes) => {
    if (!minutes) return '--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '--';
    return `$${Number(amount).toFixed(2)}`;
  };

  const getFilteredEntries = () => {
    return timeEntries.filter(entry => {
      if (filters.worker && entry.userId !== filters.worker) return false;
      if (filters.job && entry.jobId !== filters.job) return false;
      if (filters.status === 'flagged' && !entry.isFlagged) return false;
      if (filters.status === 'active' && entry.clockOutTime) return false;
      if (filters.status === 'completed' && !entry.clockOutTime) return false;
      if (filters.approvalStatus && entry.approvalStatus !== filters.approvalStatus) return false;
      return true;
    });
  };

  const handleApprove = async (entryId) => {
    setActionLoading(entryId);
    try {
      await timeEntriesApi.approve(entryId);
      setPendingApprovals(prev => prev.filter(e => e.id !== entryId));
      setApprovalStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
      setTimeEntries(prev => prev.map(e => e.id === entryId ? { ...e, approvalStatus: 'APPROVED' } : e));
    } catch (err) {
      console.error('Failed to approve entry:', err);
      alert('Failed to approve entry. Please try again.');
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(rejectModal.entryId);
    try {
      await timeEntriesApi.reject(rejectModal.entryId, rejectModal.reason);
      setPendingApprovals(prev => prev.filter(e => e.id !== rejectModal.entryId));
      setApprovalStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
      setTimeEntries(prev => prev.map(e => e.id === rejectModal.entryId ? { ...e, approvalStatus: 'REJECTED', rejectionReason: rejectModal.reason } : e));
      setRejectModal({ open: false, entryId: null, reason: '' });
    } catch (err) {
      console.error('Failed to reject entry:', err);
      alert('Failed to reject entry. Please try again.');
    }
    setActionLoading(null);
  };

  const handleBulkApprove = async () => {
    if (selectedEntries.length === 0) {
      alert('Please select entries to approve');
      return;
    }
    
    setActionLoading('bulk');
    try {
      await timeEntriesApi.bulkApprove(selectedEntries);
      await loadData();
      setSelectedEntries([]);
    } catch (err) {
      console.error('Failed to bulk approve:', err);
      alert('Failed to approve entries. Please try again.');
    }
    setActionLoading(null);
  };

  const toggleSelectEntry = (entryId) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEntries.length === pendingApprovals.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(pendingApprovals.map(e => e.id));
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('manual');
    try {
      await timeEntriesApi.createManual({
        userId: manualEntry.workerId,
        jobId: manualEntry.jobId || undefined,
        date: manualEntry.date,
        clockIn: manualEntry.clockIn,
        clockOut: manualEntry.clockOut,
        breakMinutes: parseInt(manualEntry.breakMinutes) || 0,
        notes: manualEntry.notes,
      });
      alert('Manual time entry created successfully');
      setManualEntry({
        workerId: '',
        jobId: '',
        date: new Date().toISOString().split('T')[0],
        clockIn: '08:00',
        clockOut: '17:00',
        breakMinutes: 30,
        notes: '',
      });
      setActiveTab('entries');
      loadData();
    } catch (err) {
      console.error('Failed to create manual entry:', err);
      alert(err.response?.data?.message || 'Failed to create entry. Please try again.');
    }
    setActionLoading(null);
  };

  const handleExport = async (format) => {
    setExportLoading(format);
    setExportMenuOpen(false);
    try {
      let response;
      let filename;
      let mimeType;

      if (format === 'excel') {
        response = await timeEntriesApi.exportExcel({ startDate: dateRange.start, endDate: dateRange.end });
        filename = `timesheet-${dateRange.start}-${dateRange.end}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (format === 'pdf') {
        response = await timeEntriesApi.exportPdf({ startDate: dateRange.start, endDate: dateRange.end });
        filename = `timesheet-${dateRange.start}-${dateRange.end}.pdf`;
        mimeType = 'application/pdf';
      } else if (format === 'csv') {
        response = await timeEntriesApi.exportCsv({ startDate: dateRange.start, endDate: dateRange.end });
        filename = `timesheet-${dateRange.start}-${dateRange.end}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'quickbooks') {
        response = await timeEntriesApi.exportQuickBooks({ startDate: dateRange.start, endDate: dateRange.end, format: 'csv' });
        filename = `quickbooks-timesheet-${dateRange.start}-${dateRange.end}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'adp') {
        response = await timeEntriesApi.exportAdp({ startDate: dateRange.start, endDate: dateRange.end });
        filename = `adp-timesheet-${dateRange.start}-${dateRange.end}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'gusto') {
        response = await timeEntriesApi.exportGusto({ startDate: dateRange.start, endDate: dateRange.end });
        filename = `gusto-timesheet-${dateRange.start}-${dateRange.end}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'paychex') {
        response = await timeEntriesApi.exportPaychex({ startDate: dateRange.start, endDate: dateRange.end });
        filename = `paychex-timesheet-${dateRange.start}-${dateRange.end}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
    setExportLoading(null);
  };

  const getApprovalBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-success">✓ Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">✗ Rejected</span>;
      case 'PENDING':
      default:
        return <span className="badge badge-warning">⏳ Pending</span>;
    }
  };

  const getOvertimeBadge = (entry) => {
  const otMins = entry.overtimeMinutes || 0;
  const dtMins = entry.doubleTimeMinutes || 0;
  
  if (otMins === 0 && dtMins === 0) return null;
  
  return (
    <>
      {otMins > 0 && <span className="badge badge-overtime">⚡ {(otMins / 60).toFixed(1)}h OT</span>}
      {dtMins > 0 && <span className="badge badge-doubletime">🔥 {(dtMins / 60).toFixed(1)}h DT</span>}
    </>
  );
};

  // Calculate stats for selected pay period
  const getPayPeriodStats = () => {
    if (!selectedPayPeriod) return null;
    
    const periodEntries = timeEntries;
    const pending = periodEntries.filter(e => e.approvalStatus === 'PENDING').length;
    const totalMinutes = periodEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    
    return {
      entries: periodEntries.length,
      pending,
      totalHours: formatDuration(totalMinutes),
      status: selectedPayPeriod.status,
    };
  };

  const payPeriodStats = getPayPeriodStats();

return (
  <div className="time-tracking-page">
    <div className="page-header">
      <div>
        <h1 className="page-title">Time Tracking</h1>
        <p className="page-subtitle">View, approve, and manage time entries</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-secondary" onClick={() => setActiveTab('manual')}>+ Manual Entry</button>
        <button 
          className="btn btn-secondary" 
          onClick={() => handleExport('excel')}
          disabled={exportLoading === 'excel'}
        >
          {exportLoading === 'excel' ? '...' : '📊'} Excel
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => handleExport('pdf')}
          disabled={exportLoading === 'pdf'}
        >
          {exportLoading === 'pdf' ? '...' : '📄'} PDF
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => handleExport('csv')}
          disabled={exportLoading === 'csv'}
        >
          {exportLoading === 'csv' ? '...' : '📋'} CSV
        </button>
        <div className="export-dropdown">
          <button 
            className="btn btn-primary"
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
          >
            Payroll Export ▾
          </button>
          {exportMenuOpen && (
            <div className="export-dropdown-menu">
              <button onClick={() => handleExport('quickbooks')} disabled={exportLoading === 'quickbooks'}>
                {exportLoading === 'quickbooks' ? '...' : '📗'} QuickBooks
              </button>
              <button onClick={() => handleExport('adp')} disabled={exportLoading === 'adp'}>
                {exportLoading === 'adp' ? '...' : '📘'} ADP
              </button>
              <button onClick={() => handleExport('gusto')} disabled={exportLoading === 'gusto'}>
                {exportLoading === 'gusto' ? '...' : '📙'} Gusto
              </button>
              <button onClick={() => handleExport('paychex')} disabled={exportLoading === 'paychex'}>
                {exportLoading === 'paychex' ? '...' : '📕'} Paychex
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Approval Stats Cards */}
      <div className="stats-row">
        <div className="stat-card stat-pending" onClick={() => { setActiveTab('approvals'); }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{approvalStats.pending}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="stat-card stat-approved">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{approvalStats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card stat-rejected">
          <div className="stat-icon">✗</div>
          <div className="stat-content">
            <div className="stat-value">{approvalStats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
        <div className="stat-card stat-hours">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <div className="stat-value">{Math.round(timeEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / 60)}h</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'entries' ? 'active' : ''}`} onClick={() => setActiveTab('entries')}>All Entries</button>
        <button className={`tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
          Pending Approvals {pendingApprovals.length > 0 && <span className="tab-badge">{pendingApprovals.length}</span>}
        </button>
        <button className={`tab ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>Manual Entry</button>
      </div>

      {activeTab === 'entries' && (
        <>
          {/* Pay Period Filter Bar */}
          <div className="pay-period-bar">
            <div className="pay-period-select-group">
              <label>Pay Period</label>
              <select 
                value={selectedPayPeriod?.id || ''} 
                onChange={(e) => handlePayPeriodChange(e.target.value)}
                className="form-select pay-period-select"
              >
                <option value="">Custom Date Range</option>
                {payPeriods.map((period, index) => (
                  <option key={period.id} value={period.id}>
                    {formatPayPeriodLabel(period, index)}
                  </option>
                ))}
              </select>
              <button 
                className="btn btn-ghost btn-icon"
                onClick={() => setSettingsModal({ open: true })}
                title="Pay Period Settings"
              >
                ⚙️
              </button>
              {selectedPayPeriod && (
                <span className="pay-period-date-display">
                  {formatPayPeriodDateRange(selectedPayPeriod)}
                </span>
              )}
            </div>
              
              {selectedPayPeriod && payPeriodStats && (
                <div className="pay-period-status">
                  <span className="pay-period-stat">{payPeriodStats.entries} entries</span>
                  <span className="pay-period-stat">{payPeriodStats.totalHours}</span>
                  {payPeriodStats.pending > 0 && (
                    <span className="pay-period-stat pay-period-pending">⚠️ {payPeriodStats.pending} pending</span>
                  )}
                  <span className={`pay-period-badge ${selectedPayPeriod.status.toLowerCase()}`}>
                    {selectedPayPeriod.status === 'LOCKED' ? '🔒 Locked' : 
                     selectedPayPeriod.status === 'EXPORTED' ? '📤 Exported' : '🔓 Open'}
                  </span>
                  
                  {selectedPayPeriod.status === 'OPEN' && (
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={handleLockPayPeriod}
                      disabled={payPeriodLoading || payPeriodStats.pending > 0}
                      title={payPeriodStats.pending > 0 ? 'Approve all entries before locking' : 'Lock pay period'}
                    >
                      {payPeriodLoading ? '...' : '🔒 Lock Period'}
                    </button>
                  )}
                  
                  {selectedPayPeriod.status === 'LOCKED' && (
                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={() => setUnlockModal({ open: true, reason: '' })}
                      disabled={payPeriodLoading}
                    >
                      {payPeriodLoading ? '...' : '🔓 Unlock'}
                    </button>
                  )}
                </div>
              )}
            </div>

          <div className="filters-bar">
            {!selectedPayPeriod && (
              <div className="filter-group">
                <label>Date Range</label>
                <div className="date-range">
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="form-input" />
                  <span>to</span>
                  <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="form-input" />
                </div>
              </div>
            )}
            <div className="filter-group">
              <label>Worker</label>
              <select value={filters.worker} onChange={(e) => setFilters(prev => ({ ...prev, worker: e.target.value }))} className="form-select">
                <option value="">All Workers</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Location</label>
              <select value={filters.job} onChange={(e) => setFilters(prev => ({ ...prev, job: e.target.value }))} className="form-select">
                <option value="">All Locations</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Approval</label>
              <select value={filters.approvalStatus} onChange={(e) => setFilters(prev => ({ ...prev, approvalStatus: e.target.value }))} className="form-select">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <button className="btn btn-ghost" onClick={() => setFilters({ worker: '', job: '', status: '', approvalStatus: '' })}>Clear</button>
          </div>
        </>
      )}

      {loading ? (
        <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
      ) : (
        <>
          {activeTab === 'entries' && (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Break</th>
                      <th>Total</th>
                      <th>Cost</th>
                      <th>Approval</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredEntries().length === 0 ? (
                      <tr><td colSpan="10"><div className="empty-state"><p>No time entries found</p></div></td></tr>
                    ) : (
                      getFilteredEntries().map(entry => (
                        <tr key={entry.id} className={entry.approvalStatus === 'REJECTED' ? 'row-rejected' : ''}>
                          <td><div className="worker-cell"><div className="avatar avatar-sm">{entry.user?.name?.split(' ').map(n => n[0]).join('') || '??'}</div><span>{entry.user?.name || 'Unknown'}</span></div></td>
                          <td>{entry.job?.name || 'Unassigned'}</td>
                          <td>{formatDate(entry.clockInTime)}</td>
                          <td>{formatTime(entry.clockInTime)}</td>
                          <td>{entry.clockOutTime ? formatTime(entry.clockOutTime) : <span className="badge badge-success">Active</span>}</td>
                          <td>{entry.breakMinutes || 0}m</td>
                          <td>
                            <div className="duration-cell">
                              {formatDuration(entry.durationMinutes)}
                              {getOvertimeBadge(entry)}
                            </div>
                          </td>
                          <td className="cost-cell">{formatCurrency(entry.laborCost)}</td>
                          <td>{getApprovalBadge(entry.approvalStatus)}</td>
                          <td>
                            <div className="action-buttons">
                              {entry.approvalStatus === 'PENDING' && entry.clockOutTime && (
                                <>
                                  <button 
                                    className="btn btn-success btn-sm" 
                                    onClick={() => handleApprove(entry.id)}
                                    disabled={actionLoading === entry.id}
                                  >
                                    {actionLoading === entry.id ? '...' : '✓'}
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => setRejectModal({ open: true, entryId: entry.id, reason: '' })}
                                    disabled={actionLoading === entry.id}
                                  >
                                    ✗
                                  </button>
                                </>
                              )}
                              <button className="btn btn-ghost btn-sm" onClick={() => setViewModal({ open: true, entry })}>View</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <>
              {pendingApprovals.length > 0 && (
                <div className="bulk-actions-bar">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedEntries.length === pendingApprovals.length && pendingApprovals.length > 0}
                      onChange={toggleSelectAll}
                    />
                    Select All ({selectedEntries.length} selected)
                  </label>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleBulkApprove}
                    disabled={selectedEntries.length === 0 || actionLoading === 'bulk'}
                  >
                    {actionLoading === 'bulk' ? 'Approving...' : `Approve Selected (${selectedEntries.length})`}
                  </button>
                </div>
              )}
              
              <div className="approvals-grid">
                {pendingApprovals.length === 0 ? (
                  <div className="card"><div className="empty-state"><span className="empty-icon">✓</span><p>All caught up! No pending approvals.</p></div></div>
                ) : (
                  pendingApprovals.map(entry => (
                    <div key={entry.id} className={`card approval-card ${selectedEntries.includes(entry.id) ? 'selected' : ''}`}>
                      <div className="approval-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedEntries.includes(entry.id)}
                          onChange={() => toggleSelectEntry(entry.id)}
                        />
                      </div>
                      <div className="approval-header">
                        <div className="avatar">{entry.user?.name?.split(' ').map(n => n[0]).join('')}</div>
                        <div><div className="approval-name">{entry.user?.name}</div><div className="approval-job">{entry.job?.name || 'Unassigned'}</div></div>
                        {entry.isFlagged && <span className="badge badge-warning">⚠️ Flagged</span>}
                      </div>
                      <div className="approval-details">
                        <div><span>Date</span><strong>{formatDate(entry.clockInTime)}</strong></div>
                        <div><span>In</span><strong>{formatTime(entry.clockInTime)}</strong></div>
                        <div><span>Out</span><strong>{formatTime(entry.clockOutTime)}</strong></div>
                        <div><span>Total</span><strong>{formatDuration(entry.durationMinutes)}</strong></div>
                      </div>
                      {(entry.laborCost || entry.overtimeMinutes > 0 || entry.doubleTimeMinutes > 0) && (
                        <div className="approval-cost-row">
                          <div className="cost-breakdown">
                            {entry.regularMinutes > 0 && <span className="cost-item regular">{(entry.regularMinutes / 60).toFixed(1)}h reg</span>}
                            {entry.overtimeMinutes > 0 && <span className="cost-item overtime">{(entry.overtimeMinutes / 60).toFixed(1)}h OT</span>}
                            {entry.doubleTimeMinutes > 0 && <span className="cost-item doubletime">{(entry.doubleTimeMinutes / 60).toFixed(1)}h DT</span>}
                          </div>
                          <div className="cost-total">{formatCurrency(entry.laborCost)}</div>
                        </div>
                      )}
                      {entry.isFlagged && entry.flagReason && (
                        <div className="flag-reason">
                          <span>⚠️ {entry.flagReason}</span>
                        </div>
                      )}
                      <div className="approval-actions">
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setRejectModal({ open: true, entryId: entry.id, reason: '' })}
                          disabled={actionLoading === entry.id}
                        >
                          Reject
                        </button>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleApprove(entry.id)}
                          disabled={actionLoading === entry.id}
                        >
                          {actionLoading === entry.id ? 'Approving...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'manual' && (
            <div className="card">
              <div className="card-header"><h3 className="card-title">Add Manual Time Entry</h3></div>
              <form onSubmit={handleManualSubmit} className="manual-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Worker *</label>
                    <select value={manualEntry.workerId} onChange={(e) => setManualEntry(prev => ({ ...prev, workerId: e.target.value }))} className="form-select" required>
                      <option value="">Select...</option>
                      {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <select value={manualEntry.jobId} onChange={(e) => setManualEntry(prev => ({ ...prev, jobId: e.target.value }))} className="form-select">
                      <option value="">Select...</option>
                      {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Date *</label><input type="date" value={manualEntry.date} onChange={(e) => setManualEntry(prev => ({ ...prev, date: e.target.value }))} className="form-input" required /></div>
                  <div className="form-group"><label className="form-label">Clock In *</label><input type="time" value={manualEntry.clockIn} onChange={(e) => setManualEntry(prev => ({ ...prev, clockIn: e.target.value }))} className="form-input" required /></div>
                  <div className="form-group"><label className="form-label">Clock Out *</label><input type="time" value={manualEntry.clockOut} onChange={(e) => setManualEntry(prev => ({ ...prev, clockOut: e.target.value }))} className="form-input" required /></div>
                  <div className="form-group"><label className="form-label">Break (min)</label><input type="number" value={manualEntry.breakMinutes} onChange={(e) => setManualEntry(prev => ({ ...prev, breakMinutes: e.target.value }))} className="form-input" /></div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea value={manualEntry.notes} onChange={(e) => setManualEntry(prev => ({ ...prev, notes: e.target.value }))} className="form-textarea" rows="3"></textarea></div>
                <div className="form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('entries')}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading === 'manual'}>
                    {actionLoading === 'manual' ? 'Creating...' : 'Create Entry'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Rejection Modal */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ open: false, entryId: null, reason: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Time Entry</h3>
              <button className="modal-close" onClick={() => setRejectModal({ open: false, entryId: null, reason: '' })}>×</button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for rejecting this time entry. The worker will be notified.</p>
              <div className="form-group">
                <label className="form-label">Rejection Reason</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  placeholder="e.g., Hours don't match schedule, Missing clock-out photo..."
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setRejectModal({ open: false, entryId: null, reason: '' })}>Cancel</button>
              <button 
                className="btn btn-danger" 
                onClick={handleReject}
                disabled={actionLoading === rejectModal.entryId}
              >
                {actionLoading === rejectModal.entryId ? 'Rejecting...' : 'Reject Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {unlockModal.open && (
        <div className="modal-overlay" onClick={() => setUnlockModal({ open: false, reason: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Unlock Pay Period</h3>
              <button className="modal-close" onClick={() => setUnlockModal({ open: false, reason: '' })}>×</button>
            </div>
            <div className="modal-body">
              <p>Unlocking a pay period allows editing of time entries. This action is logged for audit purposes.</p>
              <div className="form-group">
                <label className="form-label">Reason for Unlocking *</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  placeholder="e.g., Need to correct missed punch for John Smith..."
                  value={unlockModal.reason}
                  onChange={(e) => setUnlockModal(prev => ({ ...prev, reason: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setUnlockModal({ open: false, reason: '' })}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleUnlockPayPeriod}
                disabled={payPeriodLoading || unlockModal.reason.trim().length < 10}
              >
                {payPeriodLoading ? 'Unlocking...' : 'Unlock Period'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal.open && viewModal.entry && (
        <div className="modal-overlay" onClick={() => setViewModal({ open: false, entry: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Time Entry Details</h3>
              <button className="modal-close" onClick={() => setViewModal({ open: false, entry: null })}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><span>Worker</span><strong>{viewModal.entry.user?.name || 'Unknown'}</strong></div>
                <div className="detail-item"><span>Location</span><strong>{viewModal.entry.job?.name || 'Unassigned'}</strong></div>
                <div className="detail-item"><span>Date</span><strong>{formatDate(viewModal.entry.clockInTime)}</strong></div>
                <div className="detail-item"><span>Clock In</span><strong>{formatTime(viewModal.entry.clockInTime)}</strong></div>
                <div className="detail-item"><span>Clock Out</span><strong>{viewModal.entry.clockOutTime ? formatTime(viewModal.entry.clockOutTime) : 'Active'}</strong></div>
                <div className="detail-item"><span>Break</span><strong>{viewModal.entry.breakMinutes || 0} min</strong></div>
                <div className="detail-item"><span>Total Duration</span><strong>{formatDuration(viewModal.entry.durationMinutes)}</strong></div>
                <div className="detail-item"><span>Status</span><strong>{viewModal.entry.approvalStatus}</strong></div>
                {viewModal.entry.regularMinutes > 0 && <div className="detail-item"><span>Regular Hours</span><strong>{(viewModal.entry.regularMinutes / 60).toFixed(2)}h</strong></div>}
                {viewModal.entry.overtimeMinutes > 0 && <div className="detail-item"><span>Overtime (1.5x)</span><strong>{(viewModal.entry.overtimeMinutes / 60).toFixed(2)}h</strong></div>}
                {viewModal.entry.doubleTimeMinutes > 0 && <div className="detail-item"><span>Double Time (2x)</span><strong>{(viewModal.entry.doubleTimeMinutes / 60).toFixed(2)}h</strong></div>}
                {viewModal.entry.effectiveRate && <div className="detail-item"><span>Rate</span><strong>${Number(viewModal.entry.effectiveRate).toFixed(2)}/hr</strong></div>}
                {viewModal.entry.laborCost && <div className="detail-item"><span>Total Cost</span><strong className="cost-highlight">${Number(viewModal.entry.laborCost).toFixed(2)}</strong></div>}
                {viewModal.entry.rejectionReason && <div className="detail-item full-width"><span>Rejection Reason</span><strong className="rejection-text">{viewModal.entry.rejectionReason}</strong></div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewModal({ open: false, entry: null })}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Period Settings Modal */}
      {settingsModal.open && (
        <div className="modal-overlay" onClick={() => setSettingsModal({ open: false })}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pay Period Settings</h3>
              <button className="modal-close" onClick={() => setSettingsModal({ open: false })}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Pay Period Type</label>
                <select 
                  className="form-select"
                  value={payPeriodSettings.payPeriodType}
                  onChange={(e) => setPayPeriodSettings(prev => ({ ...prev, payPeriodType: e.target.value }))}
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly (Every 2 weeks)</option>
                  <option value="SEMIMONTHLY">Semi-monthly (1st & 16th)</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              {(payPeriodSettings.payPeriodType === 'WEEKLY' || payPeriodSettings.payPeriodType === 'BIWEEKLY') && (
                <div className="form-group">
                  <label className="form-label">Start Day</label>
                  <select 
                    className="form-select"
                    value={payPeriodSettings.payPeriodStartDay}
                    onChange={(e) => setPayPeriodSettings(prev => ({ ...prev, payPeriodStartDay: e.target.value }))}
                  >
                    {getStartDayOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {(payPeriodSettings.payPeriodType === 'SEMIMONTHLY' || payPeriodSettings.payPeriodType === 'MONTHLY') && (
                <div className="form-group">
                  <label className="form-label">
                    {payPeriodSettings.payPeriodType === 'SEMIMONTHLY' ? 'First Period Starts On Day' : 'Period Starts On Day'}
                  </label>
                  <select 
                    className="form-select"
                    value={payPeriodSettings.payPeriodStartDay}
                    onChange={(e) => setPayPeriodSettings(prev => ({ ...prev, payPeriodStartDay: e.target.value }))}
                  >
                    {getStartDayOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {(payPeriodSettings.payPeriodType === 'BIWEEKLY' || payPeriodSettings.payPeriodType === 'CUSTOM') && (
                <div className="form-group">
                  <label className="form-label">Anchor Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={payPeriodSettings.payPeriodAnchorDate}
                    onChange={(e) => setPayPeriodSettings(prev => ({ ...prev, payPeriodAnchorDate: e.target.value }))}
                  />
                  <p className="form-hint">The date a pay period starts or started. Used to calculate all other periods.</p>
                </div>
              )}

              {payPeriodSettings.payPeriodType === 'CUSTOM' && (
                <div className="form-group">
                  <label className="form-label">Period Length (days)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    min="1"
                    max="31"
                    value={payPeriodSettings.customPayPeriodDays}
                    onChange={(e) => setPayPeriodSettings(prev => ({ ...prev, customPayPeriodDays: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSettingsModal({ open: false })}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveSettings}
                disabled={settingsLoading}
              >
                {settingsLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeTrackingPage;