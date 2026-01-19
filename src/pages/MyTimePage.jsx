import { useState, useEffect } from 'react';
import { timeEntriesApi } from '../services/api';
import './MyTimePage.css';

const Icons = {
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

function MyTimePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    notes: '',
  });

  const [stats, setStats] = useState({
    todayHours: 0,
    weekHours: 0,
    monthHours: 0,
  });

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    return user.id;
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    let interval;
    if (isTracking && trackingStart) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - trackingStart.getTime()) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, trackingStart]);

  const loadEntries = async () => {
    try {
      const res = await timeEntriesApi.getMine();
      setEntries(res.data || []);
      calculateStats(res.data || []);
    } catch (err) {
      console.error('Failed to load entries:', err);
    }
    setLoading(false);
  };

  const calculateStats = (entries) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayMinutes = 0;
    let weekMinutes = 0;
    let monthMinutes = 0;

    entries.forEach(entry => {
      if (!entry.durationMinutes) return;
      const entryDate = new Date(entry.clockInTime);
      
      if (entryDate >= todayStart) {
        todayMinutes += entry.durationMinutes;
      }
      if (entryDate >= weekStart) {
        weekMinutes += entry.durationMinutes;
      }
      if (entryDate >= monthStart) {
        monthMinutes += entry.durationMinutes;
      }
    });

    setStats({
      todayHours: (todayMinutes / 60).toFixed(1),
      weekHours: (weekMinutes / 60).toFixed(1),
      monthHours: (monthMinutes / 60).toFixed(1),
    });
  };

  const startTracking = () => {
    setIsTracking(true);
    setTrackingStart(new Date());
    setElapsedTime('00:00:00');
  };

  const stopTracking = async () => {
  if (!trackingStart) return;

  const endTime = new Date();
  const durationMs = endTime.getTime() - trackingStart.getTime();
  
  // Must track at least 1 minute
  if (durationMs < 60000) {
    alert('Please track for at least 1 minute before stopping.');
    return;
  }
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert('User not found. Please log in again.');
      return;
    }

    // Format for the API: date as YYYY-MM-DD, times as HH:MM
    const date = trackingStart.toISOString().split('T')[0];
    const clockIn = trackingStart.toTimeString().slice(0, 5); // "HH:MM"
    const clockOut = endTime.toTimeString().slice(0, 5); // "HH:MM"

    try {
      await timeEntriesApi.createManual({
        userId,
        date,
        clockIn,
        clockOut,
        breakMinutes: 0,
        notes: 'Logged via My Time tracker',
      });
      
      setIsTracking(false);
      setTrackingStart(null);
      setElapsedTime('00:00:00');
      loadEntries();
    } catch (err) {
      console.error('Failed to save time entry:', err);
      alert('Failed to save time entry: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert('User not found. Please log in again.');
      return;
    }

    // Validate times
    if (manualEntry.endTime <= manualEntry.startTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      await timeEntriesApi.createManual({
        userId,
        date: manualEntry.date,
        clockIn: manualEntry.startTime,
        clockOut: manualEntry.endTime,
        breakMinutes: 0,
        notes: manualEntry.notes || undefined,
      });
      
      setShowManualEntry(false);
      setManualEntry({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        notes: '',
      });
      loadEntries();
    } catch (err) {
      console.error('Failed to create entry:', err);
      alert('Failed to create time entry: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="my-time-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your time...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-time-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Time</h1>
          <p>Track your own work hours</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => setShowManualEntry(true)}>
            {Icons.plus}
            <span>Add Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Timer Card */}
      <div className={`timer-card ${isTracking ? 'tracking' : ''}`}>
        <div className="timer-display">
          <span className="timer-icon">{Icons.clock}</span>
          <span className="timer-value">{elapsedTime}</span>
        </div>
        <div className="timer-actions">
          {isTracking ? (
            <button className="btn btn-stop" onClick={stopTracking}>
              {Icons.stop}
              <span>Stop</span>
            </button>
          ) : (
            <button className="btn btn-start" onClick={startTracking}>
              {Icons.play}
              <span>Start Timer</span>
            </button>
          )}
        </div>
        {isTracking && (
          <p className="timer-hint">Timer running since {trackingStart?.toLocaleTimeString()}</p>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">{Icons.clock}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.todayHours}h</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.calendar}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.weekHours}h</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">{Icons.calendar}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.monthHours}h</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="entries-section">
        <h2>Recent Time Entries</h2>
        {entries.length === 0 ? (
          <div className="empty-state">
            <p>No time entries yet. Start the timer or add a manual entry.</p>
          </div>
        ) : (
          <div className="entries-list">
            {entries.slice(0, 20).map(entry => (
              <div key={entry.id} className="entry-row">
                <div className="entry-date">{formatDate(entry.clockInTime)}</div>
                <div className="entry-times">
                  <span>{formatTime(entry.clockInTime)}</span>
                  <span className="time-separator">→</span>
                  <span>{entry.clockOutTime ? formatTime(entry.clockOutTime) : 'In progress'}</span>
                </div>
                <div className="entry-duration">{formatDuration(entry.durationMinutes)}</div>
                <div className="entry-notes">{entry.notes || '-'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="modal-overlay" onClick={() => setShowManualEntry(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Manual Time Entry</h2>
              <button className="modal-close" onClick={() => setShowManualEntry(false)}>×</button>
            </div>
            <form onSubmit={handleManualSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={manualEntry.date}
                    onChange={e => setManualEntry(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={manualEntry.startTime}
                      onChange={e => setManualEntry(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={manualEntry.endTime}
                      onChange={e => setManualEntry(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={manualEntry.notes}
                    onChange={e => setManualEntry(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="What did you work on?"
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowManualEntry(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTimePage;