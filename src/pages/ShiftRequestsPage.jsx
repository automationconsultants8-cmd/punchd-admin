import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { shiftRequestsApi, timeOffApi } from '../services/api';
import './ShiftRequestsPage.css';

function ShiftRequestsPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('time-off') ? 'timeoff' : 'shifts'
  );
  const [shiftRequests, setShiftRequests] = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseAction, setResponseAction] = useState('');
  const [responseNotes, setResponseNotes] = useState('');
  const [filter, setFilter] = useState('PENDING');
  const [stats, setStats] = useState({ shifts: {}, timeOff: {} });

  // Update tab when URL changes
  useEffect(() => {
    setActiveTab(location.pathname.includes('time-off') ? 'timeoff' : 'shifts');
  }, [location.pathname]);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [shiftRes, timeOffRes, shiftStats, timeOffStats] = await Promise.all([
        shiftRequestsApi.getAll({ status: filter !== 'ALL' ? filter : undefined }),
        timeOffApi.getAll({ status: filter !== 'ALL' ? filter : undefined }),
        shiftRequestsApi.getStats(),
        timeOffApi.getStats(),
      ]);

      setShiftRequests(shiftRes.data);
      setTimeOffRequests(timeOffRes.data);
      setStats({
        shifts: shiftStats.data,
        timeOff: timeOffStats.data,
      });
    } catch (err) {
      setError('Failed to load requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openResponseModal = (request, action, type) => {
    setSelectedRequest({ ...request, type });
    setResponseAction(action);
    setResponseNotes('');
    setShowResponseModal(true);
  };

  const handleResponse = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(selectedRequest.id);
      
      const api = selectedRequest.type === 'shift' ? shiftRequestsApi : timeOffApi;
      
      if (responseAction === 'approve') {
        await api.approve(selectedRequest.id, responseNotes || undefined);
      } else {
        await api.decline(selectedRequest.id, responseNotes || undefined);
      }

      setShowResponseModal(false);
      setSelectedRequest(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${responseAction} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const quickApprove = async (request, type) => {
    try {
      setActionLoading(request.id);
      const api = type === 'shift' ? shiftRequestsApi : timeOffApi;
      await api.approve(request.id);
      loadData();
    } catch (err) {
      setError(`Failed to approve request`);
    } finally {
      setActionLoading(null);
    }
  };

  const quickDecline = async (request, type) => {
    openResponseModal(request, 'decline', type);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(start);
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRequestTypeBadge = (type) => {
    const badges = {
      DROP: { label: 'Drop', className: 'badge-drop' },
      SWAP: { label: 'Swap', className: 'badge-swap' },
      PTO: { label: 'PTO', className: 'badge-pto' },
      SICK: { label: 'Sick', className: 'badge-sick' },
      UNPAID: { label: 'Unpaid', className: 'badge-unpaid' },
      BEREAVEMENT: { label: 'Bereavement', className: 'badge-bereavement' },
      JURY_DUTY: { label: 'Jury Duty', className: 'badge-jury' },
      OTHER: { label: 'Other', className: 'badge-other' },
    };
    return badges[type] || { label: type, className: 'badge-other' };
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { label: 'Pending', className: 'status-pending' },
      APPROVED: { label: 'Approved', className: 'status-approved' },
      DECLINED: { label: 'Declined', className: 'status-declined' },
      CANCELLED: { label: 'Cancelled', className: 'status-cancelled' },
    };
    return badges[status] || { label: status, className: '' };
  };

  const totalPending = (stats.shifts?.pending || 0) + (stats.timeOff?.pending || 0);

  if (loading && shiftRequests.length === 0 && timeOffRequests.length === 0) {
    return (
      <div className="requests-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="requests-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1>Requests</h1>
          <p>Manage shift changes and time off requests</p>
        </div>
        {totalPending > 0 && (
          <div className="pending-summary">
            <span className="pending-count">{totalPending}</span>
            <span className="pending-label">pending</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Tabs & Filter */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'shifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shifts')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>
            </svg>
            Shift Requests
            {stats.shifts?.pending > 0 && (
              <span className="tab-badge">{stats.shifts.pending}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'timeoff' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeoff')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="9" y1="16" x2="15" y2="16"/>
            </svg>
            Time Off
            {stats.timeOff?.pending > 0 && (
              <span className="tab-badge">{stats.timeOff.pending}</span>
            )}
          </button>
        </div>

        <div className="filter-group">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DECLINED">Declined</option>
            <option value="ALL">All</option>
          </select>
        </div>
      </div>

      {/* Shift Requests Tab */}
      {activeTab === 'shifts' && (
        <div className="requests-list">
          {shiftRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>
                </svg>
              </div>
              <h3>No shift requests</h3>
              <p>
                {filter === 'PENDING'
                  ? 'No pending shift requests at this time'
                  : `No ${filter.toLowerCase()} shift requests found`}
              </p>
            </div>
          ) : (
            shiftRequests.map((request) => {
              const typeBadge = getRequestTypeBadge(request.requestType);
              const statusBadge = getStatusBadge(request.status);
              const isLoading = actionLoading === request.id;

              return (
                <div key={request.id} className={`request-card ${request.status.toLowerCase()}`}>
                  <div className="request-main">
                    <div className="request-avatar" style={{ background: `linear-gradient(135deg, #4B7BB5, #6B8FC5)` }}>
                      {getInitials(request.requester?.name || 'UN')}
                    </div>
                    
                    <div className="request-content">
                      <div className="request-header">
                        <span className="request-name">{request.requester?.name}</span>
                        <span className={`request-type-badge ${typeBadge.className}`}>
                          {typeBadge.label}
                        </span>
                        {request.status !== 'PENDING' && (
                          <span className={`request-status-badge ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                        )}
                      </div>
                      
                      <div className="request-details">
                        <div className="request-shift-info">
                          <span className="shift-date">{formatDate(request.shift?.shiftDate)}</span>
                          <span className="shift-time">
                            {formatTime(request.shift?.startTime)} - {formatTime(request.shift?.endTime)}
                          </span>
                          <span className="shift-job">{request.shift?.job?.name}</span>
                        </div>
                        
                        {request.requestType === 'SWAP' && request.swapTarget && (
                          <div className="swap-target">
                            <span>Swap with:</span>
                            <strong>{request.swapTarget.name}</strong>
                          </div>
                        )}
                      </div>
                      
                      {request.reason && (
                        <div className="request-reason">"{request.reason}"</div>
                      )}

                      {request.reviewerNotes && (
                        <div className="reviewer-notes">
                          <span>Response:</span> {request.reviewerNotes}
                        </div>
                      )}
                    </div>

                    <div className="request-meta">
                      <span className="request-time">{getTimeAgo(request.createdAt)}</span>
                    </div>
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="request-actions">
                      <button
                        className="btn-approve"
                        onClick={() => quickApprove(request, 'shift')}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="btn-spinner"></span>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => quickDecline(request, 'shift')}
                        disabled={isLoading}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Time Off Tab */}
      {activeTab === 'timeoff' && (
        <div className="requests-list">
          {timeOffRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>No time off requests</h3>
              <p>
                {filter === 'PENDING'
                  ? 'No pending time off requests at this time'
                  : `No ${filter.toLowerCase()} time off requests found`}
              </p>
            </div>
          ) : (
            timeOffRequests.map((request) => {
              const typeBadge = getRequestTypeBadge(request.timeOffType);
              const statusBadge = getStatusBadge(request.status);
              const isLoading = actionLoading === request.id;

              // Calculate days
              const startDate = new Date(request.startDate);
              const endDate = new Date(request.endDate);
              const diffTime = Math.abs(endDate - startDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

              return (
                <div key={request.id} className={`request-card ${request.status.toLowerCase()}`}>
                  <div className="request-main">
                    <div className="request-avatar" style={{ background: `linear-gradient(135deg, #6B5B7A, #8B7A9E)` }}>
                      {getInitials(request.requester?.name || 'UN')}
                    </div>
                    
                    <div className="request-content">
                      <div className="request-header">
                        <span className="request-name">{request.requester?.name}</span>
                        <span className={`request-type-badge ${typeBadge.className}`}>
                          {typeBadge.label}
                        </span>
                        {request.status !== 'PENDING' && (
                          <span className={`request-status-badge ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                        )}
                      </div>
                      
                      <div className="request-details">
                        <div className="timeoff-info">
                          <span className="timeoff-dates">{formatDateRange(request.startDate, request.endDate)}</span>
                          <span className="timeoff-days">{diffDays} day{diffDays > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      {request.reason && (
                        <div className="request-reason">"{request.reason}"</div>
                      )}

                      {request.reviewerNotes && (
                        <div className="reviewer-notes">
                          <span>Response:</span> {request.reviewerNotes}
                        </div>
                      )}
                    </div>

                    <div className="request-meta">
                      <span className="request-time">{getTimeAgo(request.createdAt)}</span>
                    </div>
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="request-actions">
                      <button
                        className="btn-approve"
                        onClick={() => quickApprove(request, 'timeoff')}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="btn-spinner"></span>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => quickDecline(request, 'timeoff')}
                        disabled={isLoading}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{responseAction === 'approve' ? 'Approve' : 'Decline'} Request</h2>
              <button className="modal-close" onClick={() => setShowResponseModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-request-summary">
                <div className="summary-row">
                  <span className="summary-label">Worker:</span>
                  <span className="summary-value">{selectedRequest.requester?.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Type:</span>
                  <span className="summary-value">
                    {selectedRequest.type === 'shift' 
                      ? `${selectedRequest.requestType} Shift`
                      : selectedRequest.timeOffType}
                  </span>
                </div>
                {selectedRequest.reason && (
                  <div className="summary-row">
                    <span className="summary-label">Reason:</span>
                    <span className="summary-value">"{selectedRequest.reason}"</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Response Note {responseAction === 'decline' && <span className="required">*</span>}</label>
                <textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder={
                    responseAction === 'approve'
                      ? 'Optional note to worker...'
                      : 'Provide a reason for declining...'
                  }
                  rows="3"
                  required={responseAction === 'decline'}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </button>
              <button
                className={responseAction === 'approve' ? 'btn-approve-lg' : 'btn-decline-lg'}
                onClick={handleResponse}
                disabled={responseAction === 'decline' && !responseNotes.trim()}
              >
                {responseAction === 'approve' ? 'Approve Request' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftRequestsPage;