import { useState, useEffect } from 'react';
import { roleManagementApi, jobsApi } from '../services/api';
import './RoleManagementPage.css';

// Icons
const Icons = {
  crown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/>
      <path d="M3 20h18"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  userCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  arrowUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  ),
  arrowDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <polyline points="19 12 12 19 5 12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

const ROLE_CONFIG = {
  OWNER: { icon: Icons.crown, color: '#C9A227', label: 'Owner' },
  ADMIN: { icon: Icons.shield, color: '#6366f1', label: 'Admin' },
  MANAGER: { icon: Icons.userCheck, color: '#10b981', label: 'Manager' },
  WORKER: { icon: Icons.user, color: '#64748b', label: 'Worker' },
};

const PERMISSION_GROUPS = [
  {
    title: 'Time Management',
    permissions: [
      { key: 'canApproveTime', label: 'Approve time entries' },
      { key: 'canEditTimePre', label: 'Edit time before approval' },
      { key: 'canEditTimePost', label: 'Edit time after approval' },
      { key: 'canDeleteTime', label: 'Delete time entries' },
    ],
  },
  {
    title: 'Viewing',
    permissions: [
      { key: 'canViewLaborCosts', label: 'View labor costs' },
      { key: 'canViewAllLocations', label: 'View all locations' },
      { key: 'canViewAllWorkers', label: 'View all workers' },
      { key: 'canViewAnalytics', label: 'View analytics' },
    ],
  },
  {
    title: 'Reports & Exports',
    permissions: [
      { key: 'canExportPayroll', label: 'Export payroll' },
      { key: 'canGenerateReports', label: 'Generate reports' },
    ],
  },
  {
    title: 'Worker Management',
    permissions: [
      { key: 'canOnboardWorkers', label: 'Onboard new workers' },
      { key: 'canDeactivateWorkers', label: 'Deactivate workers' },
      { key: 'canEditWorkerRates', label: 'Edit worker pay rates' },
    ],
  },
  {
    title: 'Scheduling',
    permissions: [
      { key: 'canCreateShifts', label: 'Create shifts' },
      { key: 'canEditShifts', label: 'Edit shifts' },
      { key: 'canDeleteShifts', label: 'Delete shifts' },
      { key: 'canApproveShiftSwaps', label: 'Approve shift swaps' },
      { key: 'canApproveTimeOff', label: 'Approve time off' },
    ],
  },
  {
    title: 'Violations',
    permissions: [
      { key: 'canReviewViolations', label: 'Review violations' },
      { key: 'canWaiveViolations', label: 'Waive violations' },
    ],
  },
];

function RoleManagementPage() {
  const [team, setTeam] = useState({ owners: [], admins: [], managers: [], workers: [] });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [managerDetails, setManagerDetails] = useState(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'MANAGER',
  });
  const [promoteForm, setPromoteForm] = useState({
    userId: '',
    email: '',
    password: '',
    newRole: 'MANAGER',
  });
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isOwner = currentUser.role === 'OWNER';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, locationsRes] = await Promise.all([
        roleManagementApi.getTeam(),
        jobsApi.getAll(),
      ]);
      setTeam(teamRes.data);
      setLocations(locationsRes.data || []);
    } catch (err) {
      setError('Failed to load team data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await roleManagementApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', phone: '', password: '', role: 'MANAGER' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await roleManagementApi.promote(promoteForm);
      setShowPromoteModal(false);
      setPromoteForm({ userId: '', email: '', password: '', newRole: 'MANAGER' });
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote user');
    } finally {
      setSaving(false);
    }
  };

  const handleDemote = async (userId) => {
    if (!confirm('Are you sure you want to demote this user to Worker? They will lose dashboard access.')) {
      return;
    }
    
    try {
      await roleManagementApi.demote(userId);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to demote user');
    }
  };

  const openEditModal = async (manager) => {
    try {
      const res = await roleManagementApi.getManagerDetails(manager.id);
      setManagerDetails(res.data);
      setSelectedUser(manager);
      setShowEditModal(true);
    } catch (err) {
      setError('Failed to load manager details');
    }
  };

  const handlePermissionChange = async (permKey, value) => {
    try {
      await roleManagementApi.updatePermissions(selectedUser.id, { [permKey]: value });
      setManagerDetails(prev => ({
        ...prev,
        permissions: { ...prev.permissions, [permKey]: value },
      }));
    } catch (err) {
      setError('Failed to update permission');
    }
  };

  const handleLocationAssignment = async (locationIds) => {
    try {
      await roleManagementApi.assignLocations(selectedUser.id, { locationIds });
      setManagerDetails(prev => ({
        ...prev,
        assignedLocations: locations.filter(l => locationIds.includes(l.id)).map(l => ({ id: l.id, name: l.name })),
      }));
    } catch (err) {
      setError('Failed to update location assignments');
    }
  };

  const handleWorkerAssignment = async (workerIds) => {
    try {
      await roleManagementApi.assignWorkers(selectedUser.id, { workerIds });
      setManagerDetails(prev => ({
        ...prev,
        assignedWorkers: team.workers.filter(w => workerIds.includes(w.id)).map(w => ({ id: w.id, name: w.name })),
      }));
    } catch (err) {
      setError('Failed to update worker assignments');
    }
  };

  const openPromoteModal = (user, targetRole = 'MANAGER') => {
    setSelectedUser(user);
    // Check if user already has email (managers/admins have it, workers might not)
    const needsEmail = !user.email;
    const needsPassword = targetRole !== user.role; // Only need password if actually changing role
    
    setPromoteForm({
      userId: user.id,
      email: user.email || '',
      password: '',
      newRole: targetRole,
    });
    setShowPromoteModal(true);
  };

  const RoleSection = ({ title, users, roleKey, showActions = true }) => {
    const config = ROLE_CONFIG[roleKey];
    
    return (
      <div className="role-section">
        <div className="role-section-header" style={{ borderLeftColor: config.color }}>
          <span className="role-icon" style={{ color: config.color }}>{config.icon}</span>
          <h3>{title}</h3>
          <span className="role-count">{users.length}</span>
        </div>
        
        {users.length === 0 ? (
          <p className="no-users">No {title.toLowerCase()}</p>
        ) : (
          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <div className="user-avatar" style={{ backgroundColor: config.color }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email || user.phone}</span>
                  </div>
                </div>
                
                {showActions && roleKey !== 'OWNER' && (
                  <div className="user-actions">
                    {roleKey === 'MANAGER' && (
                      <>
                        <button className="btn-icon" onClick={() => openEditModal(user)} title="Edit permissions">
                          {Icons.edit}
                        </button>
                        {isOwner && (
                          <button className="btn-icon btn-success" onClick={() => openPromoteModal(user, 'ADMIN')} title="Promote to Admin">
                            {Icons.arrowUp}
                          </button>
                        )}
                      </>
                    )}
                    {roleKey === 'ADMIN' && isOwner && (
                      <button className="btn-icon btn-success" onClick={() => openPromoteModal(user, 'OWNER')} title="Promote to Owner">
                        {Icons.arrowUp}
                      </button>
                    )}
                    {roleKey !== 'WORKER' && (
                      <button className="btn-icon btn-danger" onClick={() => handleDemote(user.id)} title="Demote to worker">
                        {Icons.arrowDown}
                      </button>
                    )}
                    {roleKey === 'WORKER' && (
                      <button className="btn-icon btn-success" onClick={() => openPromoteModal(user, 'MANAGER')} title="Promote">
                        {Icons.arrowUp}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="role-management-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="role-management-page">
      <div className="page-header">
        <div>
          <h1>Role Management</h1>
          <p>Manage team roles, permissions, and access</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          {Icons.plus}
          <span>Add Manager/Admin</span>
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>{Icons.x}</button>
        </div>
      )}

      <div className="roles-grid">
        <RoleSection title="Owners" users={team.owners} roleKey="OWNER" showActions={false} />
        <RoleSection title="Admins" users={team.admins} roleKey="ADMIN" showActions={isOwner} />
        <RoleSection title="Managers" users={team.managers} roleKey="MANAGER" />
        <RoleSection title="Workers" users={team.workers} roleKey="WORKER" />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Manager/Admin</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>{Icons.x}</button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={createForm.role}
                  onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                >
                  <option value="MANAGER">Manager</option>
                  {isOwner && <option value="ADMIN">Admin</option>}
                </select>
              </div>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="john@company.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+1234567890"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {showPromoteModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowPromoteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Promote {selectedUser.name}</h2>
              <button className="btn-close" onClick={() => setShowPromoteModal(false)}>{Icons.x}</button>
            </div>
            
            <form onSubmit={handlePromote}>
              <div className="promote-info">
                <p>Promoting <strong>{selectedUser.name}</strong> to <strong>{promoteForm.newRole}</strong>.</p>
              </div>
              
              <div className="form-group">
                <label>New Role</label>
                <select
                  value={promoteForm.newRole}
                  onChange={e => setPromoteForm({ ...promoteForm, newRole: e.target.value })}
                >
                  <option value="MANAGER">Manager</option>
                  {isOwner && <option value="ADMIN">Admin</option>}
                  {isOwner && <option value="OWNER">Owner</option>}
                </select>
              </div>
              
              {!selectedUser.email && (
                <div className="form-group">
                  <label>Email (for dashboard login)</label>
                  <input
                    type="email"
                    value={promoteForm.email}
                    onChange={e => setPromoteForm({ ...promoteForm, email: e.target.value })}
                    placeholder="john@company.com"
                    required
                  />
                </div>
              )}
              
              {!selectedUser.email && (
                <div className="form-group">
                  <label>Set Password</label>
                  <input
                    type="password"
                    value={promoteForm.password}
                    onChange={e => setPromoteForm({ ...promoteForm, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                  />
                </div>
              )}

              {selectedUser.email && (
                <div className="promote-info" style={{ marginTop: '12px', background: '#f0fdf4', borderColor: '#22c55e' }}>
                  <p style={{ color: '#15803d', margin: 0 }}>
                    {selectedUser.name} already has dashboard access. Their role will be updated to {promoteForm.newRole}.
                  </p>
                </div>
              )}
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPromoteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Promoting...' : `Promote to ${promoteForm.newRole}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Manager Modal */}
      {showEditModal && selectedUser && managerDetails && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Manager: {selectedUser.name}</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>{Icons.x}</button>
            </div>
            
            <div className="modal-body">
              {/* Permissions */}
              <div className="edit-section">
                <h3>Permissions</h3>
                <div className="permissions-grid">
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.title} className="permission-group">
                      <h4>{group.title}</h4>
                      {group.permissions.map(perm => (
                        <label key={perm.key} className="permission-toggle">
                          <input
                            type="checkbox"
                            checked={managerDetails.permissions?.[perm.key] || false}
                            onChange={e => handlePermissionChange(perm.key, e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                          <span className="toggle-label">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Assignments */}
              <div className="edit-section">
                <h3>Assigned Locations</h3>
                <p className="section-hint">Manager can only see time entries and workers at these locations</p>
                <div className="assignment-list">
                  {locations.map(loc => (
                    <label key={loc.id} className="assignment-checkbox">
                      <input
                        type="checkbox"
                        checked={managerDetails.assignedLocations?.some(l => l.id === loc.id) || false}
                        onChange={e => {
                          const currentIds = managerDetails.assignedLocations?.map(l => l.id) || [];
                          const newIds = e.target.checked
                            ? [...currentIds, loc.id]
                            : currentIds.filter(id => id !== loc.id);
                          handleLocationAssignment(newIds);
                        }}
                      />
                      <span>{loc.name}</span>
                    </label>
                  ))}
                  {locations.length === 0 && <p className="no-items">No locations available</p>}
                </div>
              </div>

              {/* Worker Assignments */}
              <div className="edit-section">
                <h3>Assigned Workers</h3>
                <p className="section-hint">Manager can only manage these workers (leave empty for location-based)</p>
                <div className="assignment-list assignment-list-scroll">
                  {team.workers.map(worker => (
                    <label key={worker.id} className="assignment-checkbox">
                      <input
                        type="checkbox"
                        checked={managerDetails.assignedWorkers?.some(w => w.id === worker.id) || false}
                        onChange={e => {
                          const currentIds = managerDetails.assignedWorkers?.map(w => w.id) || [];
                          const newIds = e.target.checked
                            ? [...currentIds, worker.id]
                            : currentIds.filter(id => id !== worker.id);
                          handleWorkerAssignment(newIds);
                        }}
                      />
                      <span>{worker.name}</span>
                    </label>
                  ))}
                  {team.workers.length === 0 && <p className="no-items">No workers available</p>}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowEditModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagementPage;