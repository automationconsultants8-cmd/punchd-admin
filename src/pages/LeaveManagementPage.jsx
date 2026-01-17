import { useState, useEffect } from 'react';
import { leaveApi } from '../services/api';
import './LeaveManagementPage.css';

// SVG Icons
const Icons = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

const LEAVE_TYPES = [
  { value: 'SICK', label: 'Sick Leave', color: '#E74C3C' },
  { value: 'VACATION', label: 'Vacation', color: '#3498DB' },
  { value: 'PTO', label: 'PTO', color: '#9B59B6' },
  { value: 'BEREAVEMENT', label: 'Bereavement', color: '#34495E' },
  { value: 'JURY_DUTY', label: 'Jury Duty', color: '#1ABC9C' },
  { value: 'CUSTOM', label: 'Custom', color: '#95A5A6' },
];

// California-compliant defaults
const CA_DEFAULTS = {
  SICK: {
    name: 'Sick Leave',
    annualHours: 40,
    accrualRate: 0.0333, // 1hr per 30hrs worked
    maxCarryover: 80,
    description: 'CA requires 40 hrs/year (or 24 hrs minimum with accrual)'
  },
  VACATION: {
    name: 'Vacation',
    annualHours: 80,
    accrualRate: null,
    maxCarryover: 120,
    description: 'Standard 2 weeks vacation'
  },
  PTO: {
    name: 'Paid Time Off',
    annualHours: 120,
    accrualRate: null,
    maxCarryover: 160,
    description: 'Combined sick + vacation (3 weeks)'
  },
  BEREAVEMENT: {
    name: 'Bereavement Leave',
    annualHours: 24,
    accrualRate: null,
    maxCarryover: null,
    description: 'CA requires up to 5 days for close family'
  },
  JURY_DUTY: {
    name: 'Jury Duty',
    annualHours: 40,
    accrualRate: null,
    maxCarryover: null,
    description: 'As needed for jury service'
  },
  CUSTOM: {
    name: '',
    annualHours: 0,
    accrualRate: null,
    maxCarryover: null,
    description: 'Custom leave type'
  },
};

function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [policyModal, setPolicyModal] = useState({ open: false, editing: null });
  const [balanceModal, setBalanceModal] = useState({ open: false, worker: null, balanceId: null });
  const [quickSetupModal, setQuickSetupModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Form states
  const [policyForm, setPolicyForm] = useState({
    type: 'SICK',
    name: 'Sick Leave',
    annualHours: 40,
    accrualRate: 0.0333,
    maxCarryover: 80,
    useDefaults: true,
  });

  const [balanceForm, setBalanceForm] = useState({
    totalHours: 0,
    usedHours: 0,
  });

  // Quick setup selections
  const [quickSetupSelections, setQuickSetupSelections] = useState({
    SICK: true,
    VACATION: true,
    PTO: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policiesRes, summaryRes] = await Promise.all([
        leaveApi.getPolicies(),
        leaveApi.getSummary(),
      ]);
      setPolicies(policiesRes.data || []);
      setWorkers(summaryRes.data || []);
    } catch (err) {
      console.error('Failed to load leave data:', err);
    }
    setLoading(false);
  };

  // Auto-fill when leave type changes
  const handleTypeChange = (type) => {
    const defaults = CA_DEFAULTS[type];
    if (policyForm.useDefaults && defaults) {
      setPolicyForm({
        ...policyForm,
        type,
        name: defaults.name,
        annualHours: defaults.annualHours,
        accrualRate: defaults.accrualRate || '',
        maxCarryover: defaults.maxCarryover || '',
      });
    } else {
      setPolicyForm({ ...policyForm, type });
    }
  };

  // Toggle defaults
  const handleToggleDefaults = (useDefaults) => {
    if (useDefaults) {
      const defaults = CA_DEFAULTS[policyForm.type];
      setPolicyForm({
        ...policyForm,
        useDefaults: true,
        name: defaults.name,
        annualHours: defaults.annualHours,
        accrualRate: defaults.accrualRate || '',
        maxCarryover: defaults.maxCarryover || '',
      });
    } else {
      setPolicyForm({ ...policyForm, useDefaults: false });
    }
  };

  // Policy handlers
  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    setActionLoading('policy');
    try {
      const payload = {
        name: policyForm.name,
        type: policyForm.type,
        annualHours: parseFloat(policyForm.annualHours),
        accrualRate: policyForm.accrualRate ? parseFloat(policyForm.accrualRate) : null,
        maxCarryover: policyForm.maxCarryover ? parseFloat(policyForm.maxCarryover) : null,
      };

      if (policyModal.editing) {
        await leaveApi.updatePolicy(policyModal.editing.id, payload);
      } else {
        await leaveApi.createPolicy(payload);
      }
      setPolicyModal({ open: false, editing: null });
      loadData();
    } catch (err) {
      console.error('Failed to save policy:', err);
      alert(err.response?.data?.message || 'Failed to save policy');
    }
    setActionLoading(null);
  };

  const handleDeletePolicy = async (policyId) => {
    if (!confirm('Are you sure you want to delete this policy? This will also delete all worker balances for this policy.')) return;
    
    try {
      await leaveApi.deletePolicy(policyId);
      loadData();
    } catch (err) {
      console.error('Failed to delete policy:', err);
      alert(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  const handleApplyPolicyToAll = async (policyId) => {
    if (!confirm('This will give ALL active workers this leave allocation. Workers who already have this leave type will have their total hours updated. Continue?')) return;
    
    setActionLoading(policyId);
    try {
      const result = await leaveApi.applyPolicyToAll(policyId);
      alert(`Success! Created: ${result.data.created}, Updated: ${result.data.updated}`);
      loadData();
    } catch (err) {
      console.error('Failed to apply policy:', err);
      alert(err.response?.data?.message || 'Failed to apply policy');
    }
    setActionLoading(null);
  };

  // Quick Setup - create multiple policies at once
  const handleQuickSetup = async () => {
    const selectedTypes = Object.entries(quickSetupSelections)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);

    if (selectedTypes.length === 0) {
      alert('Please select at least one leave type');
      return;
    }

    setActionLoading('quick-setup');
    let created = 0;
    let errors = [];

    for (const type of selectedTypes) {
      const defaults = CA_DEFAULTS[type];
      try {
        await leaveApi.createPolicy({
          name: defaults.name,
          type: type,
          annualHours: defaults.annualHours,
          accrualRate: defaults.accrualRate,
          maxCarryover: defaults.maxCarryover,
        });
        created++;
      } catch (err) {
        // Skip if already exists
        if (err.response?.status === 409 || err.response?.data?.message?.includes('exists')) {
          errors.push(`${defaults.name} already exists`);
        } else {
          errors.push(`Failed to create ${defaults.name}`);
        }
      }
    }

    setQuickSetupModal(false);
    setActionLoading(null);
    
    if (created > 0) {
      alert(`Created ${created} policies!${errors.length ? '\n\nNotes:\n' + errors.join('\n') : ''}`);
    } else if (errors.length) {
      alert('Notes:\n' + errors.join('\n'));
    }
    
    loadData();
  };

  // Balance handlers
  const openBalanceModal = (worker, policyType) => {
    const balance = worker.balances?.[policyType];
    setBalanceForm({
      totalHours: balance?.total || 0,
      usedHours: balance?.used || 0,
    });
    
    // Find the balance ID from the worker's balances
    const policy = policies.find(p => p.type === policyType);
    
    setBalanceModal({ 
      open: true, 
      worker, 
      policyType,
      policyId: policy?.id,
      balanceId: balance?.id 
    });
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('balance');
    try {
      if (balanceModal.balanceId) {
        await leaveApi.updateBalance(balanceModal.balanceId, {
          totalHours: parseFloat(balanceForm.totalHours),
          usedHours: parseFloat(balanceForm.usedHours),
        });
      }
      setBalanceModal({ open: false, worker: null, policyType: null, balanceId: null });
      loadData();
    } catch (err) {
      console.error('Failed to save balance:', err);
      alert(err.response?.data?.message || 'Failed to save balance');
    }
    setActionLoading(null);
  };

  const openPolicyModal = (policy = null) => {
    if (policy) {
      setPolicyForm({
        type: policy.type,
        name: policy.name,
        annualHours: policy.annualHours,
        accrualRate: policy.accrualRate || '',
        maxCarryover: policy.maxCarryover || '',
        useDefaults: false,
      });
    } else {
      const defaults = CA_DEFAULTS['SICK'];
      setPolicyForm({
        type: 'SICK',
        name: defaults.name,
        annualHours: defaults.annualHours,
        accrualRate: defaults.accrualRate || '',
        maxCarryover: defaults.maxCarryover || '',
        useDefaults: true,
      });
    }
    setPolicyModal({ open: true, editing: policy });
  };

  const getLeaveTypeInfo = (type) => LEAVE_TYPES.find(t => t.value === type) || { label: type, color: '#888' };

  const filteredWorkers = workers.filter(w => 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="leave-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <div className="page-icon">{Icons.calendar}</div>
            <h1>Leave Management</h1>
          </div>
          <p>Manage leave policies and worker balances</p>
        </div>
      </div>

      {/* Quick Setup Banner - show only if no policies */}
      {policies.length === 0 && (
        <div className="quick-setup-banner">
          <div className="quick-setup-content">
            <div className="quick-setup-icon">{Icons.zap}</div>
            <div className="quick-setup-text">
              <h3>Quick Setup</h3>
              <p>Set up California-compliant leave policies in one click</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setQuickSetupModal(true)}>
            {Icons.zap}
            <span>Quick Setup</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          Company Policies
        </button>
        <button 
          className={`tab ${activeTab === 'balances' ? 'active' : ''}`}
          onClick={() => setActiveTab('balances')}
        >
          Worker Balances
        </button>
      </div>

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Leave Policies</h2>
            <div className="section-actions">
              {policies.length > 0 && (
                <button 
                  className="btn-secondary"
                  onClick={() => setQuickSetupModal(true)}
                >
                  {Icons.zap}
                  <span>Quick Setup</span>
                </button>
              )}
              <button className="btn-primary" onClick={() => openPolicyModal()}>
                {Icons.plus}
                <span>Add Policy</span>
              </button>
            </div>
          </div>

          {policies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.calendar}</div>
              <h3>No leave policies yet</h3>
              <p>Create your first leave policy to start tracking leave balances</p>
              <div className="empty-actions">
                <button className="btn-primary" onClick={() => setQuickSetupModal(true)}>
                  {Icons.zap}
                  <span>Quick Setup (Recommended)</span>
                </button>
                <button className="btn-secondary" onClick={() => openPolicyModal()}>
                  {Icons.plus}
                  <span>Add Custom Policy</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="policies-grid">
              {policies.map(policy => {
                const typeInfo = getLeaveTypeInfo(policy.type);
                return (
                  <div key={policy.id} className="policy-card">
                    <div className="policy-header">
                      <div className="policy-type" style={{ backgroundColor: typeInfo.color }}>
                        {typeInfo.label}
                      </div>
                      <div className="policy-actions">
                        <button className="btn-icon" onClick={() => openPolicyModal(policy)} title="Edit">
                          {Icons.edit}
                        </button>
                        <button className="btn-icon danger" onClick={() => handleDeletePolicy(policy.id)} title="Delete">
                          {Icons.trash}
                        </button>
                      </div>
                    </div>
                    <div className="policy-body">
                      <h3>{policy.name}</h3>
                      <div className="policy-stat">
                        <span className="stat-value">{policy.annualHours}</span>
                        <span className="stat-label">hours/year</span>
                      </div>
                      {policy.accrualRate && (
                        <div className="policy-detail">
                          Accrual: {policy.accrualRate} hrs/hr worked
                        </div>
                      )}
                      {policy.maxCarryover && (
                        <div className="policy-detail">
                          Max Carryover: {policy.maxCarryover} hrs
                        </div>
                      )}
                      <div className="policy-detail muted">
                        {policy._count?.balances || 0} workers assigned
                      </div>
                    </div>
                    <div className="policy-footer">
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => handleApplyPolicyToAll(policy.id)}
                        disabled={actionLoading === policy.id}
                      >
                        {Icons.users}
                        <span>{actionLoading === policy.id ? 'Applying...' : 'Apply to All Workers'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Worker Balances</h2>
            <div className="search-box">
              <span className="search-icon">{Icons.search}</span>
              <input
                type="text"
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {policies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.calendar}</div>
              <h3>No policies created yet</h3>
              <p>Create leave policies first, then apply them to workers</p>
              <button className="btn-primary" onClick={() => { setActiveTab('policies'); setQuickSetupModal(true); }}>
                {Icons.zap}
                <span>Quick Setup Policies</span>
              </button>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.users}</div>
              <h3>No workers found</h3>
              <p>{searchTerm ? 'Try a different search' : 'Add workers and apply leave policies'}</p>
            </div>
          ) : (
            <div className="balances-table-wrapper">
              <table className="balances-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    {policies.map(policy => (
                      <th key={policy.id}>
                        <span className="th-label" style={{ color: getLeaveTypeInfo(policy.type).color }}>
                          {policy.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map(worker => (
                    <tr key={worker.id}>
                      <td className="worker-cell">
                        <div className="worker-avatar">
                          {worker.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="worker-info">
                          <span className="worker-name">{worker.name}</span>
                          <span className="worker-phone">{worker.phone}</span>
                        </div>
                      </td>
                      {policies.map(policy => {
                        const balance = worker.balances?.[policy.type];
                        const available = balance ? balance.available : null;
                        const total = balance ? balance.total : null;
                        const used = balance ? balance.used : 0;
                        
                        return (
                          <td key={policy.id} className="balance-cell">
                            {balance ? (
                              <button 
                                className="balance-button"
                                onClick={() => openBalanceModal(worker, policy.type)}
                              >
                                <span className="balance-available" style={{ color: available > 0 ? '#2D7A4A' : '#B54B4B' }}>
                                  {available.toFixed(1)}
                                </span>
                                <span className="balance-total">/ {total.toFixed(1)} hrs</span>
                                {used > 0 && <span className="balance-used">({used.toFixed(1)} used)</span>}
                              </button>
                            ) : (
                              <span className="no-balance">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quick Setup Modal */}
      {quickSetupModal && (
        <div className="modal-overlay" onClick={() => setQuickSetupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{Icons.zap} Quick Setup</h2>
              <button className="modal-close" onClick={() => setQuickSetupModal(false)}>
                {Icons.x}
              </button>
            </div>
            <div className="modal-body">
              <div className="quick-setup-info">
                <div className="info-badge">
                  {Icons.shield}
                  <span>California Compliant</span>
                </div>
                <p>Select the leave policies you want to create. All values are pre-configured for California compliance.</p>
              </div>

              <div className="quick-setup-options">
                {['SICK', 'VACATION', 'PTO'].map(type => {
                  const defaults = CA_DEFAULTS[type];
                  const typeInfo = getLeaveTypeInfo(type);
                  const alreadyExists = policies.some(p => p.type === type);
                  
                  return (
                    <label 
                      key={type} 
                      className={`quick-setup-option ${quickSetupSelections[type] ? 'selected' : ''} ${alreadyExists ? 'disabled' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={quickSetupSelections[type]}
                        disabled={alreadyExists}
                        onChange={(e) => setQuickSetupSelections(prev => ({ ...prev, [type]: e.target.checked }))}
                      />
                      <div className="option-content">
                        <div className="option-header">
                          <span className="option-type" style={{ backgroundColor: typeInfo.color }}>{typeInfo.label}</span>
                          {alreadyExists && <span className="exists-badge">Already exists</span>}
                        </div>
                        <div className="option-details">
                          <strong>{defaults.annualHours} hrs/year</strong>
                          {defaults.accrualRate && <span> • Accrues {(defaults.accrualRate * 30).toFixed(1)} hr per 30 hrs worked</span>}
                          {defaults.maxCarryover && <span> • Max {defaults.maxCarryover} hrs carryover</span>}
                        </div>
                        <p className="option-description">{defaults.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setQuickSetupModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleQuickSetup}
                disabled={actionLoading === 'quick-setup' || !Object.values(quickSetupSelections).some(v => v)}
              >
                {Icons.check}
                <span>{actionLoading === 'quick-setup' ? 'Creating...' : 'Create Policies'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {policyModal.open && (
        <div className="modal-overlay" onClick={() => setPolicyModal({ open: false, editing: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{policyModal.editing ? 'Edit Policy' : 'Add Leave Policy'}</h2>
              <button className="modal-close" onClick={() => setPolicyModal({ open: false, editing: null })}>
                {Icons.x}
              </button>
            </div>
            <form onSubmit={handlePolicySubmit}>
              <div className="modal-body">
                {!policyModal.editing && (
                  <>
                    <div className="form-group">
                      <label>Leave Type</label>
                      <select 
                        value={policyForm.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                      >
                        {LEAVE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="defaults-toggle">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={policyForm.useDefaults}
                          onChange={(e) => handleToggleDefaults(e.target.checked)}
                        />
                        <span className="toggle-text">
                          {Icons.shield}
                          Use California defaults
                        </span>
                      </label>
                      {policyForm.useDefaults && CA_DEFAULTS[policyForm.type]?.description && (
                        <p className="defaults-hint">{CA_DEFAULTS[policyForm.type].description}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Policy Name</label>
                  <input
                    type="text"
                    value={policyForm.name}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sick Leave"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hours Per Year *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={policyForm.annualHours}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, annualHours: e.target.value }))}
                    placeholder="40"
                    required
                  />
                  {policyForm.type === 'SICK' && (
                    <span className="form-hint">California minimum is 24 hours (40 recommended)</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Accrual Rate (optional)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={policyForm.accrualRate}
                      onChange={(e) => setPolicyForm(prev => ({ ...prev, accrualRate: e.target.value }))}
                      placeholder="0.0333"
                    />
                    <span className="form-hint">Hrs earned per hr worked (0.0333 = 1hr/30hrs)</span>
                  </div>
                  <div className="form-group">
                    <label>Max Carryover (optional)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={policyForm.maxCarryover}
                      onChange={(e) => setPolicyForm(prev => ({ ...prev, maxCarryover: e.target.value }))}
                      placeholder="80"
                    />
                    <span className="form-hint">Max hours to roll over yearly</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setPolicyModal({ open: false, editing: null })}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading === 'policy'}>
                  {Icons.check}
                  <span>{actionLoading === 'policy' ? 'Saving...' : (policyModal.editing ? 'Save Changes' : 'Create Policy')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {balanceModal.open && balanceModal.worker && (
        <div className="modal-overlay" onClick={() => setBalanceModal({ open: false, worker: null, policyType: null, balanceId: null })}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Balance</h2>
              <button className="modal-close" onClick={() => setBalanceModal({ open: false, worker: null, policyType: null, balanceId: null })}>
                {Icons.x}
              </button>
            </div>
            <form onSubmit={handleBalanceSubmit}>
              <div className="modal-body">
                <div className="balance-modal-header">
                  <div className="worker-avatar">
                    {balanceModal.worker.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <strong>{balanceModal.worker.name}</strong>
                    <span className="leave-type-badge" style={{ backgroundColor: getLeaveTypeInfo(balanceModal.policyType).color }}>
                      {getLeaveTypeInfo(balanceModal.policyType).label}
                    </span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Total Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={balanceForm.totalHours}
                      onChange={(e) => setBalanceForm(prev => ({ ...prev, totalHours: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Used Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={balanceForm.usedHours}
                      onChange={(e) => setBalanceForm(prev => ({ ...prev, usedHours: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="balance-summary">
                  <span>Available:</span>
                  <strong>{(parseFloat(balanceForm.totalHours || 0) - parseFloat(balanceForm.usedHours || 0)).toFixed(1)} hours</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setBalanceModal({ open: false, worker: null, policyType: null, balanceId: null })}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading === 'balance'}>
                  {Icons.check}
                  <span>{actionLoading === 'balance' ? 'Saving...' : 'Save Balance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagementPage;