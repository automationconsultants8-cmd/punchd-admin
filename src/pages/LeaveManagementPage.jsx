import { useState, useEffect } from 'react';
import { leaveApi, usersApi } from '../services/api';
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
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

const LEAVE_TYPES = [
  { value: 'SICK', label: 'Sick Leave', color: '#E74C3C' },
  { value: 'VACATION', label: 'Vacation', color: '#3498DB' },
  { value: 'PTO', label: 'PTO', color: '#9B59B6' },
  { value: 'BEREAVEMENT', label: 'Bereavement', color: '#34495E' },
  { value: 'JURY_DUTY', label: 'Jury Duty', color: '#1ABC9C' },
  { value: 'UNPAID', label: 'Unpaid', color: '#95A5A6' },
];

function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [policyModal, setPolicyModal] = useState({ open: false, editing: null });
  const [balanceModal, setBalanceModal] = useState({ open: false, worker: null, leaveType: null });
  const [actionLoading, setActionLoading] = useState(null);

  // Form states
  const [policyForm, setPolicyForm] = useState({
    leaveType: 'SICK',
    name: 'Sick Leave',
    hoursPerYear: 24,
    accrualRate: '',
    maxCarryover: '',
    maxBalance: '',
  });

  const [balanceForm, setBalanceForm] = useState({
    totalHours: 0,
    usedHours: 0,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policiesRes, workersRes] = await Promise.all([
        leaveApi.getPolicies(),
        leaveApi.getWorkersSummary(),
      ]);
      setPolicies(policiesRes.data || []);
      setWorkers(workersRes.data || []);
    } catch (err) {
      console.error('Failed to load leave data:', err);
    }
    setLoading(false);
  };

  // Policy handlers
  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    setActionLoading('policy');
    try {
      if (policyModal.editing) {
        await leaveApi.updatePolicy(policyModal.editing.id, {
          name: policyForm.name,
          hoursPerYear: parseFloat(policyForm.hoursPerYear),
          accrualRate: policyForm.accrualRate ? parseFloat(policyForm.accrualRate) : null,
          maxCarryover: policyForm.maxCarryover ? parseFloat(policyForm.maxCarryover) : null,
          maxBalance: policyForm.maxBalance ? parseFloat(policyForm.maxBalance) : null,
        });
      } else {
        await leaveApi.createPolicy({
          leaveType: policyForm.leaveType,
          name: policyForm.name,
          hoursPerYear: parseFloat(policyForm.hoursPerYear),
          accrualRate: policyForm.accrualRate ? parseFloat(policyForm.accrualRate) : null,
          maxCarryover: policyForm.maxCarryover ? parseFloat(policyForm.maxCarryover) : null,
          maxBalance: policyForm.maxBalance ? parseFloat(policyForm.maxBalance) : null,
        });
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
    if (!confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      await leaveApi.deletePolicy(policyId);
      loadData();
    } catch (err) {
      console.error('Failed to delete policy:', err);
      alert(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  const handleApplyPolicyToAll = async (policyId) => {
    if (!confirm('This will apply this leave allocation to ALL active workers. Continue?')) return;
    
    setActionLoading(policyId);
    try {
      const result = await leaveApi.applyPolicyToAll(policyId);
      alert(`Applied to ${result.data.created} workers`);
      loadData();
    } catch (err) {
      console.error('Failed to apply policy:', err);
      alert(err.response?.data?.message || 'Failed to apply policy');
    }
    setActionLoading(null);
  };

  const handleApplyAllPolicies = async () => {
    if (!confirm('This will apply ALL policies to ALL active workers. Continue?')) return;
    
    setActionLoading('apply-all');
    try {
      const result = await leaveApi.applyAllToAll();
      alert(`Created ${result.data.created} balances for ${result.data.workers} workers`);
      loadData();
    } catch (err) {
      console.error('Failed to apply policies:', err);
      alert(err.response?.data?.message || 'Failed to apply policies');
    }
    setActionLoading(null);
  };

  // Balance handlers
  const openBalanceModal = (worker, leaveType) => {
    const balance = worker.balances[leaveType] || { total: 0, used: 0 };
    setBalanceForm({
      totalHours: balance.total,
      usedHours: balance.used,
      notes: '',
    });
    setBalanceModal({ open: true, worker, leaveType });
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('balance');
    try {
      await leaveApi.setBalance({
        userId: balanceModal.worker.id,
        leaveType: balanceModal.leaveType,
        totalHours: parseFloat(balanceForm.totalHours),
        usedHours: parseFloat(balanceForm.usedHours),
        notes: balanceForm.notes || undefined,
      });
      setBalanceModal({ open: false, worker: null, leaveType: null });
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
        leaveType: policy.leaveType,
        name: policy.name,
        hoursPerYear: Number(policy.hoursPerYear),
        accrualRate: policy.accrualRate ? Number(policy.accrualRate) : '',
        maxCarryover: policy.maxCarryover ? Number(policy.maxCarryover) : '',
        maxBalance: policy.maxBalance ? Number(policy.maxBalance) : '',
      });
    } else {
      setPolicyForm({
        leaveType: 'SICK',
        name: 'Sick Leave',
        hoursPerYear: 24,
        accrualRate: '',
        maxCarryover: '',
        maxBalance: '',
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
              <button 
                className="btn-secondary"
                onClick={handleApplyAllPolicies}
                disabled={policies.length === 0 || actionLoading === 'apply-all'}
              >
                {Icons.users}
                <span>{actionLoading === 'apply-all' ? 'Applying...' : 'Apply All to All Workers'}</span>
              </button>
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
              <button className="btn-primary" onClick={() => openPolicyModal()}>
                {Icons.plus}
                <span>Add Policy</span>
              </button>
            </div>
          ) : (
            <div className="policies-grid">
              {policies.map(policy => {
                const typeInfo = getLeaveTypeInfo(policy.leaveType);
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
                        <span className="stat-value">{Number(policy.hoursPerYear)}</span>
                        <span className="stat-label">hours/year</span>
                      </div>
                      {policy.accrualRate && (
                        <div className="policy-detail">
                          Accrual: {Number(policy.accrualRate)} hrs/hr worked
                        </div>
                      )}
                      {policy.maxCarryover && (
                        <div className="policy-detail">
                          Max Carryover: {Number(policy.maxCarryover)} hrs
                        </div>
                      )}
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

          {filteredWorkers.length === 0 ? (
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
                        <span className="th-label" style={{ color: getLeaveTypeInfo(policy.leaveType).color }}>
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
                        const balance = worker.balances[policy.leaveType];
                        const available = balance ? balance.available : 0;
                        const total = balance ? balance.total : 0;
                        const used = balance ? balance.used : 0;
                        
                        return (
                          <td key={policy.id} className="balance-cell">
                            <button 
                              className="balance-button"
                              onClick={() => openBalanceModal(worker, policy.leaveType)}
                            >
                              <span className="balance-available" style={{ color: available > 0 ? '#2D7A4A' : '#B54B4B' }}>
                                {available.toFixed(1)}
                              </span>
                              <span className="balance-total">/ {total.toFixed(1)} hrs</span>
                              {used > 0 && <span className="balance-used">({used.toFixed(1)} used)</span>}
                            </button>
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
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select 
                      value={policyForm.leaveType}
                      onChange={(e) => {
                        const type = LEAVE_TYPES.find(t => t.value === e.target.value);
                        setPolicyForm(prev => ({ 
                          ...prev, 
                          leaveType: e.target.value,
                          name: type?.label || e.target.value
                        }));
                      }}
                    >
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
                    placeholder="e.g., Sick Leave"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hours Per Year *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={policyForm.hoursPerYear}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, hoursPerYear: e.target.value }))}
                    placeholder="24"
                    required
                  />
                  <span className="form-hint">California minimum for sick leave is 24 hours</span>
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
                    <span className="form-hint">Hours earned per hour worked</span>
                  </div>
                  <div className="form-group">
                    <label>Max Carryover (optional)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={policyForm.maxCarryover}
                      onChange={(e) => setPolicyForm(prev => ({ ...prev, maxCarryover: e.target.value }))}
                      placeholder="48"
                    />
                    <span className="form-hint">Max hours to roll over</span>
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
        <div className="modal-overlay" onClick={() => setBalanceModal({ open: false, worker: null, leaveType: null })}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Balance</h2>
              <button className="modal-close" onClick={() => setBalanceModal({ open: false, worker: null, leaveType: null })}>
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
                    <span className="leave-type-badge" style={{ backgroundColor: getLeaveTypeInfo(balanceModal.leaveType).color }}>
                      {getLeaveTypeInfo(balanceModal.leaveType).label}
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
                  <strong>{(parseFloat(balanceForm.totalHours) - parseFloat(balanceForm.usedHours)).toFixed(1)} hours</strong>
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={balanceForm.notes}
                    onChange={(e) => setBalanceForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Reason for adjustment..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setBalanceModal({ open: false, worker: null, leaveType: null })}>
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