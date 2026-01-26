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
  chevronDown: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  chevronUp: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  folder: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  dollar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
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
  modalContent: { background: 'white', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '20px' },
  modalFooter: { padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
  entriesTable: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '12px' },
  entriesTh: { textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '500' },
  entriesTd: { padding: '8px', borderBottom: '1px solid #f3f4f6' },
};

function ApprovalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'contractors');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ contractorPending: 0, volunteerPending: 0, signOffPending: 0 });
  
  // Contractor timesheets (not individual entries)
  const [contractorTimesheets, setContractorTimesheets] = useState([]);
  const [expandedTimesheet, setExpandedTimesheet] = useState(null);
  const [expandedSignOff, setExpandedSignOff] = useState(null);
  
  // Volunteer entries (individual)
  const [volunteerEntries, setVolunteerEntries] = useState([]);
  const [signOffRequests, setSignOffRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [signOffEntries, setSignOffEntries] = useState({});
  const [payModal, setPayModal] = useState({ open: false, invoice: null, paymentMethod: '', notes: '' });
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, reason: '', type: 'entry', id: null });
  const [viewModal, setViewModal] = useState({ open: false, entry: null });
  const [editModal, setEditModal] = useState({ open: false, entry: null, clockIn: '', clockOut: '' });
  const [certModal, setCertModal] = useState({ open: false, selectedVolunteer: '' });
  const [viewCertModal, setViewCertModal] = useState({ open: false, cert: null });
  const [timesheetDetailModal, setTimesheetDetailModal] = useState({ open: false, timesheet: null });

  const getAuthHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setSearchParams({ tab: activeTab }); setSelectedIds([]); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        timesheetsRes,
        volunteersRes, 
        signOffsRes, 
        certsRes,
        volStatsRes,
        docsRes,
        invoicesRes
      ] = await Promise.all([
        // Fetch pending TIMESHEETS for contractors
        fetch(`${API_BASE}/timesheets/pending`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
        // Volunteer individual entries
        fetch(`${API_BASE}/volunteer/admin/volunteers/pending`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/volunteer/admin/sign-offs/pending`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/volunteer/admin/certificates`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/volunteer/admin/stats`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => ({})),
        // Fetch all documents
        fetch(`${API_BASE}/documents`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
        // Fetch all invoices
        fetch(`${API_BASE}/invoices`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []),
      ]);
      
      const timesheets = Array.isArray(timesheetsRes) ? timesheetsRes : [];
      setContractorTimesheets(timesheets);
      setVolunteerEntries(Array.isArray(volunteersRes) ? volunteersRes : []);
      setSignOffRequests(Array.isArray(signOffsRes) ? signOffsRes : []);
      setCertificates(Array.isArray(certsRes) ? certsRes : []);
      setDocuments(Array.isArray(docsRes) ? docsRes : []);
      setInvoices(Array.isArray(invoicesRes) ? invoicesRes : []);
      
      setStats({
        contractorPending: timesheets.length,
        volunteerPending: (Array.isArray(signOffsRes) ? signOffsRes : []).length,
        signOffPending: volStatsRes?.signOffPending || 0,
      });
      
      const usersRes = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }).then(r => r.json()).catch(() => []);
      setVolunteers((usersRes || []).filter(u => u.workerTypes?.includes('VOLUNTEER')));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Approve/Reject TIMESHEET
  const handleTimesheetReview = async (timesheetId, status, notes = '') => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/timesheets/${timesheetId}/review`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error('Failed');
      loadData();
      setTimesheetDetailModal({ open: false, timesheet: null });
      setRejectModal({ open: false, reason: '', type: 'entry', id: null });
    } catch { alert('Failed to review timesheet'); }
    setProcessing(false);
  };

  // Approve volunteer entries
  const handleApproveVolunteer = async (ids) => {
    if (!ids.length) return;
    setProcessing(true);
    try {
      await fetch(`${API_BASE}/volunteer/admin/entries/approve`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ entryIds: ids }) });
      setSelectedIds([]);
      loadData();
    } catch { alert('Failed'); }
    setProcessing(false);
  };

  const handleRejectVolunteer = async () => {
    if (!selectedIds.length || !rejectModal.reason) return;
    setProcessing(true);
    try {
      await fetch(`${API_BASE}/volunteer/admin/entries/reject`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ entryIds: selectedIds, reason: rejectModal.reason }) });
      setSelectedIds([]);
      setRejectModal({ open: false, reason: '', type: 'entry', id: null });
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

  const handleRejectSignOff = async (id, reason) => {
    setProcessing(true);
    try {
      await fetch(`${API_BASE}/volunteer/admin/sign-offs/${id}/reject`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ reason }) });
      setRejectModal({ open: false, reason: '', type: 'entry', id: null });
      loadData();
    } catch { alert('Failed'); }
    setProcessing(false);
  };

  const handleExpandSignOff = async (signOffId) => {
    if (expandedSignOff === signOffId) {
      setExpandedSignOff(null);
      return;
    }
    setExpandedSignOff(signOffId);
    
    // Load entries if not already loaded
    if (!signOffEntries[signOffId]) {
      try {
        // Fetch the sign-off with entries included
        const res = await fetch(`${API_BASE}/volunteer/admin/sign-offs/${signOffId}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setSignOffEntries(prev => ({ ...prev, [signOffId]: data.entries || [] }));
        } else {
          setSignOffEntries(prev => ({ ...prev, [signOffId]: [] }));
        }
      } catch (err) {
        console.error('Failed to load entries:', err);
        setSignOffEntries(prev => ({ ...prev, [signOffId]: [] }));
      }
    }
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

  const handleDeleteCertificate = async (certId) => {
    if (!confirm('Are you sure you want to delete this certificate? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/volunteer/admin/certificates/${certId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      loadData();
    } catch (e) { alert(`Failed to delete: ${e.message}`); }
  };

  const handleMarkAsPaid = async () => {
    if (!payModal.invoice) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/invoices/${payModal.invoice.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'PAID',
          paymentMethod: payModal.paymentMethod,
          paymentNotes: payModal.notes,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setPayModal({ open: false, invoice: null, paymentMethod: '', notes: '' });
      loadData();
      alert('Invoice marked as paid!');
    } catch (e) { alert('Failed to update invoice'); }
    setProcessing(false);
  };

  const pendingInvoices = invoices.filter(i => i.status === 'PENDING');
  const paidInvoices = invoices.filter(i => i.status === 'PAID');

  const openEdit = (e) => setEditModal({ open: true, entry: e, clockIn: new Date(e.clockInTime).toISOString().slice(0, 16), clockOut: e.clockOutTime ? new Date(e.clockOutTime).toISOString().slice(0, 16) : '' });
  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleAll = (entries) => setSelectedIds(selectedIds.length === entries.length ? [] : entries.map(e => e.id));
  
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
  const fmtDateShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' });
  const fmtHours = (m) => { if (!m) return '0h'; const h = Math.floor(m / 60); const min = m % 60; return min > 0 ? `${h}h ${min}m` : `${h}h`; };
  const fmtDateRange = (start, end) => `${fmtDateShort(start)} - ${fmtDateShort(end)}`;

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
          { tab: 'contractors', icon: Icons.file, val: stats.contractorPending || 0, label: 'Contractor Timesheets', color: 'blue' },
          { tab: 'volunteers', icon: Icons.heart, val: stats.volunteerPending || 0, label: 'Volunteer Sign-offs', color: 'pink' },
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
          { id: 'volunteers', label: 'Volunteer Sign-offs', icon: Icons.heart, count: stats.volunteerPending || 0 },
          { id: 'invoices', label: 'Invoices', icon: Icons.dollar, count: pendingInvoices.length },
          { id: 'certificates', label: 'Certificates', icon: Icons.award, count: certificates.length },
          { id: 'documents', label: 'Documents', icon: Icons.folder, count: documents.length },
        ].map(t => (
          <button key={t.id} style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.count > 0 && <span style={{ ...styles.badge, ...(activeTab === t.id ? styles.badgeActive : {}) }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* CONTRACTOR TIMESHEETS TAB */}
      {activeTab === 'contractors' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '40px' }}></th>
                <th style={styles.th}>Contractor</th>
                <th style={styles.th}>Period</th>
                <th style={styles.th}>Total Hours</th>
                <th style={styles.th}>Entries</th>
                <th style={styles.th}>Submitted</th>
                <th style={{ ...styles.th, width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contractorTimesheets.length === 0 ? (
                <tr><td colSpan="7" style={styles.emptyState}>No pending contractor timesheets</td></tr>
              ) : contractorTimesheets.map(ts => (
                <>
                  <tr key={ts.id}>
                    <td style={styles.td}>
                      <button 
                        style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm }}
                        onClick={() => setExpandedTimesheet(expandedTimesheet === ts.id ? null : ts.id)}
                      >
                        {expandedTimesheet === ts.id ? Icons.chevronUp : Icons.chevronDown}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ ...styles.avatar, background: '#dbeafe', color: '#2563eb' }}>
                          {ts.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{ts.user?.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{ts.user?.phone || ts.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <strong>{fmtDateRange(ts.periodStart, ts.periodEnd)}</strong>
                      {ts.name && <div style={{ fontSize: '12px', color: '#6b7280' }}>{ts.name}</div>}
                    </td>
                    <td style={styles.td}><strong style={{ fontSize: '16px' }}>{fmtHours(ts.totalMinutes)}</strong></td>
                    <td style={styles.td}>{ts.entries?.length || 0} entries</td>
                    <td style={styles.td}>{ts.submittedAt ? fmtDate(ts.submittedAt) : '-'}</td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button 
                          style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm }} 
                          onClick={() => setTimesheetDetailModal({ open: true, timesheet: ts })}
                        >
                          {Icons.eye} View
                        </button>
                        <button 
                          style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }} 
                          onClick={() => handleTimesheetReview(ts.id, 'APPROVED')} 
                          disabled={processing}
                        >
                          {Icons.check} Approve
                        </button>
                        <button 
                          style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm, color: '#dc2626' }} 
                          onClick={() => setRejectModal({ open: true, reason: '', type: 'timesheet', id: ts.id })}
                        >
                          {Icons.x}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded entries */}
                  {expandedTimesheet === ts.id && ts.entries?.length > 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '0 16px 16px 56px', background: '#f9fafb' }}>
                        <table style={styles.entriesTable}>
                          <thead>
                            <tr>
                              <th style={styles.entriesTh}>Date</th>
                              <th style={styles.entriesTh}>Clock In</th>
                              <th style={styles.entriesTh}>Clock Out</th>
                              <th style={styles.entriesTh}>Duration</th>
                              <th style={styles.entriesTh}>Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ts.entries.map(e => (
                              <tr key={e.id}>
                                <td style={styles.entriesTd}>{fmtDateShort(e.clockInTime)}</td>
                                <td style={styles.entriesTd}>{fmtTime(e.clockInTime)}</td>
                                <td style={styles.entriesTd}>{e.clockOutTime ? fmtTime(e.clockOutTime) : '-'}</td>
                                <td style={styles.entriesTd}><strong>{fmtHours(e.durationMinutes)}</strong></td>
                                <td style={styles.entriesTd}>{e.job?.name || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VOLUNTEER SIGN-OFFS TAB */}
      {activeTab === 'volunteers' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '40px' }}></th>
                <th style={styles.th}>Volunteer</th>
                <th style={styles.th}>Total Hours</th>
                <th style={styles.th}># Entries</th>
                <th style={styles.th}>Supervisor</th>
                <th style={styles.th}>Submitted</th>
                <th style={{ ...styles.th, width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {signOffRequests.length === 0 ? (
                <tr><td colSpan="7" style={styles.emptyState}>No pending volunteer sign-off requests</td></tr>
              ) : signOffRequests.map(r => (
                <>
                  <tr key={r.id} style={{ background: expandedSignOff === r.id ? '#f9fafb' : 'white' }}>
                    <td style={styles.td}>
                      <button 
                        style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm }} 
                        onClick={() => handleExpandSignOff(r.id)}
                      >
                        {expandedSignOff === r.id ? Icons.chevronUp : Icons.chevronDown}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ ...styles.avatar, background: '#fce7f3', color: '#db2777' }}>
                          {r.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{r.user?.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{r.user?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}><strong>{fmtHours(r.totalMinutes)}</strong></td>
                    <td style={styles.td}>{r.timeEntryIds?.length || 0} entries</td>
                    <td style={styles.td}>
                      {r.supervisorName ? (
                        <div>
                          <div style={{ fontWeight: '500' }}>{r.supervisorName}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{r.supervisorEmail}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td style={styles.td}>{fmtDate(r.createdAt)}</td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button 
                          style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }} 
                          onClick={() => handleApproveSignOff(r.id)} 
                          disabled={processing}
                        >
                          {Icons.check} Approve
                        </button>
                        <button 
                          style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSm, color: '#dc2626' }} 
                          onClick={() => setRejectModal({ open: true, reason: '', type: 'signoff', id: r.id })}
                        >
                          {Icons.x} Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedSignOff === r.id && (
                    <tr key={`${r.id}-entries`}>
                      <td colSpan="7" style={{ padding: '0 16px 16px 56px', background: '#f9fafb' }}>
                        {!signOffEntries[r.id] ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading entries...</div>
                        ) : signOffEntries[r.id].length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No entries found</div>
                        ) : (
                          <table style={styles.entriesTable}>
                            <thead>
                              <tr>
                                <th style={styles.entriesTh}>Date</th>
                                <th style={styles.entriesTh}>Clock In</th>
                                <th style={styles.entriesTh}>Clock Out</th>
                                <th style={styles.entriesTh}>Duration</th>
                                <th style={styles.entriesTh}>Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {signOffEntries[r.id].map(e => (
                                <tr key={e.id}>
                                  <td style={styles.entriesTd}>{fmtDateShort(e.clockInTime)}</td>
                                  <td style={styles.entriesTd}>{fmtTime(e.clockInTime)}</td>
                                  <td style={styles.entriesTd}>{e.clockOutTime ? fmtTime(e.clockOutTime) : '-'}</td>
                                  <td style={styles.entriesTd}><strong>{fmtHours(e.durationMinutes)}</strong></td>
                                  <td style={styles.entriesTd}>{e.notes || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {r.notes && (
                          <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <strong>Notes:</strong> {r.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CERTIFICATES TAB */}
      {activeTab === 'certificates' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#6b7280', margin: 0 }}>Generate certificates for volunteers with approved hours.</p>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setCertModal({ open: true, selectedVolunteer: '' })}>{Icons.plus} Generate Certificate</button>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Volunteer</th><th style={styles.th}>Certificate Title</th><th style={styles.th}>Hours Earned</th><th style={styles.th}>Issued Date</th><th style={{ ...styles.th, width: '120px' }}>Actions</th></tr></thead>
              <tbody>
                {certificates.length === 0 ? (
                  <tr><td colSpan="5" style={styles.emptyState}><p>No certificates issued yet</p><button style={{ ...styles.btn, ...styles.btnPrimary, marginTop: '12px' }} onClick={() => setCertModal({ open: true, selectedVolunteer: '' })}>Generate First Certificate</button></td></tr>
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
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 10px' }} onClick={() => setViewCertModal({ open: true, cert: c })} title="View Certificate">{Icons.eye}</button>
                        <button style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 10px', color: '#dc2626', borderColor: '#fecaca' }} onClick={() => handleDeleteCertificate(c.id)} title="Delete Certificate">{Icons.trash}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: '600', marginRight: '16px' }}>Pending: {pendingInvoices.length}</span>
              <span style={{ color: '#16a34a' }}>Paid: {paidInvoices.length}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Total Pending: ${pendingInvoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0).toFixed(2)}
            </div>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Contractor</th>
                <th style={styles.th}>Invoice #</th>
                <th style={styles.th}>Period</th>
                <th style={styles.th}>Hours</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan="8" style={styles.emptyState}>No invoices yet</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ ...styles.avatar, background: '#dbeafe', color: '#2563eb' }}>
                        {inv.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{inv.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{inv.user?.phone || inv.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}><strong>{inv.invoiceNumber}</strong></td>
                  <td style={styles.td}>
                    {inv.timesheet ? fmtDateRange(inv.timesheet.periodStart, inv.timesheet.periodEnd) : '-'}
                  </td>
                  <td style={styles.td}>{Number(inv.totalHours || 0).toFixed(1)}h</td>
                  <td style={styles.td}><strong>${Number(inv.totalAmount || 0).toFixed(2)}</strong></td>
                  <td style={styles.td}>{fmtDate(inv.dueDate)}</td>
                  <td style={styles.td}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: inv.status === 'PAID' ? '#dcfce7' : inv.status === 'OVERDUE' ? '#fee2e2' : '#fef3c7',
                      color: inv.status === 'PAID' ? '#16a34a' : inv.status === 'OVERDUE' ? '#dc2626' : '#92400e'
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {inv.status === 'PENDING' && (
                      <button 
                        style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}
                        onClick={() => setPayModal({ open: true, invoice: inv, paymentMethod: '', notes: '' })}
                      >
                        {Icons.check} Pay
                      </button>
                    )}
                    {inv.status === 'PAID' && (
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {inv.paymentMethod || 'Paid'} {inv.paidAt ? fmtDateShort(inv.paidAt) : ''}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Uploaded By</th>
                <th style={styles.th}>Document Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Uploaded</th>
                <th style={{ ...styles.th, width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr><td colSpan="5" style={styles.emptyState}>No documents uploaded yet</td></tr>
              ) : documents.map(doc => (
                <tr key={doc.id}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ ...styles.avatar, background: '#dbeafe', color: '#2563eb' }}>
                        {doc.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{doc.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{doc.user?.phone || doc.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}><strong>{doc.name || doc.filename}</strong></td>
                  <td style={styles.td}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: doc.type === 'W9' ? '#fef3c7' : doc.type === 'CONTRACT' ? '#dbeafe' : '#f3f4f6',
                      color: doc.type === 'W9' ? '#92400e' : doc.type === 'CONTRACT' ? '#1e40af' : '#374151'
                    }}>
                      {doc.type || 'OTHER'}
                    </span>
                  </td>
                  <td style={styles.td}>{fmtDate(doc.createdAt)}</td>
                  <td style={styles.td}>
                    <button 
                      style={{ ...styles.btn, ...styles.btnGhost, ...styles.btnSm }}
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE}/documents/${doc.id}/download`, { 
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } 
                          });
                          if (!res.ok) throw new Error('Download failed');
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = doc.name || doc.filename || 'document';
                          a.click();
                          window.URL.revokeObjectURL(url);
                        } catch (e) {
                          alert('Failed to download document');
                        }
                      }}
                      title="Download"
                    >
                      {Icons.download}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Entry Modal */}
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
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { handleApproveVolunteer([viewModal.entry.id]); setViewModal({ open: false, entry: null }); }}>Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Timesheet Detail Modal */}
      {timesheetDetailModal.open && timesheetDetailModal.timesheet && (
        <div style={styles.modal} onClick={() => setTimesheetDetailModal({ open: false, timesheet: null })}>
          <div style={{ ...styles.modalContent, maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Timesheet Details</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setTimesheetDetailModal({ open: false, timesheet: null })}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Contractor</div>
                  <div style={{ fontWeight: '600' }}>{timesheetDetailModal.timesheet.user?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Period</div>
                  <div style={{ fontWeight: '600' }}>{fmtDateRange(timesheetDetailModal.timesheet.periodStart, timesheetDetailModal.timesheet.periodEnd)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Hours</div>
                  <div style={{ fontWeight: '600', fontSize: '18px' }}>{fmtHours(timesheetDetailModal.timesheet.totalMinutes)}</div>
                </div>
              </div>
              
              <h4 style={{ marginBottom: '12px' }}>Time Entries ({timesheetDetailModal.timesheet.entries?.length || 0})</h4>
              <table style={styles.entriesTable}>
                <thead>
                  <tr>
                    <th style={styles.entriesTh}>Date</th>
                    <th style={styles.entriesTh}>Clock In</th>
                    <th style={styles.entriesTh}>Clock Out</th>
                    <th style={styles.entriesTh}>Duration</th>
                    <th style={styles.entriesTh}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {(timesheetDetailModal.timesheet.entries || []).map(e => (
                    <tr key={e.id}>
                      <td style={styles.entriesTd}>{fmtDateShort(e.clockInTime)}</td>
                      <td style={styles.entriesTd}>{fmtTime(e.clockInTime)}</td>
                      <td style={styles.entriesTd}>{e.clockOutTime ? fmtTime(e.clockOutTime) : '-'}</td>
                      <td style={styles.entriesTd}><strong>{fmtHours(e.durationMinutes)}</strong></td>
                      <td style={styles.entriesTd}>{e.job?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setTimesheetDetailModal({ open: false, timesheet: null })}>Close</button>
              <button 
                style={{ ...styles.btn, ...styles.btnSecondary, color: '#dc2626' }} 
                onClick={() => {
                  setTimesheetDetailModal({ open: false, timesheet: null });
                  setRejectModal({ open: true, reason: '', type: 'timesheet', id: timesheetDetailModal.timesheet.id });
                }}
              >
                Reject
              </button>
              <button 
                style={{ ...styles.btn, ...styles.btnPrimary }} 
                onClick={() => handleTimesheetReview(timesheetDetailModal.timesheet.id, 'APPROVED')} 
                disabled={processing}
              >
                Approve Timesheet
              </button>
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
        <div style={styles.modal} onClick={() => setRejectModal({ open: false, reason: '', type: 'entry', id: null })}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>
                {rejectModal.type === 'timesheet' ? 'Reject Timesheet' : 
                 rejectModal.type === 'signoff' ? 'Reject Sign-off Request' :
                 `Reject ${selectedIds.length} ${selectedIds.length === 1 ? 'Entry' : 'Entries'}`}
              </h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setRejectModal({ open: false, reason: '', type: 'entry', id: null })}>×</button>
            </div>
            <div style={styles.modalBody}>
              <p>
                {rejectModal.type === 'timesheet' ? 'This will reject the entire timesheet. The contractor will need to resubmit.' : 
                 rejectModal.type === 'signoff' ? 'This will reject the volunteer sign-off request. All entries will remain pending.' :
                 `Rejecting ${selectedIds.length} ${selectedIds.length === 1 ? 'entry' : 'entries'}.`}
              </p>
              <div style={styles.formGroup}><label style={styles.label}>Reason</label><textarea value={rejectModal.reason} onChange={e => setRejectModal(p => ({ ...p, reason: e.target.value }))} placeholder="Enter reason..." rows={3} style={styles.input}/></div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setRejectModal({ open: false, reason: '', type: 'entry', id: null })}>Cancel</button>
              <button 
                style={{ ...styles.btn, ...styles.btnPrimary, background: '#dc2626' }} 
                onClick={() => {
                  if (rejectModal.type === 'timesheet' && rejectModal.id) {
                    handleTimesheetReview(rejectModal.id, 'REJECTED', rejectModal.reason);
                  } else if (rejectModal.type === 'signoff' && rejectModal.id) {
                    handleRejectSignOff(rejectModal.id, rejectModal.reason);
                  } else {
                    handleRejectVolunteer();
                  }
                }} 
                disabled={!rejectModal.reason || processing}
              >
                Reject
              </button>
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

      {/* View Certificate Modal */}
      {viewCertModal.open && viewCertModal.cert && (
        <div style={styles.modal} onClick={() => setViewCertModal({ open: false, cert: null })}>
          <div style={{ ...styles.modalContent, maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Certificate Preview</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setViewCertModal({ open: false, cert: null })}>×</button>
            </div>
            <div style={{ padding: '16px', background: '#f9fafb' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Certificate of Volunteer Service</h2>
                  <p style={{ color: '#6b7280', margin: 0 }}>Official Recognition</p>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <p style={{ color: '#6b7280', marginBottom: '8px' }}>This certificate is proudly presented to</p>
                  <h1 style={{ fontSize: '32px', color: '#1a1a2e', margin: '0 0 16px', borderBottom: '2px solid #c9a227', display: 'inline-block', paddingBottom: '8px' }}>{viewCertModal.cert.user?.name}</h1>
                  <p style={{ color: '#333', marginBottom: '16px' }}>In recognition of dedicated volunteer service</p>
                  <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #c9a227, #d4af37)', color: 'white', padding: '12px 30px', borderRadius: '50px', fontWeight: '600' }}>{viewCertModal.cert.hoursEarned} Hours of Service</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontStyle: 'italic', color: '#1a1a2e' }}>Program Director</div>
                    <div style={{ borderTop: '1px solid #333', marginTop: '4px', paddingTop: '4px', fontSize: '12px', color: '#6b7280' }}>Authorized Signature</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#333' }}>{fmtDate(viewCertModal.cert.issuedAt)}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Date Issued</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setViewCertModal({ open: false, cert: null })}>Close</button>
              <button style={{ ...styles.btn, ...styles.btnSecondary, color: '#dc2626', borderColor: '#fecaca' }} onClick={() => { handleDeleteCertificate(viewCertModal.cert.id); setViewCertModal({ open: false, cert: null }); }}>{Icons.trash} Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Invoice as Paid Modal */}
      {payModal.open && payModal.invoice && (
        <div style={styles.modal} onClick={() => setPayModal({ open: false, invoice: null, paymentMethod: '', notes: '' })}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Mark Invoice as Paid</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setPayModal({ open: false, invoice: null, paymentMethod: '', notes: '' })}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Invoice #</span>
                  <strong>{payModal.invoice.invoiceNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Contractor</span>
                  <span>{payModal.invoice.user?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Hours</span>
                  <span>{Number(payModal.invoice.totalHours || 0).toFixed(1)}h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
                  <strong>Total Amount</strong>
                  <strong style={{ fontSize: '18px', color: '#16a34a' }}>${Number(payModal.invoice.totalAmount || 0).toFixed(2)}</strong>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Method</label>
                <select 
                  value={payModal.paymentMethod} 
                  onChange={e => setPayModal(p => ({ ...p, paymentMethod: e.target.value }))} 
                  style={styles.input}
                >
                  <option value="">Select...</option>
                  <option value="Check">Check</option>
                  <option value="Direct Deposit">Direct Deposit</option>
                  <option value="Zelle">Zelle</option>
                  <option value="Venmo">Venmo</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (optional)</label>
                <textarea 
                  value={payModal.notes} 
                  onChange={e => setPayModal(p => ({ ...p, notes: e.target.value }))} 
                  placeholder="Check #, reference number, etc." 
                  rows={2} 
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setPayModal({ open: false, invoice: null, paymentMethod: '', notes: '' })}>Cancel</button>
              <button 
                style={{ ...styles.btn, ...styles.btnPrimary, background: '#16a34a' }} 
                onClick={handleMarkAsPaid} 
                disabled={!payModal.paymentMethod || processing}
              >
                {Icons.check} Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalsPage;