import { useState, useEffect } from 'react';
import { shiftsApi, usersApi, jobsApi } from '../services/api';
import './SchedulingPage.css';
import { withFeatureGate } from '../components/FeatureGate';

// SVG Icons
const Icons = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v8"/><path d="M18 9h2a2 2 0 0 1 2 2v11"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  repeat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
};

// Helper to format date as YYYY-MM-DD in LOCAL timezone (DO NOT TOUCH)
const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to format time for display using UTC (DO NOT TOUCH)
const formatShiftTime = (dateStr) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

// Helper to format time for input field (HH:MM) using UTC
const formatTimeForInput = (dateStr) => {
  if (!dateStr) return '07:00';
  const date = new Date(dateStr);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function SchedulingPage() {
  const [shifts, setShifts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [jobSites, setJobSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copying, setCopying] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [formData, setFormData] = useState({
    jobId: '',
    userId: '',
    date: '',
    startTime: '07:00',
    endTime: '15:30',
    notes: '',
    isOpen: false,
    isRecurring: false,
    repeatWeeks: 1
  });

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shiftsRes, workersRes, jobsRes] = await Promise.all([
        shiftsApi.getAll(),
        usersApi.getAll(),
        jobsApi.getAll()
      ]);
      setShifts(shiftsRes.data || []);
      setWorkers((workersRes.data || []).filter(w => w.status === 'active' || w.isActive));
      setJobSites(jobsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const basePayload = {
        jobId: formData.jobId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
        isOpen: formData.isOpen
      };
      
      if (!formData.isOpen && formData.userId) {
        basePayload.userId = formData.userId;
      }

      if (editingShift) {
        // Update existing shift
        await shiftsApi.update(editingShift.id, {
          ...basePayload,
          shiftDate: formData.date
        });
      } else {
        // Create new shift(s)
        const weeksToCreate = formData.isRecurring ? formData.repeatWeeks : 1;
        const baseDate = new Date(formData.date + 'T12:00:00');

        for (let week = 0; week < weeksToCreate; week++) {
          const shiftDate = addDays(baseDate, week * 7);
          await shiftsApi.create({
            ...basePayload,
            date: toLocalDateString(shiftDate)
          });
        }
      }

      setShowModal(false);
      setEditingShift(null);
      setFormData({ 
        jobId: '', userId: '', date: '', startTime: '07:00', endTime: '15:30', 
        notes: '', isOpen: false, isRecurring: false, repeatWeeks: 1 
      });
      loadData();
    } catch (error) {
      console.error('Error saving shift:', error);
      alert('Failed to save shift. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this shift?')) {
      try {
        await shiftsApi.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting shift:', error);
      }
    }
  };

  const handleMarkAsOpen = async (id) => {
    if (window.confirm('Mark this shift as open? The worker will be unassigned and any worker can claim it.')) {
      try {
        await shiftsApi.markAsOpen(id);
        loadData();
      } catch (error) {
        console.error('Error marking shift as open:', error);
        alert('Failed to mark shift as open');
      }
    }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    const shiftDateObj = new Date(shift.shiftDate);
    setFormData({
      jobId: shift.jobId || '',
      userId: shift.userId || '',
      date: toLocalDateString(shiftDateObj),
      startTime: formatTimeForInput(shift.startTime),
      endTime: formatTimeForInput(shift.endTime),
      notes: shift.notes || '',
      isOpen: shift.isOpen || false,
      isRecurring: false,
      repeatWeeks: 1
    });
    setShowModal(true);
  };

  const handleCopyPreviousWeek = async () => {
    const prevWeekStart = addDays(currentWeek, -7);
    const prevWeekEnd = addDays(currentWeek, -1);
    
    const prevWeekShifts = shifts.filter(s => {
      const shiftDate = new Date(s.shiftDate || s.date);
      return shiftDate >= prevWeekStart && shiftDate <= prevWeekEnd;
    });

    if (prevWeekShifts.length === 0) {
      alert('No shifts found in the previous week to copy.');
      return;
    }

    if (!window.confirm(`Copy ${prevWeekShifts.length} shifts from last week to this week?`)) {
      return;
    }

    setCopying(true);
    try {
      for (const shift of prevWeekShifts) {
        const oldDate = new Date(shift.shiftDate || shift.date);
        const newDate = addDays(oldDate, 7);
        
        await shiftsApi.create({
          jobId: shift.jobId,
          userId: shift.userId,
          date: toLocalDateString(newDate),
          startTime: formatTimeForInput(shift.startTime),
          endTime: formatTimeForInput(shift.endTime),
          notes: shift.notes,
          isOpen: shift.isOpen
        });
      }
      loadData();
      alert(`Successfully copied ${prevWeekShifts.length} shifts!`);
    } catch (error) {
      console.error('Error copying shifts:', error);
      alert('Failed to copy some shifts. Please try again.');
    } finally {
      setCopying(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeek);
      day.setDate(currentWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const formatDisplayDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isToday = (date) => toLocalDateString(date) === toLocalDateString(new Date());
  
  // DO NOT TOUCH THIS FUNCTION
  const getShiftsForDay = (date) => {
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDay = date.getDate();
    
    return shifts.filter(s => {
      const shiftDate = s.shiftDate || s.date;
      if (!shiftDate) return false;
      const d = new Date(shiftDate);
      return d.getUTCFullYear() === targetYear && 
             d.getUTCMonth() === targetMonth && 
             d.getUTCDate() === targetDay;
    });
  };

  const openModal = (day = null, isOpen = false) => {
    setEditingShift(null);
    const dateStr = day ? toLocalDateString(day) : toLocalDateString(new Date());
    setFormData({ 
      jobId: '',
      userId: '',
      date: dateStr, 
      startTime: '07:00',
      endTime: '15:30',
      notes: '',
      isOpen: isOpen,
      isRecurring: false,
      repeatWeeks: 1
    });
    setShowModal(true);
  };

  const weekDays = getWeekDays();
  const openShiftsCount = shifts.filter(s => s.isOpen || s.status === 'OPEN').length;
  const stats = {
    totalShifts: shifts.length,
    workers: workers.length,
    jobSites: jobSites.length,
    openShifts: openShiftsCount
  };

  if (loading) {
    return (
      <div className="scheduling-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduling-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <div className="page-icon">{Icons.calendar}</div>
            <h1>Shift Scheduling</h1>
          </div>
          <p>Click on any day to create a shift</p>
        </div>
        <div className="header-buttons">
          <button className="btn-outline" onClick={handleCopyPreviousWeek} disabled={copying}>
            {Icons.copy}<span>{copying ? 'Copying...' : 'Copy Last Week'}</span>
          </button>
          <button className="btn-secondary" onClick={() => openModal(null, true)}>
            {Icons.briefcase}<span>Open Shift</span>
          </button>
          <button className="btn-primary" onClick={() => openModal(null, false)}>
            {Icons.plus}<span>Assign Shift</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold">{Icons.clipboard}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalShifts}</div>
            <div className="stat-label">Total Shifts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">{Icons.users}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.workers}</div>
            <div className="stat-label">Workers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.building}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.jobSites}</div>
            <div className="stat-label">Job Sites</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">{Icons.briefcase}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.openShifts}</div>
            <div className="stat-label">Open Shifts</div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button className="nav-btn" onClick={() => navigateWeek(-1)}>{Icons.chevronLeft}</button>
        <h2>{formatDisplayDate(weekDays[0])} - {formatDisplayDate(weekDays[6])}</h2>
        <button className="nav-btn" onClick={() => navigateWeek(1)}>{Icons.chevronRight}</button>
      </div>

      {/* Week Grid */}
      <div className="week-grid">
        {weekDays.map((day, index) => {
          const dayShifts = getShiftsForDay(day);
          const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          return (
            <div 
              key={index} 
              className={`day-column ${isToday(day) ? 'today' : ''}`}
              onClick={() => openModal(day, false)}
            >
              <div className="day-header">
                <span className="day-name">{dayNames[day.getDay()]}</span>
                <span className="day-number">{day.getDate()}</span>
              </div>
              <div className="day-content">
                {dayShifts.length === 0 ? (
                  <div className="no-shifts">
                    <span>No shifts</span>
                    <button className="add-shift-btn">{Icons.plus}</button>
                  </div>
                ) : (
                  <div className="shifts-list">
                    {dayShifts.map(shift => {
                      const isOpenShift = shift.isOpen || shift.status === 'OPEN';
                      return (
                        <div key={shift.id} className={`shift-item ${isOpenShift ? 'open-shift' : ''}`} onClick={(e) => e.stopPropagation()}>
                          {isOpenShift && <div className="open-badge">OPEN</div>}
                          <div className="shift-time">{formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}</div>
                          <div className="shift-worker">{isOpenShift ? 'Available' : (shift.user?.name || 'Unassigned')}</div>
                          <div className="shift-job">{shift.job?.name || 'No site'}</div>
                          <div className="shift-actions">
                            <button className="shift-action-btn edit" onClick={(e) => { e.stopPropagation(); handleEdit(shift); }} title="Edit">
                              {Icons.edit}
                            </button>
                            {!isOpenShift && shift.user && (
                              <button className="shift-action-btn mark-open" onClick={(e) => { e.stopPropagation(); handleMarkAsOpen(shift.id); }} title="Mark as Open">
                                {Icons.briefcase}
                              </button>
                            )}
                            <button className="shift-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(shift.id); }} title="Delete">
                              {Icons.trash}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Shift Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingShift(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{formData.isOpen ? Icons.briefcase : Icons.calendar}</span>
                <h2>{editingShift ? 'Edit Shift' : (formData.isOpen ? 'Create Open Shift' : 'Assign Shift')}</h2>
              </div>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditingShift(null); }}>{Icons.x}</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Shift Type Toggle */}
                <div className="shift-type-toggle">
                  <button 
                    type="button"
                    className={`toggle-btn ${!formData.isOpen ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, isOpen: false }))}
                  >
                    {Icons.user} Assign Worker
                  </button>
                  <button 
                    type="button"
                    className={`toggle-btn ${formData.isOpen ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, isOpen: true, userId: '' }))}
                  >
                    {Icons.briefcase} Open Shift
                  </button>
                </div>

                {formData.isOpen && (
                  <div className="info-box blue">
                    🔓 Open shifts can be claimed by any worker from their mobile app.
                  </div>
                )}

                <div className="form-group">
                  <label>{Icons.building} Job Site</label>
                  <select value={formData.jobId} onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value }))} required>
                    <option value="">Select a job site</option>
                    {jobSites.map(job => <option key={job.id} value={job.id}>{job.name}</option>)}
                  </select>
                </div>

                {!formData.isOpen && (
                  <div className="form-group">
                    <label>{Icons.user} Worker</label>
                    <select value={formData.userId} onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))} required>
                      <option value="">Select a worker</option>
                      {workers.map(worker => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>{Icons.calendar} Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{Icons.clock} Start Time</label>
                    <input type="time" value={formData.startTime} onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>{Icons.clock} End Time</label>
                    <input type="time" value={formData.endTime} onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))} required />
                  </div>
                </div>

                {/* Recurring Option - only show when creating new */}
                {!editingShift && (
                  <>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={formData.isRecurring} 
                          onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                        />
                        <span>{Icons.repeat} Repeat weekly</span>
                      </label>
                    </div>

                    {formData.isRecurring && (
                      <div className="form-group indent">
                        <label>Repeat for how many weeks?</label>
                        <select 
                          value={formData.repeatWeeks} 
                          onChange={(e) => setFormData(prev => ({ ...prev, repeatWeeks: parseInt(e.target.value) }))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>{n} week{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                        <small>This will create {formData.repeatWeeks} shift{formData.repeatWeeks > 1 ? 's' : ''} on the same day each week</small>
                      </div>
                    )}
                  </>
                )}

                <div className="form-group">
                  <label>{Icons.fileText} Notes (optional)</label>
                  <textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
                    placeholder="Any special instructions..." 
                    rows={2} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingShift(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {Icons.check}
                  <span>
                    {editingShift 
                      ? 'Save Changes'
                      : (formData.isRecurring && formData.repeatWeeks > 1 
                          ? `Create ${formData.repeatWeeks} Shifts` 
                          : (formData.isOpen ? 'Create Open Shift' : 'Assign Shift'))}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default withFeatureGate(SchedulingPage, 'SCHEDULING');