import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import './WorkerTypePage.css';

function SalariedWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [stats, setStats] = useState({ total: 0, tracking: 0, totalHoursLogged: 0 });

  useEffect(() => { loadWorkers(); }, []);

  const loadWorkers = async () => {
    try {
      const res = await usersApi.getAll();
      const salariedWorkers = res.data.filter(w => w.workerTypes?.includes('SALARIED'));
      setWorkers(salariedWorkers);
      setStats({ total: salariedWorkers.length, tracking: salariedWorkers.filter(w => w.isTrackingTime).length, totalHoursLogged: 0 });
    } catch (err) { console.error('Failed to load workers:', err); }
    setLoading(false);
  };

  const toggleSelectWorker = (id) => setSelectedWorkers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedWorkers(selectedWorkers.length === workers.length ? [] : workers.map(w => w.id));
  const formatCurrency = (amount) => amount ? `$${Number(amount).toLocaleString()}` : '-';
  const formatHours = (minutes) => { if (!minutes) return '0h'; const h = Math.floor(minutes / 60); const m = minutes % 60; return m > 0 ? `${h}h ${m}m` : `${h}h`; };

  if (loading) return <div className="worker-type-page"><div className="loading-state"><div className="spinner"></div><p>Loading salaried workers...</p></div></div>;

  return (
    <div className="worker-type-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Salaried Workers</h1>
          <p>Manage salaried employees with optional time tracking</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" disabled={selectedWorkers.length === 0}>Export Activity ({selectedWorkers.length})</button>
          <button className="btn btn-secondary" disabled={selectedWorkers.length === 0}>Send Message ({selectedWorkers.length})</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div><div className="stat-content"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Salaried Workers</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="stat-content"><div className="stat-value">{stats.tracking}</div><div className="stat-label">Currently Tracking Time</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><div className="stat-content"><div className="stat-value">{formatHours(stats.totalHoursLogged)}</div><div className="stat-label">Hours Logged This Month</div></div></div>
      </div>

      <div className="workers-table-container">
        <table className="workers-table">
          <thead><tr><th className="checkbox-col"><input type="checkbox" checked={selectedWorkers.length === workers.length && workers.length > 0} onChange={toggleSelectAll}/></th><th>Name</th><th>Phone</th><th>Email</th><th>Annual Salary</th><th>Monthly Salary</th><th>Hours This Week</th><th>Last Activity</th><th>Actions</th></tr></thead>
          <tbody>
            {workers.length === 0 ? (<tr><td colSpan="9" className="empty-state"><p>No salaried workers found</p><a href="/workers">Add workers from the Team page</a></td></tr>) : (
              workers.map(worker => (
                <tr key={worker.id}>
                  <td className="checkbox-col"><input type="checkbox" checked={selectedWorkers.includes(worker.id)} onChange={() => toggleSelectWorker(worker.id)}/></td>
                  <td><div className="worker-name-cell"><div className="worker-avatar">{worker.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div><div><div className="worker-name">{worker.name}</div><div className="worker-role">{worker.role}</div></div></div></td>
                  <td>{worker.phone}</td>
                  <td>{worker.email || '-'}</td>
                  <td>{formatCurrency(worker.annualSalary)}</td>
                  <td>{formatCurrency(worker.annualSalary ? worker.annualSalary / 12 : null)}</td>
                  <td>{formatHours(worker.hoursThisWeek || 0)}</td>
                  <td>{worker.lastActivity ? new Date(worker.lastActivity).toLocaleString() : 'Never'}</td>
                  <td><div className="action-buttons"><button className="btn btn-sm btn-ghost">Edit</button><button className="btn btn-sm btn-ghost">Activity</button></div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalariedWorkersPage;