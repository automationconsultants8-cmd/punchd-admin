import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_BASE = 'https://punchd-backend.onrender.com/api';

const Icons = {
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  file: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  heart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  award: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

const styles = {
  page: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  headerLeft: {},
  title: { fontSize: '24px', fontWeight: '600', margin: 0, marginBottom: '4px' },
  subtitle: { color: '#6b7280', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'white', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: '1px solid #e5e7eb' },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '28px', fontWeight: '600' },
  statLabel: { color: '#6b7280', fontSize: '14px' },
  tabsRow: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  tabActive: { background: '#C9A227', color: 'white', border: '1px solid #C9A227' },
  badge: { background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' },
  badgeActive: { background: 'rgba(255,255,255,0.3)' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden' },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', flexShrink: 0 },
  btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  btnPrimary: { background: '#C9A227', color: 'white' },
  btnSecondary: { background: '#f3f4f6', color: '#374151' },
  btnGhost: { background: 'transparent', color: '#6b7280' },
  btnSm: { padding: '4px 8px', fontSize: '12px' },
  actionBtns: { display: 'flex', gap: '4px' },
  emptyState: { textAlign: 'center', padding: '48px', color: '#6b7280' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '12px', maxWidth: '450px', width: '90%', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '20px' },
  modalFooter: { padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
};

function ApprovalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'contractors');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ contractorPending: 0, volunteerPending: 0, signOffPending: 0 });
  const [contractorEntries, setContractorEntries] = useState([]);
  const [volunteerEntries, setVolunteerEntries] = useState([]);
  const [signOffRequests, setSignOffRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, reason: '' });
  const [viewModal, setViewModal] = useState({ open: false, entry: null });
  const [editModal, setEditModal] = useState({ open: false, entry: null, clockIn: '', clockOut: '' });
  const [certModal, setCertModal] = useState({ open: false, selectedVolunteer: '' });

  const getAuthHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setSearchParams({ tab: activeTab }); setSelectedIds([]); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, contractorsRes, volunteersRes, signOffsRes, certsRes] = await Promise.all([
        fetch(`${API_BASE}/volunteer/admin/stats`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/volunteer/admin/contractors/pending`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/volunteer/admin/volunteers/pending`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/volunteer/admin/sign-offs/pending`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/volunteer/admin/certificates`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
      ]);
      setStats(statsRes || {});
      setContractorEntries(Array.isArray(contractorsRes) ? contractorsRes : []);
      setVolunteerEntries(Array.isArray(volunteersRes) ? volunteersRes : []);
      setSignOffRequests(Array.isArray(signOffsRes) ? signOffsRes : []);
      setCertificates(Array.isArray(certsRes) ? certsRes : []);
      
      const usersRes = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []);
      setVolunteers((usersRes || []).filter(u => u.workerTypes?.includes('VOLUNTEER')));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (ids) => {
    if (!ids.length) return;
    setProcessing(true);
    try {
      await fetch(`${API_BASE}/volunteer/admin/entries/approve`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ entryIds: ids }) });
      setSelectedIds([]);
      loadData();
    } catch { alert('Failed'); }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedIds.length || !rejectModal.reason) return;
    setProcessing(true);
    try {
      await fetch(`${API_BASE}/volunteer/admin/entries/reject`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ entryIds: selectedIds, reason: rejectModal.reason }) });
      setSelectedIds([]);
      setRejectModal({ open: false, reason: '' });
      loadData();
    } catch { alert('Failed'); }
    setProcessing(false);
  };

  const handleApproveSignOff = async (id) => {
    setProcessing(true);
    try {
      await fetch(`${API_BASE}/volunteer/admin/sign-offs/${id}/approve`, { method: 'POST', headers: getAuthHeaders() });
      loadData();
    } catch { alert('Failed'); }
    setProcessing(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await fetch(`${API_BASE}/time-entries/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      loadData();
    } catch { alert('Failed'); }
  };

  const handleEdit = async () => {
    if (!editModal.entry) return;
    setProcessing(true);
    try {
      await fetch(`${API_BASE}/time-entries/${editModal.entry.id}`, {
        method: 'PATCH', headers: getAuthHeaders(),
        body: JSON.stringify({ clockInTime: new Date(editModal.clockIn).toISOString(), clockOutTime: new Date(editModal.clockOut).toISOString() }),
      });
      setEditModal({ open: false, entry: null, clockIn: '', clockOut: '' });
      loadData();
    } catch { alert('Failed'); }
    setProcessing(false);
  };

  const handleGenerateCert = async () => {
    if (!certModal.selectedVolunteer) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/volunteer/admin/certificates/generate/${certModal.selectedVolunteer}`, { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      setCertModal({ open: false, selectedVolunteer: '' });
      loadData();
      alert('Certificate generated!');
    } catch (e) { alert(`Failed: ${e.message}`); }
    setProcessing(false);
  };

  const openEdit = (e) => setEditModal({ open: true, entry: e, clockIn: new Date(e.clockInTime).toISOString().slice(0, 16), clockOut: e.clockOutTime ? new Date(e.clockOutTime).toISOString().slice(0, 16) : '' });
  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleAll = (entries) => setSelectedIds(selectedIds.length === entries.length ? [] : entries.map(e => e.id));
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' });
  const fmtHours = (m) => { if (!m) return '0h'; const h = Math.floor(m / 60); const min = m % 60; return min > 0 ? `${h}h ${min}m` : `${h}h`; };

  const currentEntries = activeTab === 'contractors' ? contractorEntries : volunteerEntries;
  const iconColors = { blue: '#dbeafe', pink: '#fce7f3', orange: '#ffedd5', green: '#dcfce7' };
  const iconTextColors = { blue: '#2563eb', pink: '#db2777', orange: '#ea580c', green: '#16a34a' };

  if (loading) return <div style={styles.page}><p>Loading...</p></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Approvals Center</h1>
          <p style={styles.subtitle}>Review and approve contractor timesheets, volunteer hours, and certificates</p>
        </div>
        <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={loadData}>{Icons.refresh} Refresh</button>
      </div>

      <div style={styles.statsGrid}>
        {[
          { tab: 'contractors', icon: Icons.file, val: stats.contractorPending || 0, label: 'Contractor Pending', color: 'blue' },
          { tab: 'volunteers', icon: Icons.heart, val: stats.volunteerPending || 0, label: 'Volunteer Pending', color: 'pink' },
          { tab: 'signoffs', icon: Icons.clock, val: stats.signOffPending || 0, label: 'Sign-off Requests', color: 'orange' },
          { tab: 'certificates', icon: Icons.award, val: certificates.length, label: 'Certificates Issued', color: 'green' },
        ].map(s => (
          <div key={s.tab} style={styles.statCard} onClick={() => setActiveTab(s.tab)}>
            <div style={{ ...styles.statIcon, background: iconColors[s.color], color: iconTextColors[s.color] }}>{s.icon}</div>
            <div><div style={styles.statValue}>{s.val}</div><div style={styles.statLabel}>{s.label}</div></div>
          </div>
        ))}
      </div>

      <div style={styles.tabsRow}>
        {[
          { id: 'contractors', label: 'Contractor Timesheets', icon: Icons.file, count: stats.contractorPending || 0 },
          { id: 'volunteers', label: 'Volunteer Hours', icon: Icons.heart, count: stats.volunteerPending || 0 },
          { id: 'signoffs', label: 'Sign-off Requests', icon: Icons.check, count: stats.signOffPending || 0 },
          { id: 'certificates', label: 'Certificates', icon: Icons.award, count: certificates.length },
        ].map(t => (
          <button key={t.id} style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.count > 0 && <span style={{ ...styles.badge, ...(activeTab === t.id ? styles.badgeActive : {}) }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {(activeTab === 'contractors' || activeTab === 'volunteers') && selectedIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '16px' }}>
          <span style={{ fontWeight: '500' }}>{selectedIds.length} selected</span>
          <button style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }} onClick={() => handleApprove(selectedIds)} disabled={processing}>Approve</button>
          <button style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSm, color: '#dc2626' }} onClick={() => setRejectModal({ open: true, reason: '' })}>Reject</button>
          <button style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm }} onClick={() => setSelectedIds([])}>Clear</button>
        </div>
      )}

      {(activeTab === 'contractors' || activeTab === 'volunteers') && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '40px' }}><input type="checkbox" checked={selectedIds.length === currentEntries.length && currentEntries.length > 0} onChange={() => toggleAll(currentEntries)}/></th>
                <th style={styles.th}>Worker</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Location</th>
                <th style={{ ...styles.th, width: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length === 0 ? (
                <tr><td colSpan="7" style={styles.emptyState}>No pending {activeTab === 'contractors' ? 'contractor timesheets' : 'volunteer hours'}</td></tr>
              ) : currentEntries.map(e => (
                <tr key={e.id}>
                  <td style={styles.td}><input type="checkbox" checked={selectedIds.includes(e.id)} onChange={() => toggleSelect(e.id)}/></td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ ...styles.avatar, background: activeTab === 'contractors' ? '#dbeafe' : '#fce7f3', color: activeTab === 'contractors' ? '#2563eb' : '#db2777' }}>
                        {e.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div><div style={{ fontWeight: '500' }}>{e.user?.name}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>{e.user?.phone}</div></div>
                    </div>
                  </td>
                  <td style={styles.td}>{fmtDate(e.clockInTime)}</td>
                  <td style={styles.td}><div>{fmtTime(e.clockInTime)}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>to {fmtTime(e.clockOutTime)}</div></td>
                  <td style={styles.td}><strong>{fmtHours(e.durationMinutes)}</strong></td>
                  <td style={styles.td}>{e.job?.name || '-'}</td>
                  <td style={styles.td}>
                    <div style={styles.actionBtns}>
                      <button style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm }} onClick={() => setViewModal({ open: true, entry: e })}>{Icons.eye}</button>
                      <button style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm }} onClick={() => openEdit(e)}>{Icons.edit}</button>
                      <button style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }} onClick={() => handleApprove([e.id])} disabled={processing}>{Icons.check}</button>
                      <button style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm, color: '#dc2626' }} onClick={() => { setSelectedIds([e.id]); setRejectModal({ open: true, reason: '' }); }}>{Icons.x}</button>
                      <button style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm, color: '#dc2626' }} onClick={() => handleDelete(e.id)}>{Icons.trash}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'signoffs' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Volunteer</th><th style={styles.th}>Total Hours</th><th style={styles.th}># Entries</th><th style={styles.th}>Supervisor</th><th style={styles.th}>Notes</th><th style={styles.th}>Submitted</th><th style={{ ...styles.th, width: '120px' }}>Actions</th></tr></thead>
            <tbody>
              {signOffRequests.length === 0 ? (
                <tr><td colSpan="7" style={styles.emptyState}>No pending sign-off requests</td></tr>
              ) : signOffRequests.map(r => (
                <tr key={r.id}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ ...styles.avatar, background: '#fce7f3', color: '#db2777' }}>{r.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                      <div><div style={{ fontWeight: '500' }}>{r.user?.name}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>{r.user?.phone}</div></div>
                    </div>
                  </td>
                  <td style={styles.td}><strong>{fmtHours(r.totalMinutes)}</strong></td>
                  <td style={styles.td}>{r.timeEntryIds?.length || 0}</td>
                  <td style={styles.td}>{r.supervisorName || r.supervisorEmail || '-'}</td>
                  <td style={{ ...styles.td, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '-'}</td>
                  <td style={styles.td}>{fmtDate(r.createdAt)}</td>
                  <td style={styles.td}><button style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }} onClick={() => handleApproveSignOff(r.id)} disabled={processing}>{Icons.check} Approve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'certificates' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#6b7280', margin: 0 }}>Generate certificates for volunteers with approved hours.</p>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setCertModal({ open: true, selectedVolunteer: '' })}>{Icons.plus} Generate Certificate</button>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Volunteer</th><th style={styles.th}>Certificate Title</th><th style={styles.th}>Hours Earned</th><th style={styles.th}>Issued Date</th></tr></thead>
              <tbody>
                {certificates.length === 0 ? (
                  <tr><td colSpan="4" style={styles.emptyState}><p>No certificates issued yet</p><button style={{ ...styles.btn, ...styles.btnPrimary, marginTop: '12px' }} onClick={() => setCertModal({ open: true, selectedVolunteer: '' })}>Generate First Certificate</button></td></tr>
                ) : certificates.map(c => (
                  <tr key={c.id}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ ...styles.avatar, background: '#dcfce7', color: '#16a34a' }}>{c.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div><div style={{ fontWeight: '500' }}>{c.user?.name}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>{c.user?.phone}</div></div>
                      </div>
                    </td>
                    <td style={styles.td}>{c.title}</td>
                    <td style={styles.td}><strong>{c.hoursEarned}h</strong></td>
                    <td style={styles.td}>{fmtDate(c.issuedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View Modal */}
      {viewModal.open && viewModal.entry && (
        <div style={styles.modal} onClick={() => setViewModal({ open: false, entry: null })}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}><h3 style={{ margin: 0 }}>Time Entry Details</h3><button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setViewModal({ open: false, entry: null })}>×</button></div>
            <div style={styles.modalBody}>
              <p><strong>Worker:</strong> {viewModal.entry.user?.name}</p>
              <p><strong>Clock In:</strong> {fmtDate(viewModal.entry.clockInTime)} at {fmtTime(viewModal.entry.clockInTime)}</p>
              <p><strong>Clock Out:</strong> {viewModal.entry.clockOutTime ? `${fmtDate(viewModal.entry.clockOutTime)} at ${fmtTime(viewModal.entry.clockOutTime)}` : 'In Progress'}</p>
              <p><strong>Duration:</strong> {fmtHours(viewModal.entry.durationMinutes)}</p>
              <p><strong>Location:</strong> {viewModal.entry.job?.name || '-'}</p>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setViewModal({ open: false, entry: null })}>Close</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { handleApprove([viewModal.entry.id]); setViewModal({ open: false, entry: null }); }}>Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && editModal.entry && (
        <div style={styles.modal} onClick={() => setEditModal({ open: false, entry: null, clockIn: '', clockOut: '' })}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}><h3 style={{ margin: 0 }}>Edit Time Entry</h3><button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setEditModal({ open: false, entry: null, clockIn: '', clockOut: '' })}>×</button></div>
            <div style={styles.modalBody}>
              <p style={{ fontWeight: '500', marginBottom: '16px' }}>{editModal.entry.user?.name}</p>
              <div style={styles.formGroup}><label style={styles.label}>Clock In</label><input type="datetime-local" value={editModal.clockIn} onChange={e => setEditModal(p => ({ ...p, clockIn: e.target.value }))} style={styles.input}/></div>
              <div style={styles.formGroup}><label style={styles.label}>Clock Out</label><input type="datetime-local" value={editModal.clockOut} onChange={e => setEditModal(p => ({ ...p, clockOut: e.target.value }))} style={styles.input}/></div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setEditModal({ open: false, entry: null, clockIn: '', clockOut: '' })}>Cancel</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleEdit} disabled={processing || !editModal.clockIn || !editModal.clockOut}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={styles.modal} onClick={() => setRejectModal({ open: false, reason: '' })}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}><h3 style={{ margin: 0 }}>Reject Entries</h3><button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setRejectModal({ open: false, reason: '' })}>×</button></div>
            <div style={styles.modalBody}>
              <p>Rejecting {selectedIds.length} {selectedIds.length === 1 ? 'entry' : 'entries'}.</p>
              <div style={styles.formGroup}><label style={styles.label}>Reason</label><textarea value={rejectModal.reason} onChange={e => setRejectModal(p => ({ ...p, reason: e.target.value }))} placeholder="Enter reason..." rows={3} style={styles.input}/></div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setRejectModal({ open: false, reason: '' })}>Cancel</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary, background: '#dc2626' }} onClick={handleReject} disabled={!rejectModal.reason || processing}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Certificate Modal */}
      {certModal.open && (
        <div style={styles.modal} onClick={() => setCertModal({ open: false, selectedVolunteer: '' })}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}><h3 style={{ margin: 0 }}>Generate Certificate</h3><button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setCertModal({ open: false, selectedVolunteer: '' })}>×</button></div>
            <div style={styles.modalBody}>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>Select a volunteer (must have at least 1 approved hour).</p>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Volunteer</label>
                <select value={certModal.selectedVolunteer} onChange={e => setCertModal(p => ({ ...p, selectedVolunteer: e.target.value }))} style={styles.input}>
                  <option value="">Choose...</option>
                  {volunteers.map(v => <option key={v.id} value={v.id}>{v.name} ({v.phone})</option>)}
                </select>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setCertModal({ open: false, selectedVolunteer: '' })}>Cancel</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleGenerateCert} disabled={!certModal.selectedVolunteer || processing}>Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalsPage;