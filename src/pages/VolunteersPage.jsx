import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../services/api';
import './WorkerTypePage.css';

const API_BASE = 'https://punchd-backend.onrender.com/api';

function VolunteersPage() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [stats, setStats] = useState({ total: 0, activeThisMonth: 0, totalHoursAllTime: 0, pendingSignoffs: 0 });
  const [processing, setProcessing] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => { loadVolunteers(); }, []);

  const loadVolunteers = async () => {
    try {
      const res = await usersApi.getAll();
      const volunteerWorkers = res.data.filter(w => w.workerTypes?.includes('VOLUNTEER'));
      setVolunteers(volunteerWorkers);
      
      let pendingCount = 0;
      try {
        const statsRes = await fetch(`${API_BASE}/volunteer/admin/stats`, { headers: getAuthHeaders() });
        const statsData = await statsRes.json();
        pendingCount = statsData.volunteerPending || 0;
      } catch (e) {}
      
      setStats({ 
        total: volunteerWorkers.length, 
        activeThisMonth: volunteerWorkers.filter(v => v.hoursThisMonth > 0).length, 
        totalHoursAllTime: volunteerWorkers.reduce((sum, v) => sum + (v.totalHoursAllTime || 0), 0), 
        pendingSignoffs: pendingCount 
      });
    } catch (err) { console.error('Failed to load volunteers:', err); }
    setLoading(false);
  };

  const toggleSelectVolunteer = (id) => setSelectedVolunteers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedVolunteers(selectedVolunteers.length === volunteers.length ? [] : volunteers.map(v => v.id));
  const formatHours = (minutes) => { if (!minutes) return '0h'; const h = Math.floor(minutes / 60); const m = minutes % 60; return m > 0 ? `${h}h ${m}m` : `${h}h`; };
  
  const sendThankYou = (volunteer) => alert(`Thank you email would be sent to ${volunteer.email || volunteer.phone}`);
  
  const generateCertificate = async (volunteer) => {
    if (!confirm(`Generate certificate for ${volunteer.name}? They need at least 1 approved hour.`)) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/volunteer/admin/certificates/generate/${volunteer.id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      const cert = await res.json();
      alert(`Certificate generated!\n\nTitle: ${cert.title}\nHours: ${cert.hoursEarned}h`);
      loadVolunteers();
    } catch (err) { alert(`Failed: ${err.message}`); }
    setProcessing(false);
  };

  const generateBulkCertificates = async () => {
    if (selectedVolunteers.length === 0) return;
    if (!confirm(`Generate certificates for ${selectedVolunteers.length} volunteers?`)) return;
    setProcessing(true);
    let success = 0, failed = 0;
    for (const id of selectedVolunteers) {
      try {
        const res = await fetch(`${API_BASE}/volunteer/admin/certificates/generate/${id}`, { method: 'POST', headers: getAuthHeaders() });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    alert(`Generated: ${success} success, ${failed} failed`);
    setSelectedVolunteers([]);
    loadVolunteers();
    setProcessing(false);
  };

  if (loading) return <div className="worker-type-page"><div className="loading-state"><div className="spinner"></div><p>Loading volunteers...</p></div></div>;

  return (
    <div className="worker-type-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Volunteers</h1>
          <p>Manage volunteers, track hours, and issue certificates</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" disabled={selectedVolunteers.length === 0}>Send Thank You ({selectedVolunteers.length})</button>
          <button className="btn btn-secondary" disabled={selectedVolunteers.length === 0 || processing} onClick={generateBulkCertificates}>Generate Certificates ({selectedVolunteers.length})</button>
          <button className="btn btn-primary" onClick={() => navigate('/workers')}>+ Add Volunteer</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div className="stat-content"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Volunteers</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
          </div>
          <div className="stat-content"><div className="stat-value">{stats.activeThisMonth}</div><div className="stat-label">Active This Month</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="stat-content"><div className="stat-value">{formatHours(stats.totalHoursAllTime)}</div><div className="stat-label">Total Hours (All Time)</div></div>
        </div>
        <div className="stat-card" onClick={() => navigate('/approvals?tab=volunteers')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div className="stat-content"><div className="stat-value">{stats.pendingSignoffs}</div><div className="stat-label">Pending Sign-offs</div></div>
        </div>
      </div>

      <div className="workers-table-container">
        <table className="workers-table">
          <thead>
            <tr>
              <th className="checkbox-col"><input type="checkbox" checked={selectedVolunteers.length === volunteers.length && volunteers.length > 0} onChange={toggleSelectAll}/></th>
              <th>Name</th>
              <th>Contact</th>
              <th>Skills / Roles</th>
              <th>Total Hours</th>
              <th>Hours This Month</th>
              <th>Goal Progress</th>
              <th>Last Volunteer Date</th>
              <th style={{ width: '220px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.length === 0 ? (
              <tr><td colSpan="9" className="empty-state"><p>No volunteers found</p><a href="/workers">Add volunteers from the Team page</a></td></tr>
            ) : volunteers.map(volunteer => (
              <tr key={volunteer.id}>
                <td className="checkbox-col"><input type="checkbox" checked={selectedVolunteers.includes(volunteer.id)} onChange={() => toggleSelectVolunteer(volunteer.id)}/></td>
                <td>
                  <div className="worker-name-cell">
                    <div className="worker-avatar volunteer">{volunteer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                    <div><div className="worker-name">{volunteer.name}</div><div className="worker-email">{volunteer.email || '-'}</div></div>
                  </div>
                </td>
                <td><div>{volunteer.phone}</div><div className="text-muted">{volunteer.email}</div></td>
                <td>{volunteer.skills?.length > 0 ? <div className="skills-list">{volunteer.skills.map((skill, idx) => <span key={idx} className="skill-badge">{skill}</span>)}</div> : '-'}</td>
                <td className="hours-cell">{formatHours(volunteer.totalHoursAllTime || 0)}</td>
                <td>{formatHours(volunteer.hoursThisMonth || 0)}</td>
                <td>
                  {volunteer.hourGoal ? (
                    <div className="goal-progress">
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, ((volunteer.totalHoursAllTime || 0) / volunteer.hourGoal) * 100)}%` }}/></div>
                      <span className="progress-text">{formatHours(volunteer.totalHoursAllTime || 0)} / {formatHours(volunteer.hourGoal)}</span>
                    </div>
                  ) : <span className="text-muted">No goal set</span>}
                </td>
                <td>{volunteer.lastVolunteerDate ? new Date(volunteer.lastVolunteerDate).toLocaleDateString() : 'Never'}</td>
                <td>
                  <div className="action-buttons" style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                    <button className="btn btn-sm btn-ghost">Edit</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => navigate('/approvals?tab=volunteers')}>Hours</button>
                    <button className="btn btn-sm btn-primary" onClick={() => generateCertificate(volunteer)} disabled={processing}>Certificate</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => sendThankYou(volunteer)}>Thanks</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VolunteersPage;