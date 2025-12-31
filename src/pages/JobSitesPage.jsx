import { useState, useEffect } from 'react';
import { jobsApi } from '../services/api';
import './JobSitesPage.css';

function JobSitesPage() {
  const [jobSites, setJobSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    geofenceRadiusMeters: '100',
  });

  useEffect(() => {
    loadJobSites();
  }, []);

  const loadJobSites = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getAll();
      setJobSites(response.data);
    } catch (err) {
      setError('Failed to load job sites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingJob(null);
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      geofenceRadiusMeters: '100',
    });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    const [lat, lng] = job.geofenceCenter.split(',');
    setEditingJob(job);
    setFormData({
      name: job.name,
      address: job.address,
      latitude: lat,
      longitude: lng,
      geofenceRadiusMeters: job.geofenceRadiusMeters.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        geofenceRadiusMeters: parseInt(formData.geofenceRadiusMeters),
      };

      if (editingJob) {
        // Update existing job
        await jobsApi.update(editingJob.id, payload);
      } else {
        // Create new job
        await jobsApi.create(payload);
      }

      setShowModal(false);
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        geofenceRadiusMeters: '100',
      });
      loadJobSites();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job site');
    }
  };

  const handleDeactivate = async (jobId) => {
    if (!confirm('Are you sure you want to deactivate this job site?')) return;

    try {
      await jobsApi.update(jobId, { isActive: false });
      loadJobSites();
    } catch (err) {
      setError('Failed to deactivate job site');
    }
  };

  if (loading) {
    return (
      <div className="job-sites-page">
        <div className="loading">Loading job sites...</div>
      </div>
    );
  }

  return (
    <div className="job-sites-page">
      <div className="page-header">
        <div>
          <h1>🏗️ Job Sites</h1>
          <p>Manage your construction sites</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          + Add Job Site
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="job-sites-grid">
        {jobSites.map(job => {
          const [lat, lng] = job.geofenceCenter.split(',');
          return (
            <div key={job.id} className={`job-card ${!job.isActive ? 'inactive' : ''}`}>
              <div className="job-header">
                <div className="job-icon">🏗️</div>
                <div className="job-info">
                  <h3>{job.name}</h3>
                  <p>{job.address}</p>
                </div>
              </div>

              <div className="job-details">
                <div className="detail-row">
                  <span className="label">Latitude:</span>
                  <span className="value">{parseFloat(lat).toFixed(6)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Longitude:</span>
                  <span className="value">{parseFloat(lng).toFixed(6)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Geofence Radius:</span>
                  <span className="value">{job.geofenceRadiusMeters}m</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${job.isActive ? 'active' : 'inactive'}`}>
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {job.isActive && (
                <div className="job-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => openEditModal(job)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn-danger" 
                    onClick={() => handleDeactivate(job.id)}
                  >
                    Deactivate
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingJob ? 'Edit Job Site' : 'Add New Job Site'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Downtown Construction Site"
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    placeholder="42.331429"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    placeholder="-83.045753"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Geofence Radius (meters)</label>
                <input
                  type="number"
                  value={formData.geofenceRadiusMeters}
                  onChange={(e) => setFormData({...formData, geofenceRadiusMeters: e.target.value})}
                  placeholder="100"
                  min="10"
                  required
                />
                <small style={{color: '#666', fontSize: '12px', marginTop: '5px', display: 'block'}}>
                  Workers must be within this distance to clock in
                </small>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingJob ? 'Save Changes' : 'Add Job Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobSitesPage;