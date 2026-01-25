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
    restBreaksTaken: 0,
    workerType: '',
    notes: '',
  });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [archivedEntries, setArchivedEntries] = useState([]);

  const [rejectModal, setRejectModal] = useState({ open: false, entryId: null, reason: '' });
  const [viewModal, setViewModal] = useState({ open: false, entry: null });
  const [editModal, setEditModal] = useState({ 
    open: false, 
    entry: null,
    clockInDate: '',
    clockInTime: '',
    clockOutDate: '',
    clockOutTime: '',
    breakMinutes: 0,
    restBreaksTaken: 0,
    jobId: '',
    notes: ''
  });
  const [archiveModal, setArchiveModal] = useState({ open: false, entry: null, reason: '' });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [unlockModal, setUnlockModal] = useState({ open: false, reason: '' });
  const [deletePayPeriodModal, setDeletePayPeriodModal] = useState({ open: false, period: null });
  const [settingsModal, setSettingsModal] = useState({ open: false });
  const [manualEntryModal, setManualEntryModal] = useState({ open: false });
  
  // Copy Entry Modal state
  const [copyModal, setCopyModal] = useState({ 
    open: false, 
    entry: null,
    copyMode: 'single', // 'single', 'multiple', 'weekdays'
    targetDate: '',
    targetDates: [],
    targetPayPeriod: '',
    copyToNextWeek: false,
    weekdaysOnly: false,
    numberOfWeeks: 1,
  });
  const [copyLoading, setCopyLoading] = useState(false);

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
      
      const currentPeriod = periods.find(p => p.status === 'OPEN');
      if (currentPeriod) {
        setSelectedPayPeriod(currentPeriod);
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
      await loadPayPeriods();
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
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return `Pay Period ${payPeriods.length - index}`;
  };

const handleDeletePayPeriod = async () => {
    if (!deletePayPeriodModal.period) return;

    setPayPeriodLoading(true);
    try {
      await payPeriodsApi.delete(deletePayPeriodModal.period.id);
      setDeletePayPeriodModal({ open: false, period: null });
      setSelectedPayPeriod(null);
      await loadPayPeriods();
    } catch (err) {
      console.error('Failed to delete pay period:', err);
      alert(err.response?.data?.message || 'Failed to delete pay period.');
    }
    setPayPeriodLoading(false);
  };

  const formatPayPeriodDateRange = (period) => {
    if (!period) return '';
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
  };

  const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatShortId = (id) => {
    if (!id) return '--';
    return id.slice(-6).toUpperCase();
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
      if (entry.isArchived) return false;
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

  const getPacificOffset = () => {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const isDST = now.getTimezoneOffset() < stdOffset;
    return isDST ? '-07:00' : '-08:00';
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    const tzOffset = getPacificOffset();
    const clockIn = new Date(`${manualEntry.date}T${manualEntry.clockIn}:00${tzOffset}`);
    let clockOut = new Date(`${manualEntry.date}T${manualEntry.clockOut}:00${tzOffset}`);

    if (clockOut <= clockIn) {
      clockOut = new Date(clockOut.getTime() + 24 * 60 * 60 * 1000);
    }

    const diffHours = (clockOut - clockIn) / (1000 * 60 * 60);

    if (diffHours > 24) {
      alert('Time entry cannot exceed 24 hours');
      return;
    }

    if (diffHours <= 0) {
      alert('Clock out must be after clock in');
      return;
    }

    setActionLoading('manual');
    try {
      await timeEntriesApi.createManual({
        userId: manualEntry.workerId,
        jobId: manualEntry.jobId || undefined,
        date: manualEntry.date,
        clockIn: manualEntry.clockIn,
        clockOut: manualEntry.clockOut,
        breakMinutes: parseInt(manualEntry.breakMinutes) || 0,
        restBreaksTaken: parseInt(manualEntry.restBreaksTaken) || 0,
        workerType: manualEntry.workerType || undefined,
        notes: manualEntry.notes,
        timezone: 'America/Los_Angeles',
      });
      alert('Manual time entry created successfully');
      setManualEntry({
        workerId: '',
        jobId: '',
        date: new Date().toISOString().split('T')[0],
        clockIn: '08:00',
        clockOut: '17:00',
        breakMinutes: 30,
        restBreaksTaken: 0,
        workerType: '',
        notes: '',
      });
      setShowManualEntry(false);
      loadData();
    } catch (err) {
      console.error('Failed to create manual entry:', err);
      alert(err.response?.data?.message || 'Failed to create entry. Please try again.');
    }
    setActionLoading(null);
  };

  // Copy Entry Functions
  const openCopyModal = (entry) => {
    const entryDate = new Date(entry.clockInTime);
    const nextDay = new Date(entryDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    setCopyModal({
      open: true,
      entry,
      copyMode: 'single',
      targetDate: nextDay.toISOString().split('T')[0],
      targetDates: [],
      targetPayPeriod: '',
      copyToNextWeek: false,
      weekdaysOnly: true,
      numberOfWeeks: 1,
    });
  };

  const getWeekdaysBetween = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        dates.push(new Date(current).toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleCopyEntry = async () => {
    if (!copyModal.entry) return;
    
    setCopyLoading(true);
    
    try {
      const entry = copyModal.entry;
      const clockInTime = new Date(entry.clockInTime);
      const clockOutTime = entry.clockOutTime ? new Date(entry.clockOutTime) : null;
      
      // Get time parts from original entry
      const clockInHours = clockInTime.getHours().toString().padStart(2, '0');
      const clockInMins = clockInTime.getMinutes().toString().padStart(2, '0');
      const clockOutHours = clockOutTime ? clockOutTime.getHours().toString().padStart(2, '0') : '17';
      const clockOutMins = clockOutTime ? clockOutTime.getMinutes().toString().padStart(2, '0') : '00';
      
      let datesToCopy = [];
      
      if (copyModal.copyMode === 'single') {
        datesToCopy = [copyModal.targetDate];
      } else if (copyModal.copyMode === 'multiple') {
        datesToCopy = copyModal.targetDates;
      } else if (copyModal.copyMode === 'weekdays') {
        // Copy to weekdays for specified number of weeks
        const originalDate = new Date(entry.clockInTime);
        for (let week = 1; week <= copyModal.numberOfWeeks; week++) {
          const weekStart = new Date(originalDate);
          weekStart.setDate(weekStart.getDate() + (week * 7) - weekStart.getDay() + 1); // Next Monday
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 4); // Friday
          
          const weekdayDates = getWeekdaysBetween(weekStart, weekEnd);
          datesToCopy = [...datesToCopy, ...weekdayDates];
        }
      }
      
      // Create entries for each date
      let successCount = 0;
      for (const targetDate of datesToCopy) {
        try {
          await timeEntriesApi.createManual({
            userId: entry.userId,
            jobId: entry.jobId || undefined,
            date: targetDate,
            clockIn: `${clockInHours}:${clockInMins}`,
            clockOut: `${clockOutHours}:${clockOutMins}`,
            breakMinutes: entry.breakMinutes || 0,
            notes: `Copied from ${formatDate(entry.clockInTime)}`,
            timezone: 'America/Los_Angeles',
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to copy entry to ${targetDate}:`, err);
        }
      }
      
      alert(`Successfully copied entry to ${successCount} day${successCount !== 1 ? 's' : ''}`);
      setCopyModal({ open: false, entry: null, copyMode: 'single', targetDate: '', targetDates: [], targetPayPeriod: '', copyToNextWeek: false, weekdaysOnly: true, numberOfWeeks: 1 });
      loadData();
    } catch (err) {
      console.error('Failed to copy entry:', err);
      alert('Failed to copy entry. Please try again.');
    }
    
    setCopyLoading(false);
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

  const openEditModal = (entry) => {
    const clockIn = new Date(entry.clockInTime);
    const clockOut = entry.clockOutTime ? new Date(entry.clockOutTime) : null;
    
    setEditModal({
      open: true,
      entry,
      clockInDate: clockIn.toISOString().split('T')[0],
      clockInTime: clockIn.toTimeString().slice(0, 5),
      clockOutDate: clockOut ? clockOut.toISOString().split('T')[0] : '',
      clockOutTime: clockOut ? clockOut.toTimeString().slice(0, 5) : '',
      breakMinutes: entry.breakMinutes || 0,
      restBreaksTaken: entry.restBreaksTaken || 0,
      jobId: entry.jobId || '',
      notes: entry.notes || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    setActionLoading(editModal.entry.id);
    try {
      const tzOffset = getPacificOffset();
      
      const updateData = {
        clockInTime: new Date(`${editModal.clockInDate}T${editModal.clockInTime}:00${tzOffset}`).toISOString(),
        breakMinutes: parseInt(editModal.breakMinutes) || 0,
        restBreaksTaken: parseInt(editModal.restBreaksTaken) || 0,
        jobId: editModal.jobId || null,
        notes: editModal.notes,
      };
      
      if (editModal.clockOutDate && editModal.clockOutTime) {
        updateData.clockOutTime = new Date(`${editModal.clockOutDate}T${editModal.clockOutTime}:00${tzOffset}`).toISOString();
      }
      
      await timeEntriesApi.update(editModal.entry.id, updateData);
      
      setEditModal({ open: false, entry: null, clockInDate: '', clockInTime: '', clockOutDate: '', clockOutTime: '', breakMinutes: 0, restBreaksTaken: 0, jobId: '', notes: '' });
      loadData();
    } catch (err) {
      console.error('Failed to update entry:', err);
      alert(err.response?.data?.message || 'Failed to update entry. Please try again.');
    }
    setActionLoading(null);
  };

  const handleArchive = async () => {
    if (!archiveModal.entry) return;
    
    setActionLoading(archiveModal.entry.id);
    try {
      await timeEntriesApi.archive(archiveModal.entry.id, archiveModal.reason);
      setArchiveModal({ open: false, entry: null, reason: '' });
      loadData();
    } catch (err) {
      console.error('Failed to archive entry:', err);
      alert(err.response?.data?.message || 'Failed to archive entry. Please try again.');
    }
    setActionLoading(null);
  };

  const loadArchivedEntries = async () => {
    try {
      const res = await timeEntriesApi.getArchived({ startDate: dateRange.start, endDate: dateRange.end });
      setArchivedEntries(res.data || []);
    } catch (err) {
      console.error('Failed to load archived entries:', err);
      setArchivedEntries([]);
    }
  };

  const handleRestore = async (entryId) => {
    setActionLoading(entryId);
    try {
      await timeEntriesApi.restore(entryId);
      setArchivedEntries(prev => prev.filter(e => e.id !== entryId));
      loadData();
    } catch (err) {
      console.error('Failed to restore entry:', err);
      alert(err.response?.data?.message || 'Failed to restore entry. Please try again.');
    }
    setActionLoading(null);
  };

  // Get selected worker's types for the worker type dropdown
  const getSelectedWorkerTypes = () => {
    if (!manualEntry.workerId) return [];
    const worker = workers.find(w => w.id === manualEntry.workerId);
    return worker?.workerTypes || ['HOURLY'];
  };

  // Manual Entry Form Component
  const ManualEntryForm = ({ inModal = false }) => {
    const workerTypes = getSelectedWorkerTypes();
    const showWorkerTypeSelector = workerTypes.length > 1;
    
    return (
    <form onSubmit={handleManualSubmit} className="manual-form">
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Worker *</label>
          <select value={manualEntry.workerId} onChange={(e) => setManualEntry(prev => ({ ...prev, workerId: e.target.value, workerType: '' }))} className="form-select" required>
            <option value="">Select...</option>
            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        {showWorkerTypeSelector && (
          <div className="form-group">
            <label className="form-label">Worker Type *</label>
            <select value={manualEntry.workerType} onChange={(e) => setManualEntry(prev => ({ ...prev, workerType: e.target.value }))} className="form-select" required>
              <option value="">Select role...</option>
              {workerTypes.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        )}
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
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Meal Break (min)</label><input type="number" value={manualEntry.breakMinutes} onChange={(e) => setManualEntry(prev => ({ ...prev, breakMinutes: e.target.value }))} className="form-input" min="0" /></div>
        <div className="form-group">
          <label className="form-label">Rest Breaks</label>
          <select value={manualEntry.restBreaksTaken} onChange={(e) => setManualEntry(prev => ({ ...prev, restBreaksTaken: parseInt(e.target.value) }))} className="form-select">
            <option value={0}>0 rest breaks</option>
            <option value={1}>1 rest break (10 min)</option>
            <option value={2}>2 rest breaks (20 min)</option>
            <option value={3}>3 rest breaks (30 min)</option>
          </select>
        </div>
      </div>
      <div className="form-hint" style={{ marginBottom: '16px', color: '#666', fontSize: '0.85rem' }}>
        ⏰ Times are in Pacific Time (PT)
      </div>
      <div className="form-group"><label className="form-label">Notes</label><textarea value={manualEntry.notes} onChange={(e) => setManualEntry(prev => ({ ...prev, notes: e.target.value }))} className="form-textarea" rows="3"></textarea></div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setManualEntryModal({ open: false })}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={actionLoading === 'manual'}>
          {actionLoading === 'manual' ? 'Creating...' : 'Create Entry'}
        </button>
      </div>
    </form>
  );
  };

  return (
    <div className="time-tracking-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Time Tracking</h1>
          <p className="page-subtitle">View, approve, and manage time entries</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => handleExport('excel')} disabled={exportLoading === 'excel'}>
            {exportLoading === 'excel' ? '...' : '📊'} Excel
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('pdf')} disabled={exportLoading === 'pdf'}>
            {exportLoading === 'pdf' ? '...' : '📄'} PDF
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('csv')} disabled={exportLoading === 'csv'}>
            {exportLoading === 'csv' ? '...' : '📋'} CSV
          </button>
          <div className="export-dropdown">
            <button className="btn btn-primary" onClick={() => setExportMenuOpen(!exportMenuOpen)}>
              Payroll Export ▾
            </button>
            {exportMenuOpen && (
              <div className="export-dropdown-menu">
                <button onClick={() => handleExport('quickbooks')} disabled={exportLoading === 'quickbooks'}>
                  QuickBooks
                </button>
                <button onClick={() => handleExport('adp')} disabled={exportLoading === 'adp'}>
                  ADP
                </button>
                <button onClick={() => handleExport('gusto')} disabled={exportLoading === 'gusto'}>
                  Gusto
                </button>
                <button onClick={() => handleExport('paychex')} disabled={exportLoading === 'paychex'}>
                  Paychex
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Stats Cards */}
      <div className="stats-row">
        <div className="stat-card stat-pending" onClick={() => setActiveTab('approvals')}>
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

      {/* Tabs - Manual Entry tab REMOVED */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'entries' ? 'active' : ''}`} onClick={() => setActiveTab('entries')}>All Entries</button>
        <button className={`tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
          Pending Approvals {pendingApprovals.length > 0 && <span className="tab-badge">{pendingApprovals.length}</span>}
        </button>
        <button className={`tab ${activeTab === 'archived' ? 'active' : ''}`} onClick={() => { setActiveTab('archived'); loadArchivedEntries(); }}>
          Archived
        </button>
      </div>

      {activeTab === 'entries' && (
        <>
          {/* Pay Period Filter Bar */}
          <div className="pay-period-bar">
            <div className="pay-period-left">
              <div className="pay-period-selector">
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
                  className="pay-period-settings-btn"
                  onClick={() => setSettingsModal({ open: true })}
                  title="Pay Period Settings"
                >
                  <SettingsIcon />
                </button>
              </div>
              {selectedPayPeriod && (
                <div className="pay-period-date-display">
                  {formatPayPeriodDateRange(selectedPayPeriod)}
                </div>
              )}
            </div>
              
            {selectedPayPeriod && payPeriodStats && (
              <div className="pay-period-right">
                <div className="pay-period-stats-group">
                  <div className="pay-period-stat-item">
                    <span className="stat-value">{payPeriodStats.entries}</span>
                    <span className="stat-label">Entries</span>
                  </div>
                  <div className="pay-period-stat-item">
                    <span className="stat-value">{payPeriodStats.totalHours}</span>
                    <span className="stat-label">Hours</span>
                  </div>
                  {payPeriodStats.pending > 0 && (
                    <div className="pay-period-stat-item pending">
                      <span className="stat-value">{payPeriodStats.pending}</span>
                      <span className="stat-label">Pending</span>
                    </div>
                  )}
                </div>
                <div className="pay-period-actions">
                  <span className={`pay-period-badge ${selectedPayPeriod.status.toLowerCase()}`}>
                    {selectedPayPeriod.status === 'LOCKED' ? 'Locked' : 
                     selectedPayPeriod.status === 'EXPORTED' ? 'Exported' : 'Open'}
                  </span>
                  {selectedPayPeriod.status === 'OPEN' && (
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={handleLockPayPeriod}
                      disabled={payPeriodLoading || payPeriodStats.pending > 0}
                      title={payPeriodStats.pending > 0 ? 'Approve all entries before locking' : 'Lock pay period'}
                    >
                      {payPeriodLoading ? '...' : 'Lock Period'}
                    </button>
                  )}
                  {selectedPayPeriod.status === 'LOCKED' && (
                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={() => setUnlockModal({ open: true, reason: '' })}
                      disabled={payPeriodLoading}
                    >
                      {payPeriodLoading ? '...' : 'Unlock'}
                    </button>
                  )}
                  {selectedPayPeriod.status === 'OPEN' && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeletePayPeriodModal({ open: true, period: selectedPayPeriod })}
                      disabled={payPeriodLoading}
                      title="Delete pay period"
                      style={{ marginLeft: '8px', background: '#dc3545', color: 'white' }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
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
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={() => setShowManualEntry(!showManualEntry)}>
                {showManualEntry ? '− Hide' : '+ Add Entry'}
              </button>
            </div>
          </div>

          {/* Inline Manual Entry Form */}
          {showManualEntry && (
            <div className="manual-entry-inline" style={{ 
              background: '#FFFFFF', 
              border: '2px solid #C9A227', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '16px' 
            }}>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Worker *</label>
                    <select 
                      value={manualEntry.workerId} 
                      onChange={(e) => setManualEntry(prev => ({ ...prev, workerId: e.target.value }))} 
                      className="form-select" 
                      required
                    >
                      <option value="">Select...</option>
                      {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <select 
                      value={manualEntry.jobId} 
                      onChange={(e) => setManualEntry(prev => ({ ...prev, jobId: e.target.value }))} 
                      className="form-select"
                    >
                      <option value="">Select...</option>
                      {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input 
                      type="date" 
                      value={manualEntry.date} 
                      onChange={(e) => setManualEntry(prev => ({ ...prev, date: e.target.value }))} 
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clock In *</label>
                    <input 
                      type="time" 
                      value={manualEntry.clockIn} 
                      onChange={(e) => setManualEntry(prev => ({ ...prev, clockIn: e.target.value }))} 
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clock Out *</label>
                    <input 
                      type="time" 
                      value={manualEntry.clockOut} 
                      onChange={(e) => setManualEntry(prev => ({ ...prev, clockOut: e.target.value }))} 
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meal Break</label>
                    <input 
                      type="number" 
                      value={manualEntry.breakMinutes} 
                      onChange={(e) => setManualEntry(prev => ({ ...prev, breakMinutes: e.target.value }))} 
                      className="form-input"
                      min="0"
                      max="120"
                      placeholder="min"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rest Breaks</label>
                    <select
                      value={manualEntry.restBreaksTaken}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, restBreaksTaken: parseInt(e.target.value) }))}
                      className="form-select"
                    >
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <input 
                      type="text" 
                      value={manualEntry.notes} 
                      onChange={(e) => setManualEntry(prev => ({ ...prev, notes: e.target.value }))} 
                      className="form-input"
                      placeholder="Notes (optional)"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading === 'manual'}>
                    {actionLoading === 'manual' ? 'Creating...' : 'Create Entry'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowManualEntry(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
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
                        <tr key={entry.id} className={`${entry.approvalStatus === 'REJECTED' ? 'row-rejected' : ''} ${entry.amendedAfterExport ? 'row-amended' : ''}`}>
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
                          <td>
                            {getApprovalBadge(entry.approvalStatus)}
                            {entry.amendedAfterExport && <span className="badge badge-warning amended-badge">Amended</span>}
                          </td>
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
                              <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(entry)} disabled={entry.isLocked}>Edit</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setViewModal({ open: true, entry })}>View</button>
                              <button 
                                className="btn btn-ghost btn-sm btn-copy" 
                                onClick={() => openCopyModal(entry)}
                                title="Copy entry to other days"
                              >
                                📋
                              </button>
                              <button 
                                className="btn btn-ghost btn-sm btn-archive" 
                                onClick={() => setArchiveModal({ open: true, entry, reason: '' })}
                                disabled={entry.isLocked}
                                title="Archive entry"
                              >
                                🗃️
                              </button>
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
                          <strong>⚠️ Flag:</strong> {entry.flagReason}
                        </div>
                      )}
                      <div className="approval-actions">
                        <button className="btn btn-success" onClick={() => handleApprove(entry.id)} disabled={actionLoading === entry.id}>
                          {actionLoading === entry.id ? '...' : '✓ Approve'}
                        </button>
                        <button className="btn btn-danger" onClick={() => setRejectModal({ open: true, entryId: entry.id, reason: '' })} disabled={actionLoading === entry.id}>
                          ✗ Reject
                        </button>
                        <button className="btn btn-ghost" onClick={() => setViewModal({ open: true, entry })}>View</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'archived' && (
            <div className="card">
              <div className="card-header" style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Archived Entries</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                  These entries have been archived and are excluded from reports and calculations.
                </p>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Duration</th>
                      <th>Location</th>
                      <th>Archived</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedEntries.length === 0 ? (
                      <tr><td colSpan="8" className="empty-cell">
                        <div className="empty-state">
                          <span className="empty-icon">📁</span>
                          <p>No archived entries found.</p>
                        </div>
                      </td></tr>
                    ) : (
                      archivedEntries.map(entry => (
                        <tr key={entry.id} className="archived-row">
                          <td>
                            <div className="worker-cell">
                              <div className="avatar avatar-sm">{entry.user?.name?.split(' ').map(n => n[0]).join('')}</div>
                              <span>{entry.user?.name}</span>
                            </div>
                          </td>
                          <td>{formatDate(entry.clockInTime)}</td>
                          <td>{formatTime(entry.clockInTime)} - {entry.clockOutTime ? formatTime(entry.clockOutTime) : 'Active'}</td>
                          <td>{formatDuration(entry.durationMinutes)}</td>
                          <td>{entry.job?.name || 'Unassigned'}</td>
                          <td>{entry.archivedAt ? formatDate(entry.archivedAt) : '--'}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.archiveReason || '--'}
                          </td>
                          <td>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleRestore(entry.id)}
                              disabled={actionLoading === entry.id}
                            >
                              {actionLoading === entry.id ? '...' : '↩ Restore'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ open: false, entryId: null, reason: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Time Entry</h3>
              <button className="modal-close" onClick={() => setRejectModal({ open: false, entryId: null, reason: '' })}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason for Rejection *</label>
                <textarea 
                  className="form-textarea"
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why this entry is being rejected..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setRejectModal({ open: false, entryId: null, reason: '' })}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading === rejectModal.entryId}>
                {actionLoading === rejectModal.entryId ? 'Rejecting...' : 'Reject Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal.open && viewModal.entry && (
        <div className="modal-overlay" onClick={() => setViewModal({ open: false, entry: null })}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Time Entry Details</h3>
              <button className="modal-close" onClick={() => setViewModal({ open: false, entry: null })}>×</button>
            </div>
            <div className="modal-body">
              <div className="entry-detail-grid">
                <div className="detail-section">
                  <h4>Entry Information</h4>
                  <div className="detail-row"><span>Entry ID</span><strong>{formatShortId(viewModal.entry.id)}</strong></div>
                  <div className="detail-row"><span>Worker</span><strong>{viewModal.entry.user?.name || 'Unknown'}</strong></div>
                  <div className="detail-row"><span>Location</span><strong>{viewModal.entry.job?.name || 'Unassigned'}</strong></div>
                  <div className="detail-row"><span>Status</span>{getApprovalBadge(viewModal.entry.approvalStatus)}</div>
                </div>
                <div className="detail-section">
                  <h4>Time Details</h4>
                  <div className="detail-row"><span>Date</span><strong>{formatDate(viewModal.entry.clockInTime)}</strong></div>
                  <div className="detail-row"><span>Clock In</span><strong>{formatTime(viewModal.entry.clockInTime)}</strong></div>
                  <div className="detail-row"><span>Clock Out</span><strong>{viewModal.entry.clockOutTime ? formatTime(viewModal.entry.clockOutTime) : 'Active'}</strong></div>
                  <div className="detail-row"><span>Break</span><strong>{viewModal.entry.breakMinutes || 0} minutes</strong></div>
                  <div className="detail-row"><span>Total Duration</span><strong>{formatDuration(viewModal.entry.durationMinutes)}</strong></div>
                </div>
                <div className="detail-section">
                  <h4>Cost Breakdown</h4>
                  <div className="detail-row"><span>Hourly Rate</span><strong>${viewModal.entry.hourlyRate || 0}/hr</strong></div>
                  <div className="detail-row"><span>Regular Hours</span><strong>{((viewModal.entry.regularMinutes || 0) / 60).toFixed(2)}h</strong></div>
                  <div className="detail-row"><span>Overtime Hours</span><strong>{((viewModal.entry.overtimeMinutes || 0) / 60).toFixed(2)}h</strong></div>
                  <div className="detail-row"><span>Double Time</span><strong>{((viewModal.entry.doubleTimeMinutes || 0) / 60).toFixed(2)}h</strong></div>
                  <div className="detail-row total"><span>Total Cost</span><strong>{formatCurrency(viewModal.entry.laborCost)}</strong></div>
                </div>
              </div>
              {viewModal.entry.notes && (
                <div className="detail-section full-width">
                  <h4>Notes</h4>
                  <p>{viewModal.entry.notes}</p>
                </div>
              )}
              {viewModal.entry.approvalStatus === 'REJECTED' && viewModal.entry.rejectionReason && (
                <div className="detail-section full-width rejection-section">
                  <h4>Rejection Reason</h4>
                  <p>{viewModal.entry.rejectionReason}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewModal({ open: false, entry: null })}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {archiveModal.open && archiveModal.entry && (
        <div className="modal-overlay" onClick={() => setArchiveModal({ open: false, entry: null, reason: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗃️ Archive Time Entry</h3>
              <button className="modal-close" onClick={() => setArchiveModal({ open: false, entry: null, reason: '' })}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to archive this entry?</p>
              <div className="archive-entry-summary">
                <div><strong>{archiveModal.entry.user?.name}</strong></div>
                <div>{formatDate(archiveModal.entry.clockInTime)} • {formatDuration(archiveModal.entry.durationMinutes)}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason (optional)</label>
                <textarea 
                  className="form-textarea"
                  value={archiveModal.reason}
                  onChange={(e) => setArchiveModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Why is this entry being archived?"
                  rows={2}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setArchiveModal({ open: false, entry: null, reason: '' })}>Cancel</button>
              <button className="btn btn-warning" onClick={handleArchive} disabled={actionLoading === archiveModal.entry.id}>
                {actionLoading === archiveModal.entry.id ? 'Archiving...' : 'Archive Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Pay Period Modal */}
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
                  value={unlockModal.reason}
                  onChange={(e) => setUnlockModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why this pay period needs to be unlocked (min 10 characters)..."
                  rows={3}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setUnlockModal({ open: false, reason: '' })}>Cancel</button>
              <button 
                className="btn btn-warning" 
                onClick={handleUnlockPayPeriod} 
                disabled={payPeriodLoading || unlockModal.reason.length < 10}
              >
                {payPeriodLoading ? 'Unlocking...' : 'Unlock Period'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Pay Period Modal */}
      {deletePayPeriodModal.open && (
        <div className="modal-overlay" onClick={() => setDeletePayPeriodModal({ open: false, period: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Pay Period</h2>
              <button className="modal-close" onClick={() => setDeletePayPeriodModal({ open: false, period: null })}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px' }}>
                Are you sure you want to delete this pay period?
              </p>
              <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>
                {deletePayPeriodModal.period && formatPayPeriodDateRange(deletePayPeriodModal.period)}
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Time entries in this period will not be deleted, but will no longer be associated with this pay period.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeletePayPeriodModal({ open: false, period: null })}>Cancel</button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeletePayPeriod}
                disabled={payPeriodLoading}
                style={{ background: '#dc3545', color: 'white' }}
              >
                {payPeriodLoading ? 'Deleting...' : 'Delete Pay Period'}
              </button>
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
                  <option value="WEEKLY">Weekly (7 days)</option>
                  <option value="BIWEEKLY">Bi-Weekly (14 days)</option>
                  <option value="SEMIMONTHLY">Semi-Monthly (1st-15th, 16th-end)</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              {(payPeriodSettings.payPeriodType === 'WEEKLY' || 
                payPeriodSettings.payPeriodType === 'BIWEEKLY' ||
                payPeriodSettings.payPeriodType === 'SEMIMONTHLY' ||
                payPeriodSettings.payPeriodType === 'MONTHLY') && (
                <div className="form-group">
                  <label className="form-label">
                    {payPeriodSettings.payPeriodType === 'WEEKLY' || payPeriodSettings.payPeriodType === 'BIWEEKLY' 
                      ? 'Start Day of Week' 
                      : 'First Period Start Day'}
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

      {/* Edit Entry Modal */}
      {editModal.open && editModal.entry && (
        <div className="modal-overlay" onClick={() => setEditModal({ open: false, entry: null, clockInDate: '', clockInTime: '', clockOutDate: '', clockOutTime: '', breakMinutes: 0, restBreaksTaken: 0, jobId: '', notes: '' })}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Time Entry</h3>
              <button className="modal-close" onClick={() => setEditModal({ open: false, entry: null, clockInDate: '', clockInTime: '', clockOutDate: '', clockOutTime: '', breakMinutes: 0, restBreaksTaken: 0, jobId: '', notes: '' })}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="edit-entry-id">
                  <span>Entry ID</span>
                  <strong>{formatShortId(editModal.entry.id)}</strong>
                </div>
                
                <div className="edit-worker-info">
                  <div className="avatar">{editModal.entry.user?.name?.split(' ').map(n => n[0]).join('') || '??'}</div>
                  <div>
                    <strong>{editModal.entry.user?.name || 'Unknown'}</strong>
                    <span>{editModal.entry.job?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Clock In Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={editModal.clockInDate}
                      onChange={(e) => setEditModal(prev => ({ ...prev, clockInDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clock In Time</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={editModal.clockInTime}
                      onChange={(e) => setEditModal(prev => ({ ...prev, clockInTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Clock Out Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={editModal.clockOutDate}
                      onChange={(e) => setEditModal(prev => ({ ...prev, clockOutDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clock Out Time</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={editModal.clockOutTime}
                      onChange={(e) => setEditModal(prev => ({ ...prev, clockOutTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-hint" style={{ marginBottom: '16px', color: '#666', fontSize: '0.85rem' }}>
                  ⏰ Times are in Pacific Time (PT)
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Meal Break (min)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      min="0"
                      max="480"
                      value={editModal.breakMinutes}
                      onChange={(e) => setEditModal(prev => ({ ...prev, breakMinutes: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rest Breaks</label>
                    <select 
                      className="form-select"
                      value={editModal.restBreaksTaken}
                      onChange={(e) => setEditModal(prev => ({ ...prev, restBreaksTaken: parseInt(e.target.value) }))}
                    >
                      <option value={0}>0 breaks</option>
                      <option value={1}>1 break</option>
                      <option value={2}>2 breaks</option>
                      <option value={3}>3 breaks</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <select 
                      className="form-select"
                      value={editModal.jobId}
                      onChange={(e) => setEditModal(prev => ({ ...prev, jobId: e.target.value }))}
                    >
                      <option value="">Unassigned</option>
                      {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-textarea"
                    rows="2"
                    value={editModal.notes}
                    onChange={(e) => setEditModal(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes about this edit..."
                  />
                </div>

                {selectedPayPeriod?.status === 'EXPORTED' && (
                  <div className="edit-warning">
                    <strong>Warning:</strong> This entry is in an exported pay period. Editing will flag it as amended for payroll reconciliation.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal({ open: false, entry: null, clockInDate: '', clockInTime: '', clockOutDate: '', clockOutTime: '', breakMinutes: 0, restBreaksTaken: 0, jobId: '', notes: '' })}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading === editModal.entry.id}
                >
                  {actionLoading === editModal.entry.id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {manualEntryModal.open && (
        <div className="modal-overlay" onClick={() => setManualEntryModal({ open: false })}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Manual Time Entry</h3>
              <button className="modal-close" onClick={() => setManualEntryModal({ open: false })}>×</button>
            </div>
            <div className="modal-body">
              <ManualEntryForm inModal={true} />
            </div>
          </div>
        </div>
      )}

      {/* Copy Entry Modal */}
      {copyModal.open && copyModal.entry && (
        <div className="modal-overlay" onClick={() => setCopyModal({ open: false, entry: null, copyMode: 'single', targetDate: '', targetDates: [], targetPayPeriod: '', copyToNextWeek: false, weekdaysOnly: true, numberOfWeeks: 1 })}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Copy Time Entry</h3>
              <button className="modal-close" onClick={() => setCopyModal({ open: false, entry: null, copyMode: 'single', targetDate: '', targetDates: [], targetPayPeriod: '', copyToNextWeek: false, weekdaysOnly: true, numberOfWeeks: 1 })}>×</button>
            </div>
            <div className="modal-body">
              <div className="copy-source-info">
                <strong>Copying from:</strong>
                <div className="copy-source-details">
                  <span>{copyModal.entry.user?.name}</span>
                  <span>{formatDate(copyModal.entry.clockInTime)}</span>
                  <span>{formatTime(copyModal.entry.clockInTime)} - {formatTime(copyModal.entry.clockOutTime)}</span>
                  <span>{formatDuration(copyModal.entry.durationMinutes)}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Copy Mode</label>
                <div className="copy-mode-options">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="copyMode" 
                      value="single"
                      checked={copyModal.copyMode === 'single'}
                      onChange={() => setCopyModal(prev => ({ ...prev, copyMode: 'single' }))}
                    />
                    <span>Single Day</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="copyMode" 
                      value="weekdays"
                      checked={copyModal.copyMode === 'weekdays'}
                      onChange={() => setCopyModal(prev => ({ ...prev, copyMode: 'weekdays' }))}
                    />
                    <span>Weekdays (Mon-Fri)</span>
                  </label>
                </div>
              </div>

              {copyModal.copyMode === 'single' && (
                <div className="form-group">
                  <label className="form-label">Target Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={copyModal.targetDate}
                    onChange={(e) => setCopyModal(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
              )}

              {copyModal.copyMode === 'weekdays' && (
                <div className="form-group">
                  <label className="form-label">Number of Weeks</label>
                  <select 
                    className="form-select"
                    value={copyModal.numberOfWeeks}
                    onChange={(e) => setCopyModal(prev => ({ ...prev, numberOfWeeks: parseInt(e.target.value) }))}
                  >
                    <option value={1}>1 week (5 entries)</option>
                    <option value={2}>2 weeks (10 entries)</option>
                    <option value={3}>3 weeks (15 entries)</option>
                    <option value={4}>4 weeks (20 entries)</option>
                  </select>
                  <p className="form-hint">Copy to Monday-Friday starting from next week</p>
                </div>
              )}

              {payPeriods.length > 1 && (
                <div className="form-group">
                  <label className="form-label">Target Pay Period (optional)</label>
                  <select 
                    className="form-select"
                    value={copyModal.targetPayPeriod}
                    onChange={(e) => setCopyModal(prev => ({ ...prev, targetPayPeriod: e.target.value }))}
                  >
                    <option value="">Current period</option>
                    {payPeriods.map((period, index) => (
                      <option key={period.id} value={period.id}>
                        {formatPayPeriodLabel(period, index)} ({formatPayPeriodDateRange(period)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setCopyModal({ open: false, entry: null, copyMode: 'single', targetDate: '', targetDates: [], targetPayPeriod: '', copyToNextWeek: false, weekdaysOnly: true, numberOfWeeks: 1 })}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleCopyEntry}
                disabled={copyLoading || (copyModal.copyMode === 'single' && !copyModal.targetDate)}
              >
                {copyLoading ? 'Copying...' : `Copy Entry${copyModal.copyMode === 'weekdays' ? ` (${copyModal.numberOfWeeks * 5} days)` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn-copy {
          color: #6366f1;
        }
        .btn-copy:hover {
          background: #eef2ff;
        }
        .copy-source-info {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .copy-source-info strong {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        .copy-source-details {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .copy-source-details span {
          font-size: 14px;
          color: #333;
        }
        .copy-mode-options {
          display: flex;
          gap: 16px;
          margin-top: 8px;
        }
        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .radio-option:has(input:checked) {
          border-color: #C9A227;
          background: #fefce8;
        }
        .radio-option input {
          accent-color: #C9A227;
        }
        .archive-entry-summary {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          margin: 12px 0;
        }
        .btn-warning {
          background: #f59e0b;
          color: white;
          border: none;
        }
        .btn-warning:hover {
          background: #d97706;
        }
      `}</style>
    </div>
  );
}

export default TimeTrackingPage;