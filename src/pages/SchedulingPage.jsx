import { useState, useEffect } from 'react';
import { shiftsApi, usersApi, jobsApi } from '../services/api';
import './SchedulingPage.css';

// SVG Icons
const Icons = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4c0-.27.1-.52.3-.71.2-.2.44-.29.7-.29h10c.27 0 .52.1.71.29.2.2.29.45.29.71v18"/>
      <path d="M6 12H4c-.27 0-.52.1-.71.29-.2.2-.29.45-.29.71v9"/>
      <path d="M18 9h2c.27 0 .52.1.71.29.2.2.29.45.29.71v12"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

function SchedulingPage() {
  const [shifts, setShifts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [jobSites, setJobSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [formData, setFormData] = useState({
    jobId: '',
    userId: '',
    date: '',
    startTime: '08:00',
    endTime: '17:00',
    notes: ''
  });

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
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
      setJobSites((jobsRes.data || []).filter(j => j.status === 'active'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await shiftsApi.create({ ...formData, status: 'scheduled' });
      setShowModal(false);
      setFormData({ jobId: '', userId: '', date: '', startTime: '08:00', endTime: '17:00', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error creating shift:', error);
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

  const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const getShiftsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(s => s.date === dateStr);
  };

  const weekDays = getWeekDays();
  const stats = {
    totalShifts: shifts.length,
    workers: workers.length,
    jobSites: jobSites.length,
    upcoming: shifts.filter(s => new Date(s.date) >= new Date()).length
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
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          {Icons.plus}<span>Create Shift</span>
        </button>
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
          <div className="stat-icon purple">{Icons.clock}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.upcoming}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button className="nav-btn" onClick={() => navigateWeek(-1)}>{Icons.chevronLeft}</button>
        <h2>{formatDate(weekDays[0])} - {formatDate(weekDays[6])}</h2>
        <button className="nav-btn" onClick={() => navigateWeek(1)}>{Icons.chevronRight}</button>
      </div>

      {/* Week Grid */}
      <div className="week-grid">
        {weekDays.map((day, index) => {
          const dayShifts = getShiftsForDay(day);
          const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          return (
            <div key={index} className={`day-column ${isToday(day) ? 'today' : ''}`}
              onClick={() => { setFormData(prev => ({ ...prev, date: day.toISOString().split('T')[0] })); setShowModal(true); }}>
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
                    {dayShifts.map(shift => (
                      <div key={shift.id} className="shift-item" onClick={(e) => e.stopPropagation()}>
                        <div className="shift-time">{shift.startTime} - {shift.endTime}</div>
                        <div className="shift-worker">{shift.user?.name || 'Unassigned'}</div>
                        <div className="shift-job">{shift.job?.name || 'No site'}</div>
                        <button className="shift-delete" onClick={(e) => { e.stopPropagation(); handleDelete(shift.id); }}>
                          {Icons.trash}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Shift Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{Icons.calendar}</span>
                <h2>Create New Shift</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>{Icons.x}</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label><span className="label-icon">{Icons.building}</span>Job Site</label>
                  <select value={formData.jobId} onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value }))} required>
                    <option value="">Select a job site</option>
                    {jobSites.map(job => <option key={job.id} value={job.id}>{job.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><span className="label-icon">{Icons.user}</span>Worker</label>
                  <select value={formData.userId} onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))} required>
                    <option value="">Select a worker</option>
                    {workers.map(worker => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><span className="label-icon">{Icons.calendar}</span>Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.clock}</span>Start Time</label>
                    <input type="time" value={formData.startTime} onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.clock}</span>End Time</label>
                    <input type="time" value={formData.endTime} onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label><span className="label-icon">{Icons.fileText}</span>Notes (optional)</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Any special instructions..." rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{Icons.check}<span>Create Shift</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulingPage;