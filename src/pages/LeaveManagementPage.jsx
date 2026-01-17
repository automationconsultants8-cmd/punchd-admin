import { useState, useEffect } from 'react';
import { leaveApi } from '../services/api';
import './LeaveManagementPage.css';

// SVG Icons
const Icons = {
  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  plus: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  edit: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  check: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  search: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  zap: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  shield: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const CA_DEFAULTS = {
  SICK: { name: 'Sick Leave', annualHours: 40, accrualRate: 0.0333, maxCarryover: 80 },
  VACATION: { name: 'Vacation', annualHours: 80, accrualRate: null, maxCarryover: 120 },
  PTO: { name: 'Paid Time Off', annualHours: 120, accrualRate: null, maxCarryover: 160 },
  BEREAVEMENT: { name: 'Bereavement Leave', annualHours: 24, accrualRate: null, maxCarryover: null },
  JURY_DUTY: { name: 'Jury Duty', annualHours: 40, accrualRate: null, maxCarryover: null },
  CUSTOM: { name: '', annualHours: 0, accrualRate: null, maxCarryover: null },
};

function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [policyModal, setPolicyModal] = useState({ open: false, editing: null });
  const [balanceModal, setBalanceModal] = useState({ open: false, worker: null, balanceId: null });
  const [quickSetupModal, setQuickSetupModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [policyForm, setPolicyForm] = useState({
    type: 'SICK',
    name: 'Sick Leave',
    annualHours: 40,
    accrualRate: 0.0333,
    maxCarryover: 80,
  });

  const [balanceForm, setBalanceForm] = useState({ totalHours: 0, usedHours: 0 });

  const [quickSetupSelections, setQuickSetupSelections] = useState({
    SICK: true,
    VACATION: true,
    PTO: false,
  });

  useEffect(() => { loadData(); }, []);

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

  const handleTypeChange = (type) => {
    const defaults = CA_DEFAULTS[type];
    setPolicyForm({
      type,
      name: defaults.name,
      annualHours: defaults.annualHours,
      accrualRate: defaults.accrualRate || '',
      maxCarryover: defaults.maxCarryover || '',
    });
  };

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
      alert(err.response?.data?.message || 'Failed to save policy');
    }
    setActionLoading(null);
  };

  const handleDeletePolicy = async (policyId) => {
    if (!confirm('Delete this policy and all worker balances?')) return;
    try {
      await leaveApi.deletePolicy(policyId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  const handleApplyPolicyToAll = async (policyId) => {
    if (!confirm('Apply this policy to all active workers?')) return;
    setActionLoading(policyId);
    try {
      const result = await leaveApi.applyPolicyToAll(policyId);
      alert(`Done! Created: ${result.data.created}, Updated: ${result.data.updated}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply policy');
    }
    setActionLoading(null);
  };

  const handleQuickSetup = async () => {
    const selectedTypes = Object.entries(quickSetupSelections)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);

    if (selectedTypes.length === 0) {
      alert('Select at least one leave type');
      return;
    }

    setActionLoading('quick-setup');
    let created = 0;

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
        // Skip if exists
      }
    }

    setQuickSetupModal(false);
    setActionLoading(null);
    if (created > 0) alert(`Created ${created} policies!`);
    loadData();
  };

  const openBalanceModal = (worker, policyType) => {
    const balance = worker.balances?.[policyType];
    setBalanceForm({
      totalHours: balance?.total || 0,
      usedHours: balance?.used || 0,
    });
    const policy = policies.find(p => p.type === policyType);
    setBalanceModal({ open: true, worker, policyType, policyId: policy?.id, balanceId: balance?.id });
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
      });
    } else {
      handleTypeChange('SICK');
    }
    setPolicyModal({ open: true, editing: policy });
  };

  const getLeaveTypeInfo = (type) => LEAVE_TYPES.find(t => t.value === type) || { label: type, color: '#888' };

  const filteredWorkers = workers.filter(w => w.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="leave-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Leave Management</h1>
          <p>Manage leave policies and worker balances</p>
        </div>
        <div className="header-actions">
          {policies.length === 0 ? (
            <button className="btn-primary" onClick={() => setQuickSetupModal(true)}>
              {Icons.zap} Quick Setup
            </button>
          ) : (
            <button className="btn-primary" onClick={() => openPolicyModal()}>
              {Icons.plus} Add Policy
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'policies' ? 'active' : ''}`} onClick={() => setActiveTab('policies')}>
          Policies ({policies.length})
        </button>
        <button className={`tab ${activeTab === 'balances' ? 'active' : ''}`} onClick={() => setActiveTab('balances')}>
          Worker Balances
        </button>
      </div>

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="tab-content">
          {policies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.calendar}</div>
              <h3>No leave policies yet</h3>
              <p>Set up California-compliant leave policies in one click</p>
              <button className="btn-primary" onClick={() => setQuickSetupModal(true)}>
                {Icons.zap} Quick Setup
              </button>
            </div>
          ) : (
            <div className="policies-grid">
              {policies.map(policy => {
                const typeInfo = getLeaveTypeInfo(policy.type);
                return (
                  <div key={policy.id} className="policy-card">
                    <div className="policy-header">
                      <span className="policy-type" style={{ backgroundColor: typeInfo.color }}>{typeInfo.label}</span>
                      <div className="policy-actions">
                        <button className="btn-icon" onClick={() => openPolicyModal(policy)}>{Icons.edit}</button>
                        <button className="btn-icon danger" onClick={() => handleDeletePolicy(policy.id)}>{Icons.trash}</button>
                      </div>
                    </div>
                    <div className="policy-body">
                      <h3>{policy.name}</h3>
                      <div className="policy-stat">
                        <span className="stat-value">{policy.annualHours}</span>
                        <span className="stat-label">hrs/year</span>
                      </div>
                      {policy.accrualRate && <p className="policy-detail">Accrual: {policy.accrualRate} hrs/hr worked</p>}
                      {policy.maxCarryover && <p className="policy-detail">Max Carryover: {policy.maxCarryover} hrs</p>}
                    </div>
                    <div className="policy-footer">
                      <button 
                        className="btn-secondary btn-sm btn-full"
                        onClick={() => handleApplyPolicyToAll(policy.id)}
                        disabled={actionLoading === policy.id}
                      >
                        {Icons.users} {actionLoading === policy.id ? 'Applying...' : 'Apply to All Workers'}
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
          {policies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{Icons.calendar}</div>
              <h3>Create policies first</h3>
              <p>You need leave policies before assigning balances to workers</p>
              <button className="btn-primary" onClick={() => { setActiveTab('policies'); setQuickSetupModal(true); }}>
                {Icons.zap} Quick Setup
              </button>
            </div>
          ) : (
            <>
              <div className="balances-header">
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

              {filteredWorkers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{Icons.users}</div>
                  <h3>No workers found</h3>
                  <p>{searchTerm ? 'Try a different search' : 'Apply policies to workers first'}</p>
                </div>
              ) : (
                <div className="balances-table-wrapper">
                  <table className="balances-table">
                    <thead>
                      <tr>
                        <th>Worker</th>
                        {policies.map(policy => (
                          <th key={policy.id} style={{ color: getLeaveTypeInfo(policy.type).color }}>
                            {policy.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.map(worker => (
                        <tr key={worker.id}>
                          <td className="worker-cell">
                            <div className="worker-avatar">
                              {worker.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="worker-info">
                              <span className="worker-name">{worker.name}</span>
                              <span className="worker-phone">{worker.phone}</span>
                            </div>
                          </td>
                          {policies.map(policy => {
                            const balance = worker.balances?.[policy.type];
                            return (
                              <td key={policy.id} className="balance-cell">
                                {balance ? (
                                  <button className="balance-button" onClick={() => openBalanceModal(worker, policy.type)}>
                                    <span className="balance-available" style={{ color: balance.available > 0 ? '#2D7A4A' : '#B54B4B' }}>
                                      {balance.available.toFixed(1)}
                                    </span>
                                    <span className="balance-total">/ {balance.total.toFixed(1)}</span>
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
            </>
          )}
        </div>
      )}

      {/* Quick Setup Modal */}
      {quickSetupModal && (
        <div className="modal-overlay" onClick={() => setQuickSetupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quick Setup</h2>
              <button className="modal-close" onClick={() => setQuickSetupModal(false)}>{Icons.x}</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">Select leave types to create with California-compliant defaults:</p>
              <div className="quick-setup-options">
                {['SICK', 'VACATION', 'PTO'].map(type => {
                  const defaults = CA_DEFAULTS[type];
                  const typeInfo = getLeaveTypeInfo(type);
                  const exists = policies.some(p => p.type === type);
                  
                  return (
                    <label key={type} className={`quick-option ${quickSetupSelections[type] ? 'selected' : ''} ${exists ? 'disabled' : ''}`}>
                      <input
                        type="checkbox"
                        checked={quickSetupSelections[type]}
                        disabled={exists}
                        onChange={(e) => setQuickSetupSelections(prev => ({ ...prev, [type]: e.target.checked }))}
                      />
                      <span className="option-color" style={{ backgroundColor: typeInfo.color }}></span>
                      <div className="option-info">
                        <strong>{typeInfo.label}</strong>
                        <span>{defaults.annualHours} hrs/year {exists && '(exists)'}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setQuickSetupModal(false)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleQuickSetup}
                disabled={actionLoading === 'quick-setup'}
              >
                {actionLoading === 'quick-setup' ? 'Creating...' : 'Create Policies'}
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
              <h2>{policyModal.editing ? 'Edit Policy' : 'Add Policy'}</h2>
              <button className="modal-close" onClick={() => setPolicyModal({ open: false, editing: null })}>{Icons.x}</button>
            </div>
            <form onSubmit={handlePolicySubmit}>
              <div className="modal-body">
                {!policyModal.editing && (
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select value={policyForm.type} onChange={(e) => handleTypeChange(e.target.value)}>
                      {LEAVE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Policy Name</label>
                  <input
                    type="text"
                    value={policyForm.name}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hours Per Year</label>
                  <input
                    type="number"
                    step="0.5"
                    value={policyForm.annualHours}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, annualHours: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Accrual Rate</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={policyForm.accrualRate}
                      onChange={(e) => setPolicyForm(prev => ({ ...prev, accrualRate: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Carryover</label>
                    <input
                      type="number"
                      step="0.5"
                      value={policyForm.maxCarryover}
                      onChange={(e) => setPolicyForm(prev => ({ ...prev, maxCarryover: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setPolicyModal({ open: false, editing: null })}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading === 'policy'}>
                  {actionLoading === 'policy' ? 'Saving...' : 'Save'}
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
              <button className="modal-close" onClick={() => setBalanceModal({ open: false, worker: null, policyType: null, balanceId: null })}>{Icons.x}</button>
            </div>
            <form onSubmit={handleBalanceSubmit}>
              <div className="modal-body">
                <div className="balance-worker">
                  <strong>{balanceModal.worker.name}</strong>
                  <span className="balance-type" style={{ backgroundColor: getLeaveTypeInfo(balanceModal.policyType).color }}>
                    {getLeaveTypeInfo(balanceModal.policyType).label}
                  </span>
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
                <div className="balance-preview">
                  Available: <strong>{(parseFloat(balanceForm.totalHours || 0) - parseFloat(balanceForm.usedHours || 0)).toFixed(1)} hrs</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setBalanceModal({ open: false, worker: null, policyType: null, balanceId: null })}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading === 'balance'}>
                  {actionLoading === 'balance' ? 'Saving...' : 'Save'}
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