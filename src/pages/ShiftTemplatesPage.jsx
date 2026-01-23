import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://punchd-backend.onrender.com/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const styles = {
  page: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '600', margin: 0, marginBottom: '4px' },
  subtitle: { color: '#6b7280', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px', marginBottom: '24px' },
  card: { background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  cardTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  cardMeta: { color: '#6b7280', fontSize: '14px', marginBottom: '8px' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '500' },
  days: { display: 'flex', gap: '4px', marginBottom: '12px' },
  day: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '500' },
  dayActive: { background: '#C9A227', color: 'white' },
  dayInactive: { background: '#f3f4f6', color: '#9ca3af' },
  cardActions: { display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' },
  btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  btnPrimary: { background: '#C9A227', color: 'white' },
  btnSecondary: { background: '#f3f4f6', color: '#374151' },
  btnDanger: { background: '#fee2e2', color: '#dc2626' },
  btnSm: { padding: '6px 12px', fontSize: '13px' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '20px' },
  modalFooter: { padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' },
  daysSelect: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  dayBtn: { width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: 'white' },
  dayBtnActive: { background: '#C9A227', color: 'white', borderColor: '#C9A227' },
  workerList: { maxHeight: '200px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' },
  workerItem: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' },
  checkbox: { marginRight: '12px' },
  emptyState: { textAlign: 'center', padding: '48px', color: '#6b7280' },
  todaySection: { background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px' },
  todayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  todayTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  shiftRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', marginRight: '6px' },
};

function ShiftTemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [todayShifts, setTodayShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showOneOffModal, setShowOneOffModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({ name: '', daysOfWeek: [], startTime: '09:00', endTime: '17:00', jobId: '', notes: '' });
  const [assignForm, setAssignForm] = useState({ userIds: [], startDate: '', endDate: '' });
  const [oneOffForm, setOneOffForm] = useState({ date: '', startTime: '09:00', endTime: '17:00', jobId: '', userIds: [], notes: '' });

  const getAuthHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRes, jobsRes, usersRes, todayRes] = await Promise.all([
        fetch(`${API_BASE}/shift-templates`, { headers: getAuthHeaders() }).then(r => r.json()),
        fetch(`${API_BASE}/jobs`, { headers: getAuthHeaders() }).then(r => r.json()),
        fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }).then(r => r.json()),
        fetch(`${API_BASE}/shift-templates/today`, { headers: getAuthHeaders() }).then(r => r.json()),
      ]);
      setTemplates(Array.isArray(templatesRes) ? templatesRes : []);
      setJobs(Array.isArray(jobsRes) ? jobsRes : []);
      setWorkers(Array.isArray(usersRes) ? usersRes.filter(u => u.isActive) : []);
      setTodayShifts(Array.isArray(todayRes) ? todayRes : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setForm({ name: '', daysOfWeek: [], startTime: '09:00', endTime: '17:00', jobId: '', notes: '' });
    setShowModal(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      daysOfWeek: template.daysOfWeek,
      startTime: template.startTime,
      endTime: template.endTime,
      jobId: template.jobId || '',
      notes: template.notes || '',
    });
    setShowModal(true);
  };

  const openAssignModal = (template) => {
    setSelectedTemplate(template);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setAssignForm({ userIds: [], startDate: today, endDate: nextMonth.toISOString().split('T')[0] });
    setShowAssignModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!form.name || form.daysOfWeek.length === 0) {
      alert('Please enter a name and select at least one day');
      return;
    }
    setProcessing(true);
    try {
      const url = editingTemplate 
        ? `${API_BASE}/shift-templates/${editingTemplate.id}`
        : `${API_BASE}/shift-templates`;
      const method = editingTemplate ? 'PATCH' : 'POST';
      
      await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      setShowModal(false);
      loadData();
    } catch (err) { alert('Failed to save template'); }
    setProcessing(false);
  };

  const handleDeleteTemplate = async (template) => {
    if (!confirm(`Delete "${template.name}"? This will cancel all future shifts.`)) return;
    try {
      await fetch(`${API_BASE}/shift-templates/${template.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      loadData();
    } catch (err) { alert('Failed to delete'); }
  };

  const handleAssignWorkers = async () => {
    if (assignForm.userIds.length === 0) {
      alert('Please select at least one worker');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/shift-templates/${selectedTemplate.id}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignForm),
      });
      const data = await res.json();
      alert(`Created ${data.shiftsCreated} shifts for ${data.workersAssigned} workers`);
      setShowAssignModal(false);
      loadData();
    } catch (err) { alert('Failed to assign workers'); }
    setProcessing(false);
  };

  const handleCreateOneOff = async () => {
    if (!oneOffForm.date || oneOffForm.userIds.length === 0) {
      alert('Please select a date and at least one worker');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/shift-templates/one-off`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(oneOffForm),
      });
      const data = await res.json();
      alert(`Created ${data.shiftsCreated} shifts`);
      setShowOneOffModal(false);
      setOneOffForm({ date: '', startTime: '09:00', endTime: '17:00', jobId: '', userIds: [], notes: '' });
      loadData();
    } catch (err) { alert('Failed to create shift'); }
    setProcessing(false);
  };

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day) 
        ? f.daysOfWeek.filter(d => d !== day)
        : [...f.daysOfWeek, day].sort()
    }));
  };

  const toggleWorker = (userId, formSetter) => {
    formSetter(f => ({
      ...f,
      userIds: f.userIds.includes(userId)
        ? f.userIds.filter(id => id !== userId)
        : [...f.userIds, userId]
    }));
  };

  const selectAllWorkers = (formSetter) => {
    formSetter(f => ({ ...f, userIds: workers.map(w => w.id) }));
  };

  const formatTime = (time) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  if (loading) return <div style={styles.page}><p>Loading...</p></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Shift Templates</h1>
          <p style={styles.subtitle}>Create recurring schedules and assign workers in bulk</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setShowOneOffModal(true)}>+ One-Off Shift</button>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={openCreateModal}>+ New Template</button>
        </div>
      </div>

      {/* Today's Shifts */}
      {todayShifts.length > 0 && (
        <div style={styles.todaySection}>
          <div style={styles.todayHeader}>
            <h2 style={styles.todayTitle}>Today's Shifts</h2>
          </div>
          {todayShifts.map((shift, i) => (
            <div key={i} style={styles.shiftRow}>
              <div>
                <strong>{shift.jobName}</strong>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  {new Date(shift.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                  {new Date(shift.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#16a34a' }}>✓ {shift.confirmed}</span>
                <span style={{ color: '#f59e0b' }}>⏳ {shift.pending}</span>
                {shift.declined > 0 && <span style={{ color: '#dc2626' }}>✗ {shift.declined}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div style={{ ...styles.card, ...styles.emptyState }}>
          <p>No shift templates yet</p>
          <button style={{ ...styles.btn, ...styles.btnPrimary, marginTop: '12px' }} onClick={openCreateModal}>Create Your First Template</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {templates.map(template => (
            <div key={template.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{template.name}</h3>
                <span style={{ ...styles.badge, background: '#dbeafe', color: '#2563eb' }}>
                  {template.assignedWorkerCount || 0} workers
                </span>
              </div>
              
              <div style={styles.cardMeta}>
                {formatTime(template.startTime)} - {formatTime(template.endTime)}
              </div>
              
              {template.job && (
                <div style={styles.cardMeta}>📍 {template.job.name}</div>
              )}
              
              <div style={styles.days}>
                {DAYS.map((day, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      ...styles.day, 
                      ...(template.daysOfWeek.includes(i) ? styles.dayActive : styles.dayInactive) 
                    }}
                  >
                    {day[0]}
                  </div>
                ))}
              </div>

              {template.notes && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{template.notes}</div>
              )}

              <div style={styles.cardActions}>
                <button style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm, flex: 1 }} onClick={() => openAssignModal(template)}>Assign Workers</button>
                <button style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSm }} onClick={() => openEditModal(template)}>Edit</button>
                <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSm }} onClick={() => handleDeleteTemplate(template)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Template Name</label>
                <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. ABC Site - Weekdays" />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Days of Week</label>
                <div style={styles.daysSelect}>
                  {DAYS.map((day, i) => (
                    <div 
                      key={i}
                      style={{ ...styles.dayBtn, ...(form.daysOfWeek.includes(i) ? styles.dayBtnActive : {}) }}
                      onClick={() => toggleDay(i)}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Time</label>
                  <input type="time" style={styles.input} value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Time</label>
                  <input type="time" style={styles.input} value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location (Optional)</label>
                <select style={styles.select} value={form.jobId} onChange={e => setForm({ ...form, jobId: e.target.value })}>
                  <option value="">No location</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (Optional)</label>
                <textarea style={styles.textarea} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Parking in back lot" />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSaveTemplate} disabled={processing}>
                {processing ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Workers Modal */}
      {showAssignModal && selectedTemplate && (
        <div style={styles.modal} onClick={() => setShowAssignModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>Assign Workers</h2>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <strong>{selectedTemplate.name}</strong>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {DAYS.filter((_, i) => selectedTemplate.daysOfWeek.includes(i)).join(', ')} • {formatTime(selectedTemplate.startTime)} - {formatTime(selectedTemplate.endTime)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input type="date" style={styles.input} value={assignForm.startDate} onChange={e => setAssignForm({ ...assignForm, startDate: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date</label>
                  <input type="date" style={styles.input} value={assignForm.endDate} onChange={e => setAssignForm({ ...assignForm, endDate: e.target.value })} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={styles.label}>Select Workers ({assignForm.userIds.length})</label>
                  <button style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSm }} onClick={() => selectAllWorkers(setAssignForm)}>Select All</button>
                </div>
                <div style={styles.workerList}>
                  {workers.map(w => (
                    <div key={w.id} style={styles.workerItem} onClick={() => toggleWorker(w.id, setAssignForm)}>
                      <input type="checkbox" checked={assignForm.userIds.includes(w.id)} readOnly style={styles.checkbox} />
                      <div>
                        <div style={{ fontWeight: '500' }}>{w.name}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{w.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleAssignWorkers} disabled={processing}>
                {processing ? 'Assigning...' : `Assign ${assignForm.userIds.length} Workers`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* One-Off Shift Modal */}
      {showOneOffModal && (
        <div style={styles.modal} onClick={() => setShowOneOffModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>Create One-Off Shift</h2>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowOneOffModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input type="date" style={styles.input} value={oneOffForm.date} onChange={e => setOneOffForm({ ...oneOffForm, date: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Time</label>
                  <input type="time" style={styles.input} value={oneOffForm.startTime} onChange={e => setOneOffForm({ ...oneOffForm, startTime: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Time</label>
                  <input type="time" style={styles.input} value={oneOffForm.endTime} onChange={e => setOneOffForm({ ...oneOffForm, endTime: e.target.value })} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location (Optional)</label>
                <select style={styles.select} value={oneOffForm.jobId} onChange={e => setOneOffForm({ ...oneOffForm, jobId: e.target.value })}>
                  <option value="">No location</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (Optional)</label>
                <textarea style={styles.textarea} rows={2} value={oneOffForm.notes} onChange={e => setOneOffForm({ ...oneOffForm, notes: e.target.value })} placeholder="e.g. Bring steel toes" />
              </div>

              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={styles.label}>Select Workers ({oneOffForm.userIds.length})</label>
                  <button style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSm }} onClick={() => selectAllWorkers(setOneOffForm)}>Select All</button>
                </div>
                <div style={styles.workerList}>
                  {workers.map(w => (
                    <div key={w.id} style={styles.workerItem} onClick={() => toggleWorker(w.id, setOneOffForm)}>
                      <input type="checkbox" checked={oneOffForm.userIds.includes(w.id)} readOnly style={styles.checkbox} />
                      <div>
                        <div style={{ fontWeight: '500' }}>{w.name}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{w.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setShowOneOffModal(false)}>Cancel</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleCreateOneOff} disabled={processing}>
                {processing ? 'Creating...' : `Create Shift for ${oneOffForm.userIds.length} Workers`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftTemplatesPage;