import { useState, useEffect } from 'react';
import { jobsApi } from '../services/api';
import './JobSitesPage.css';

// SVG Icons
const Icons = {
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
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
  dollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  crosshair: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>
    </svg>
  ),
};

function JobSitesPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    geofenceRadiusMeters: 100,
    status: 'active',
    isPrevailingWage: false,
    defaultHourlyRate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await jobsApi.getAll();
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address) => {
    if (!address) return;
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat).toFixed(6),
          longitude: parseFloat(data[0].lon).toFixed(6)
        }));
      } else {
        alert('Could not find coordinates for this address. Please enter manually.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error geocoding address. Please enter coordinates manually.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      alert('Please enter or lookup coordinates for the job site.');
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        geofenceRadiusMeters: parseInt(formData.geofenceRadiusMeters) || 100,
        isPrevailingWage: formData.isPrevailingWage,
        defaultHourlyRate: formData.defaultHourlyRate ? parseFloat(formData.defaultHourlyRate) : undefined,
      };

      if (editingJob) {
        await jobsApi.update(editingJob.id, submitData);
      } else {
        await jobsApi.create(submitData);
      }
      setShowModal(false);
      setEditingJob(null);
      setFormData({ name: '', address: '', latitude: '', longitude: '', geofenceRadiusMeters: 100, status: 'active', isPrevailingWage: false, defaultHourlyRate: '' });
      loadData();
    } catch (error) {
      console.error('Error saving job:', error);
      alert(error.response?.data?.message || 'Error saving job site');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      name: job.name || '',
      address: job.address || '',
      latitude: job.latitude || '',
      longitude: job.longitude || '',
      geofenceRadiusMeters: job.geofenceRadiusMeters || 100,
      status: job.isActive ? 'active' : 'inactive',
      isPrevailingWage: job.isPrevailingWage || false,
      defaultHourlyRate: job.defaultHourlyRate || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job site?')) {
      try {
        await jobsApi.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         j.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && j.isActive) ||
                         (statusFilter === 'inactive' && !j.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.isActive).length,
    prevailingWage: jobs.filter(j => j.isPrevailingWage).length
  };

  if (loading) {
    return (
      <div className="job-sites-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading job sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-sites-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <div className="page-icon">{Icons.building}</div>
            <h1>Job Sites</h1>
          </div>
          <p>Manage your construction sites</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingJob(null); setFormData({ name: '', address: '', latitude: '', longitude: '', geofenceRadiusMeters: 100, status: 'active', isPrevailingWage: false, defaultHourlyRate: '' }); setShowModal(true); }}>
          {Icons.plus}
          <span>Add Job Site</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold">{Icons.building}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Sites</div>
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
          <div className="stat-icon blue">{Icons.shield}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.prevailingWage}</div>
            <div className="stat-label">Prevailing Wage</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">{Icons.search}</span>
          <input type="text" placeholder="Search job sites..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{Icons.building}</div>
          <h3>No job sites found</h3>
          <p>Add your first job site to get started</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            {Icons.plus}
            <span>Add Job Site</span>
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div className="job-icon">{Icons.building}</div>
                <div className="job-info">
                  <h3>{job.name}</h3>
                  <span className={`status-badge ${job.isActive ? 'active' : 'inactive'}`}>
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="job-actions">
                  <button className="action-btn" onClick={() => handleEdit(job)} title="Edit">{Icons.edit}</button>
                  <button className="action-btn danger" onClick={() => handleDelete(job.id)} title="Delete">{Icons.trash}</button>
                </div>
              </div>
              <div className="job-details">
                <div className="detail-row">
                  <span className="detail-icon">{Icons.mapPin}</span>
                  <span>{job.address || 'No address'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">{Icons.crosshair}</span>
                  <span className="coords">{job.latitude?.toFixed(4)}, {job.longitude?.toFixed(4)}</span>
                  <span className="geofence">({job.geofenceRadiusMeters || 100}m radius)</span>
                </div>
                {job.isPrevailingWage && (
                  <div className="detail-row">
                    <span className="detail-icon">{Icons.shield}</span>
                    <span className="prevailing-badge">Prevailing Wage</span>
                    {job.defaultHourlyRate && <span className="rate">${job.defaultHourlyRate}/hr</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{editingJob ? Icons.edit : Icons.building}</span>
                <h2>{editingJob ? 'Edit Job Site' : 'Add New Job Site'}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>{Icons.x}</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label><span className="label-icon">{Icons.building}</span>Site Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Main Street Construction" required />
                </div>
                <div className="form-group">
                  <label><span className="label-icon">{Icons.mapPin}</span>Address</label>
                  <div className="input-with-button">
                    <input type="text" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="123 Main St, City, State" required />
                    <button type="button" className="btn-secondary btn-sm" onClick={() => geocodeAddress(formData.address)} disabled={geocoding || !formData.address}>
                      {geocoding ? 'Looking up...' : 'Lookup Coords'}
                    </button>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.crosshair}</span>Latitude</label>
                    <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))} placeholder="37.7749" required />
                  </div>
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.crosshair}</span>Longitude</label>
                    <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))} placeholder="-122.4194" required />
                  </div>
                </div>
                <div className="form-group">
                  <label><span className="label-icon">{Icons.mapPin}</span>Geofence Radius (meters)</label>
                  <input type="number" min="10" value={formData.geofenceRadiusMeters} onChange={(e) => setFormData(prev => ({ ...prev, geofenceRadiusMeters: e.target.value }))} placeholder="100" />
                  <span className="form-hint">Workers must be within this radius to clock in</span>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.isPrevailingWage} onChange={(e) => setFormData(prev => ({ ...prev, isPrevailingWage: e.target.checked }))} />
                    <span className="checkbox-text">
                      <span className="checkbox-icon">{Icons.shield}</span>
                      Prevailing Wage Project
                    </span>
                  </label>
                </div>
                {formData.isPrevailingWage && (
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.dollarSign}</span>Default Hourly Rate</label>
                    <input type="number" step="0.01" value={formData.defaultHourlyRate} onChange={(e) => setFormData(prev => ({ ...prev, defaultHourlyRate: e.target.value }))} placeholder="45.00" />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{Icons.check}<span>{editingJob ? 'Save Changes' : 'Add Job Site'}</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobSitesPage;