import { useState, useEffect } from 'react';
import { usersApi, jobsApi } from '../services/api';
import './WorkersPage.css';

// SVG Icons
const Icons = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  userPlus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
  checkCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  xCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  dollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  userCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>
  ),
  userX: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  hash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
};

const TRADE_CLASSIFICATIONS = [
  'Laborer',
  'Carpenter',
  'Electrician',
  'Plumber',
  'HVAC Technician',
  'Ironworker',
  'Mason',
  'Painter',
  'Roofer',
  'Sheet Metal Worker',
  'Pipefitter',
  'Welder',
  'Equipment Operator',
  'Truck Driver',
  'Foreman',
  'Superintendent',
  'Other',
];

function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'worker',
    hourlyRate: '',
    status: 'active',
    // WH-347 fields
    address: '',
    city: '',
    state: '',
    zip: '',
    lastFourSSN: '',
    tradeClassification: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workersRes, jobsRes] = await Promise.all([
        usersApi.getAll(),
        jobsApi.getAll()
      ]);
      setWorkers(workersRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert frontend fields to backend fields
      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role?.toUpperCase() || 'WORKER',
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        isActive: formData.status === 'active',
        // WH-347 fields
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip: formData.zip || undefined,
        lastFourSSN: formData.lastFourSSN || undefined,
        tradeClassification: formData.tradeClassification || undefined,
      };

      if (editingWorker) {
        await usersApi.update(editingWorker.id, payload);
      } else {
        await usersApi.create(payload);
      }
      setShowModal(false);
      setEditingWorker(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving worker:', error);
      alert(error.response?.data?.message || 'Failed to save worker');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'worker',
      hourlyRate: '',
      status: 'active',
      address: '',
      city: '',
      state: '',
      zip: '',
      lastFourSSN: '',
      tradeClassification: '',
    });
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name || '',
      email: worker.email || '',
      phone: worker.phone || '',
      role: worker.role?.toLowerCase() || 'worker',
      hourlyRate: worker.hourlyRate || '',
      status: worker.isActive ? 'active' : 'inactive',
      address: worker.address || '',
      city: worker.city || '',
      state: worker.state || '',
      zip: worker.zip || '',
      lastFourSSN: worker.lastFourSSN || '',
      tradeClassification: worker.tradeClassification || '',
    });
    setShowModal(true);
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Deactivate this worker?')) {
      try {
        await usersApi.deactivate(id);
        loadData();
      } catch (error) {
        console.error('Error deactivating worker:', error);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await usersApi.approve(id);
      loadData();
    } catch (error) {
      console.error('Error approving worker:', error);
    }
  };

  const handleDecline = async (id) => {
    if (window.confirm('Decline this worker? They will not be able to access the app.')) {
      try {
        await usersApi.decline(id);
        loadData();
      } catch (error) {
        console.error('Error declining worker:', error);
      }
    }
  };

  const getApprovalStatus = (worker) => {
    if (worker.approvalStatus) return worker.approvalStatus;
    if (worker.isActive) return 'APPROVED';
    return 'PENDING';
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         w.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const approvalStatus = getApprovalStatus(w);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && approvalStatus === 'APPROVED' && w.isActive) ||
                         (statusFilter === 'inactive' && (!w.isActive || approvalStatus === 'DECLINED')) ||
                         (statusFilter === 'pending' && approvalStatus === 'PENDING');
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: workers.length,
    active: workers.filter(w => getApprovalStatus(w) === 'APPROVED' && w.isActive).length,
    inactive: workers.filter(w => !w.isActive || getApprovalStatus(w) === 'DECLINED').length,
    pending: workers.filter(w => getApprovalStatus(w) === 'PENDING').length
  };

  if (loading) {
    return (
      <div className="workers-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workers-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <div className="page-icon">{Icons.users}</div>
            <h1>Workers</h1>
          </div>
          <p>Manage your workforce</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingWorker(null); resetForm(); setShowModal(true); }}>
          {Icons.userPlus}
          <span>Add Worker</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold">{Icons.users}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Workers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.checkCircle}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">{Icons.xCircle}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactive}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
        {stats.pending > 0 && (
          <div className="stat-card">
            <div className="stat-icon orange">{Icons.clock}</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">{Icons.search}</span>
          <input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Workers List */}
      {filteredWorkers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{Icons.users}</div>
          <h3>No workers found</h3>
          <p>Add your first worker to get started</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            {Icons.userPlus}
            <span>Add Worker</span>
          </button>
        </div>
      ) : (
        <div className="workers-grid">
          {filteredWorkers.map(worker => {
            const approvalStatus = getApprovalStatus(worker);
            const isPending = approvalStatus === 'PENDING';
            
            return (
              <div key={worker.id} className={`worker-card ${isPending ? 'pending' : ''}`}>
                <div className="worker-header">
                  <div className="worker-avatar">
                    {worker.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                  <div className="worker-info">
                    <h3>{worker.name}</h3>
                    <span className={`status-badge ${isPending ? 'pending' : approvalStatus === 'APPROVED' && worker.isActive ? 'active' : 'inactive'}`}>
                      {isPending ? 'Pending' : approvalStatus === 'APPROVED' && worker.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="worker-actions">
                    {isPending ? (
                      <>
                        <button className="action-btn approve" onClick={() => handleApprove(worker.id)} title="Approve">
                          {Icons.userCheck}
                        </button>
                        <button className="action-btn danger" onClick={() => handleDecline(worker.id)} title="Decline">
                          {Icons.userX}
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="action-btn" onClick={() => handleEdit(worker)} title="Edit">
                          {Icons.edit}
                        </button>
                        <button className="action-btn danger" onClick={() => handleDeactivate(worker.id)} title="Deactivate">
                          {Icons.trash}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="worker-details">
                  <div className="detail-row">
                    <span className="detail-icon">{Icons.mail}</span>
                    <span>{worker.email || 'No email'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">{Icons.phone}</span>
                    <span>{worker.phone || 'No phone'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">{Icons.shield}</span>
                    <span className="role-badge">{worker.role || 'Worker'}</span>
                  </div>
                  {worker.hourlyRate && (
                    <div className="detail-row">
                      <span className="detail-icon">{Icons.dollarSign}</span>
                      <span className="rate">${worker.hourlyRate}/hr</span>
                    </div>
                  )}
                  {worker.tradeClassification && (
                    <div className="detail-row">
                      <span className="detail-icon">{Icons.briefcase}</span>
                      <span>{worker.tradeClassification}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{editingWorker ? Icons.edit : Icons.userPlus}</span>
                <h2>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>{Icons.x}</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Basic Info Section */}
                <div className="form-section">
                  <h3 className="form-section-title">Basic Information</h3>
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.user}</span>Full Name *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                      placeholder="John Smith" 
                      required 
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.mail}</span>Email</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                        placeholder="john@example.com (optional)" 
                      />
                    </div>
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.phone}</span>Phone</label>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                        placeholder="(555) 123-4567" 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.shield}</span>Role</label>
                      <select value={formData.role} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}>
                        <option value="worker">Worker</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.dollarSign}</span>Hourly Rate</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={formData.hourlyRate} 
                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))} 
                        placeholder="25.00" 
                      />
                    </div>
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.checkCircle}</span>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* WH-347 / Certified Payroll Section */}
                <div className="form-section">
                  <h3 className="form-section-title">Certified Payroll Info (WH-347)</h3>
                  <p className="form-section-subtitle">Required for prevailing wage projects</p>
                  
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.mapPin}</span>Street Address</label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} 
                      placeholder="123 Main Street" 
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input 
                        type="text" 
                        value={formData.city} 
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} 
                        placeholder="San Jose" 
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input 
                        type="text" 
                        value={formData.state} 
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} 
                        placeholder="CA" 
                        maxLength={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input 
                        type="text" 
                        value={formData.zip} 
                        onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))} 
                        placeholder="95123" 
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.hash}</span>Last 4 of SSN</label>
                      <input 
                        type="text" 
                        value={formData.lastFourSSN} 
                        onChange={(e) => setFormData(prev => ({ ...prev, lastFourSSN: e.target.value.replace(/\D/g, '').slice(0, 4) }))} 
                        placeholder="1234" 
                        maxLength={4}
                      />
                    </div>
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.briefcase}</span>Trade Classification</label>
                      <select 
                        value={formData.tradeClassification} 
                        onChange={(e) => setFormData(prev => ({ ...prev, tradeClassification: e.target.value }))}
                      >
                        <option value="">Select trade...</option>
                        {TRADE_CLASSIFICATIONS.map(trade => (
                          <option key={trade} value={trade}>{trade}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{Icons.check}<span>{editingWorker ? 'Save Changes' : 'Add Worker'}</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkersPage;