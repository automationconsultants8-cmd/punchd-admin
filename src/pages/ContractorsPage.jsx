import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../services/api';
import './WorkerTypePage.css';

function ContractorsPage() {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractors, setSelectedContractors] = useState([]);
  const [stats, setStats] = useState({ total: 0, activeContracts: 0, pendingTimesheets: 0, pendingInvoices: 0, totalBilled: 0 });
  const [editModal, setEditModal] = useState({ open: false, contractor: null });
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', hourlyRate: '', 
    contractStartDate: '', contractEndDate: ''
  });

  useEffect(() => { loadContractors(); }, []);

  const loadContractors = async () => {
    try {
      const res = await usersApi.getAll();
      const contractorWorkers = res.data.filter(w => w.workerTypes?.includes('CONTRACTOR'));
      setContractors(contractorWorkers);
      setStats({ 
        total: contractorWorkers.length, 
        activeContracts: contractorWorkers.filter(c => c.contractStartDate && (!c.contractEndDate || new Date(c.contractEndDate) > new Date())).length, 
        pendingTimesheets: 0, 
        pendingInvoices: 0, 
        totalBilled: 0 
      });
    } catch (err) { console.error('Failed to load contractors:', err); }
    setLoading(false);
  };

  const toggleSelectContractor = (id) => setSelectedContractors(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedContractors(selectedContractors.length === contractors.length ? [] : contractors.map(c => c.id));
  const formatCurrency = (amount) => amount ? `$${Number(amount).toLocaleString()}` : '-';
  const formatHours = (minutes) => { if (!minutes) return '0h'; const h = Math.floor(minutes / 60); const m = minutes % 60; return m > 0 ? `${h}h ${m}m` : `${h}h`; };

  const handleEdit = (contractor) => {
    setFormData({
      name: contractor.name || '',
      email: contractor.email || '',
      phone: contractor.phone || '',
      password: '',
      hourlyRate: contractor.hourlyRate || '',
      contractStartDate: contractor.contractStartDate ? contractor.contractStartDate.split('T')[0] : '',
      contractEndDate: contractor.contractEndDate ? contractor.contractEndDate.split('T')[0] : '',
    });
    setEditModal({ open: true, contractor });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        contractStartDate: formData.contractStartDate || undefined,
        contractEndDate: formData.contractEndDate || undefined,
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      await usersApi.update(editModal.contractor.id, payload);
      setEditModal({ open: false, contractor: null });
      loadContractors();
    } catch (err) {
      console.error('Failed to save:', err);
      alert(err.response?.data?.message || 'Failed to save contractor');
    }
  };

  const getInvoiceStatusBadge = (status) => {
    const statusMap = { 'NONE': { label: 'No Invoice', class: 'neutral' }, 'PENDING': { label: 'Pending', class: 'warning' }, 'SUBMITTED': { label: 'Submitted', class: 'info' }, 'APPROVED': { label: 'Approved', class: 'success' }, 'PAID': { label: 'Paid', class: 'success' } };
    const s = statusMap[status] || statusMap['NONE'];
    return <span className={`status-badge ${s.class}`}>{s.label}</span>;
  };

  const getContractStatusBadge = (startDate, endDate) => {
    if (!startDate) return <span className="status-badge neutral">No Contract</span>;
    const now = new Date(); const start = new Date(startDate); const end = endDate ? new Date(endDate) : null;
    if (now < start) return <span className="status-badge info">Not Started</span>;
    if (end && now > end) return <span className="status-badge neutral">Expired</span>;
    return <span className="status-badge success">Active</span>;
  };

  if (loading) return <div className="worker-type-page"><div className="loading-state"><div className="spinner"></div><p>Loading contractors...</p></div></div>;

  return (
    <div className="worker-type-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Contractors</h1>
          <p>Manage contractors, timesheets, and invoices</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" disabled={selectedContractors.length === 0}>Export ({selectedContractors.length})</button>
          <button className="btn btn-primary" onClick={() => navigate('/workers')}>+ Add Contractor</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><div className="stat-content"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Contractors</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div><div className="stat-content"><div className="stat-value">{stats.activeContracts}</div><div className="stat-label">Active Contracts</div></div></div>
        <div className="stat-card"><div className="stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="stat-content"><div className="stat-value">{stats.pendingTimesheets}</div><div className="stat-label">Pending Timesheets</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><div className="stat-content"><div className="stat-value">{stats.pendingInvoices}</div><div className="stat-label">Pending Invoices</div></div></div>
      </div>

      <div className="workers-table-container">
        <table className="workers-table">
          <thead><tr><th className="checkbox-col"><input type="checkbox" checked={selectedContractors.length === contractors.length && contractors.length > 0} onChange={toggleSelectAll}/></th><th>Name</th><th>Contact</th><th>Rate</th><th>Contract Status</th><th>Contract Dates</th><th>Hours This Period</th><th>Invoice Status</th><th>Total Billed</th><th>Actions</th></tr></thead>
          <tbody>
            {contractors.length === 0 ? (<tr><td colSpan="10" className="empty-state"><p>No contractors found</p><a href="/workers">Add contractors from the Team page</a></td></tr>) : (
              contractors.map(contractor => (
                <tr key={contractor.id}>
                  <td className="checkbox-col"><input type="checkbox" checked={selectedContractors.includes(contractor.id)} onChange={() => toggleSelectContractor(contractor.id)}/></td>
                  <td><div className="worker-name-cell"><div className="worker-avatar contractor">{contractor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div><div><div className="worker-name">{contractor.name}</div><div className="worker-email">{contractor.email || '-'}</div></div></div></td>
                  <td><div>{contractor.phone}</div><div className="text-muted">{contractor.email}</div></td>
                  <td>{formatCurrency(contractor.hourlyRate)}/hr</td>
                  <td>{getContractStatusBadge(contractor.contractStartDate, contractor.contractEndDate)}</td>
                  <td>{contractor.contractStartDate ? (<div className="date-range"><div>{new Date(contractor.contractStartDate).toLocaleDateString()}</div><div className="text-muted">to {contractor.contractEndDate ? new Date(contractor.contractEndDate).toLocaleDateString() : 'Ongoing'}</div></div>) : '-'}</td>
                  <td>{formatHours(contractor.hoursThisPeriod || 0)}</td>
                  <td>{getInvoiceStatusBadge(contractor.invoiceStatus)}</td>
                  <td>{formatCurrency(contractor.totalBilled)}</td>
                  <td><div className="action-buttons">
                    <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(contractor)}>Edit</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/time-tracking?userId=${contractor.id}`)}>Timesheets</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(contractor)}>Contract</button>
                  </div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="modal-overlay" onClick={() => setEditModal({ open: false, contractor: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Contractor</h2>
              <button className="modal-close" onClick={() => setEditModal({ open: false, contractor: null })}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Password (leave blank to keep current)</label>
                  <input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>Hourly Rate</label>
                  <input type="number" step="0.01" value={formData.hourlyRate} onChange={e => setFormData(p => ({ ...p, hourlyRate: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contract Start Date</label>
                    <input type="date" value={formData.contractStartDate} onChange={e => setFormData(p => ({ ...p, contractStartDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Contract End Date</label>
                    <input type="date" value={formData.contractEndDate} onChange={e => setFormData(p => ({ ...p, contractEndDate: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModal({ open: false, contractor: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractorsPage;