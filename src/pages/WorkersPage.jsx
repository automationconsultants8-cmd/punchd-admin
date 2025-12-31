import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import './WorkersPage.css';

function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'WORKER',
    referencePhoto: null,
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      setWorkers(response.data);
    } catch (err) {
      setError('Failed to load workers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingWorker(null);
    setFormData({ name: '', phone: '', email: '', role: 'WORKER', referencePhoto: null });
    setPhotoPreview(null);
    setShowModal(true);
  };

  const openEditModal = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone,
      email: worker.email || '',
      role: worker.role,
      referencePhoto: null,
    });
    setPhotoPreview(worker.referencePhotoUrl || null);
    setShowModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, referencePhoto: reader.result });
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let formattedPhone = formData.phone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
      }

      if (editingWorker) {
        await usersApi.update(editingWorker.id, {
          name: formData.name,
          phone: formattedPhone,
          email: formData.email || null,
          role: formData.role,
          referencePhoto: formData.referencePhoto,
        });
      } else {
        await usersApi.create({
          name: formData.name,
          phone: formattedPhone,
          email: formData.email || null,
          role: formData.role,
          referencePhoto: formData.referencePhoto,
        });
      }

      setShowModal(false);
      setFormData({ name: '', phone: '', email: '', role: 'WORKER', referencePhoto: null });
      setPhotoPreview(null);
      loadWorkers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save worker');
    }
  };

  const handleDeactivate = async (workerId) => {
    if (!confirm('Are you sure you want to deactivate this worker?')) return;

    try {
      await usersApi.update(workerId, { isActive: false });
      loadWorkers();
    } catch (err) {
      setError('Failed to deactivate worker');
    }
  };

  const handleApprove = async (workerId) => {
    try {
      await usersApi.update(workerId, { approvalStatus: 'APPROVED' });
      loadWorkers();
    } catch (err) {
      setError('Failed to approve worker');
    }
  };

  const handleReject = async (workerId) => {
    if (!confirm('Are you sure you want to reject this registration?')) return;

    try {
      await usersApi.update(workerId, { approvalStatus: 'REJECTED' });
      loadWorkers();
    } catch (err) {
      setError('Failed to reject worker');
    }
  };

  // Separate workers by approval status
  const pendingWorkers = workers.filter(w => w.approvalStatus === 'PENDING');
  const approvedWorkers = workers.filter(w => w.approvalStatus === 'APPROVED');
  const rejectedWorkers = workers.filter(w => w.approvalStatus === 'REJECTED');

  if (loading) {
    return (
      <div className="workers-page">
        <div className="loading">Loading workers...</div>
      </div>
    );
  }

  return (
    <div className="workers-page">
      <div className="page-header">
        <div>
          <h1>👷 Workers</h1>
          <p>Manage your team members</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          + Add Worker
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Pending Approvals Section */}
      {pendingWorkers.length > 0 && (
        <div className="pending-section">
          <h2 className="section-title">
            🔔 Pending Approvals ({pendingWorkers.length})
          </h2>
          <div className="workers-grid">
            {pendingWorkers.map(worker => (
              <div key={worker.id} className="worker-card pending">
                <div className="pending-badge">PENDING APPROVAL</div>
                <div className="worker-header">
                  {worker.referencePhotoUrl ? (
                    <img 
                      src={worker.referencePhotoUrl} 
                      alt={worker.name}
                      className="worker-photo"
                    />
                  ) : (
                    <div className="worker-avatar">
                      {worker.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="worker-info">
                    <h3>{worker.name}</h3>
                    <p>{worker.phone}</p>
                    {worker.email && <p className="worker-email">{worker.email}</p>}
                  </div>
                </div>

                <div className="worker-details">
                  <div className="detail-row">
                    <span className="label">Requested:</span>
                    <span>{new Date(worker.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Face ID:</span>
                    <span className={`status-badge ${worker.referencePhotoUrl ? 'active' : 'inactive'}`}>
                      {worker.referencePhotoUrl ? '✓ Registered' : 'Not Set'}
                    </span>
                  </div>
                </div>

                <div className="worker-actions approval-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(worker.id)}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(worker.id)}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Workers Section */}
      <div className="active-section">
        <h2 className="section-title">Active Workers ({approvedWorkers.length})</h2>
        <div className="workers-grid">
          {approvedWorkers.map(worker => (
            <div key={worker.id} className={`worker-card ${!worker.isActive ? 'inactive' : ''}`}>
              <div className="worker-header">
                {worker.referencePhotoUrl ? (
                  <img 
                    src={worker.referencePhotoUrl} 
                    alt={worker.name}
                    className="worker-photo"
                  />
                ) : (
                  <div className="worker-avatar">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="worker-info">
                  <h3>{worker.name}</h3>
                  <p>{worker.phone}</p>
                  {worker.email && <p className="worker-email">{worker.email}</p>}
                </div>
              </div>

              <div className="worker-details">
                <div className="detail-row">
                  <span className="label">Role:</span>
                  <span className={`role-badge ${worker.role.toLowerCase()}`}>
                    {worker.role}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${worker.isActive ? 'active' : 'inactive'}`}>
                    {worker.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Face ID:</span>
                  <span className={`status-badge ${worker.referencePhotoUrl ? 'active' : 'inactive'}`}>
                    {worker.referencePhotoUrl ? '✓ Registered' : 'Not Set'}
                  </span>
                </div>
              </div>

              {worker.isActive && (
                <div className="worker-actions">
                  <button
                    className="btn-edit"
                    onClick={() => openEditModal(worker)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeactivate(worker.id)}
                  >
                    Deactivate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rejected Section (collapsed) */}
      {rejectedWorkers.length > 0 && (
        <div className="rejected-section">
          <h2 className="section-title">Rejected ({rejectedWorkers.length})</h2>
          <div className="workers-grid">
            {rejectedWorkers.map(worker => (
              <div key={worker.id} className="worker-card rejected">
                <div className="worker-header">
                  <div className="worker-avatar rejected">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="worker-info">
                    <h3>{worker.name}</h3>
                    <p>{worker.phone}</p>
                  </div>
                </div>
                <div className="worker-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(worker.id)}
                  >
                    ✓ Approve Instead
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="5551234567"
                  required
                />
                <small>
                  {editingWorker 
                    ? '⚠️ Changing this will update the login number for this worker' 
                    : 'Worker will use this to login via SMS code'}
                </small>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="worker@email.com"
                />
                <small>Optional - Used for notifications</small>
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="WORKER">Worker</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference Photo (Face ID)</label>
                <div className="photo-upload-container">
                  {photoPreview ? (
                    <div className="photo-preview">
                      <img src={photoPreview} alt="Reference" />
                      <button 
                        type="button" 
                        className="remove-photo"
                        onClick={() => {
                          setPhotoPreview(null);
                          setFormData({...formData, referencePhoto: null});
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="photo-upload-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                      📷 Upload Photo
                    </label>
                  )}
                </div>
                <small>Optional - First clock-in photo will be used if not set</small>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingWorker ? 'Save Changes' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkersPage;