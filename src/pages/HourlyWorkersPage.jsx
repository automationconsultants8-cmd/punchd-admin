import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import './WorkerTypePage.css';

function HourlyWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [stats, setStats] = useState({ total: 0, clockedIn: 0, totalHoursThisWeek: 0, totalOTThisWeek: 0 });

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const res = await usersApi.getAll();
      const hourlyWorkers = res.data.filter(w => !w.workerTypes?.length || w.workerTypes.includes('HOURLY'));
      
      const clockedIn = hourlyWorkers.filter(w => w.isClockedIn).length;
      
      setWorkers(hourlyWorkers);
      setStats({
        total: hourlyWorkers.length,
        clockedIn,
        totalHoursThisWeek: 0,
        totalOTThisWeek: 0,
      });
    } catch (err) {
      console.error('Failed to load workers:', err);
    }
    setLoading(false);
  };

  const toggleSelectWorker = (workerId) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedWorkers.length === workers.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(workers.map(w => w.id));
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatHours = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="worker-type-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading hourly workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-type-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Hourly Workers</h1>
          <p>Manage hourly employees with overtime and break tracking</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" disabled={selectedWorkers.length === 0}>
            Export Timesheets ({selectedWorkers.length})
          </button>
          <button className="btn btn-secondary" disabled={selectedWorkers.length === 0}>
            Send Message ({selectedWorkers.length})
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Hourly Workers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.clockedIn}</div>
            <div className="stat-label">Currently Clocked In</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatHours(stats.totalHoursThisWeek)}</div>
            <div className="stat-label">Hours This Week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatHours(stats.totalOTThisWeek)}</div>
            <div className="stat-label">OT Hours This Week</div>
          </div>
        </div>
      </div>

      <div className="workers-table-container">
        <table className="workers-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input 
                  type="checkbox" 
                  checked={selectedWorkers.length === workers.length && workers.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Phone</th>
              <th>Hourly Rate</th>
              <th>Hours This Week</th>
              <th>OT Hours</th>
              <th>DT Hours</th>
              <th>Break Compliance</th>
              <th>Last Clock In</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-state">
                  <p>No hourly workers found</p>
                  <a href="/workers">Add workers from the Team page</a>
                </td>
              </tr>
            ) : (
              workers.map(worker => (
                <tr key={worker.id}>
                  <td className="checkbox-col">
                    <input 
                      type="checkbox"
                      checked={selectedWorkers.includes(worker.id)}
                      onChange={() => toggleSelectWorker(worker.id)}
                    />
                  </td>
                  <td>
                    <div className="worker-name-cell">
                      <div className="worker-avatar">
                        {worker.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="worker-name">{worker.name}</div>
                        <div className="worker-email">{worker.email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{worker.phone}</td>
                  <td>{formatCurrency(worker.hourlyRate)}</td>
                  <td>{formatHours(worker.hoursThisWeek || 0)}</td>
                  <td className={worker.otHoursThisWeek > 0 ? 'ot-highlight' : ''}>
                    {formatHours(worker.otHoursThisWeek || 0)}
                  </td>
                  <td className={worker.dtHoursThisWeek > 0 ? 'dt-highlight' : ''}>
                    {formatHours(worker.dtHoursThisWeek || 0)}
                  </td>
                  <td>
                    <span className={`compliance-badge ${worker.breakViolations > 0 ? 'violation' : 'compliant'}`}>
                      {worker.breakViolations > 0 ? `${worker.breakViolations} Violations` : 'Compliant'}
                    </span>
                  </td>
                  <td>{worker.lastClockIn ? new Date(worker.lastClockIn).toLocaleString() : 'Never'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-ghost" title="Edit">Edit</button>
                      <button className="btn btn-sm btn-ghost" title="View Timesheet">Timesheet</button>
                      <button className="btn btn-sm btn-ghost" title="Set Rate">Rate</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HourlyWorkersPage;