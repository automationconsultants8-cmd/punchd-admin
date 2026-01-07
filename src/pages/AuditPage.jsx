import { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import { withFeatureGate } from '../components/FeatureGate';
import './AuditPage.css';

// SVG Icons
const Icons = {
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
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
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
};

const getActionIcon = (action) => {
  if (action?.includes('CREATE') || action?.includes('GENERATED')) return Icons.plus;
  if (action?.includes('UPDATE') || action?.includes('EDIT')) return Icons.edit;
  if (action?.includes('DELETE') || action?.includes('REMOVE')) return Icons.trash;
  if (action?.includes('APPROVE') || action?.includes('WAIVE')) return Icons.check;
  return Icons.activity;
};

const getActionColor = (action) => {
  if (action?.includes('CREATE') || action?.includes('GENERATED')) return 'green';
  if (action?.includes('UPDATE') || action?.includes('EDIT')) return 'blue';
  if (action?.includes('DELETE') || action?.includes('REMOVE')) return 'red';
  if (action?.includes('APPROVE') || action?.includes('WAIVE')) return 'gold';
  return 'gray';
};

function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [filter, page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter !== 'all') params.action = filter;
      const response = await auditApi.getLogs(params);
      setLogs(response.data?.logs || response.data || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const stats = {
    total: logs.length,
    creates: logs.filter(l => l.action?.includes('CREATE') || l.action?.includes('GENERATED')).length,
    updates: logs.filter(l => l.action?.includes('UPDATE') || l.action?.includes('EDIT') || l.action?.includes('APPROVE') || l.action?.includes('WAIVE')).length,
    deletes: logs.filter(l => l.action?.includes('DELETE')).length,
  };

  return (
    <div className="audit-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <div className="page-icon">{Icons.activity}</div>
            <h1>Audit Log</h1>
          </div>
          <p>Track all admin actions and changes</p>
        </div>
        <div className="filter-group">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            <option value="all">All Actions</option>
            <option value="CREATE">Creates</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletes</option>
            <option value="APPROVE">Approvals</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold">{Icons.list}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.plus}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.creates}</div>
            <div className="stat-label">Creates</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">{Icons.edit}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.updates}</div>
            <div className="stat-label">Updates</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">{Icons.trash}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.deletes}</div>
            <div className="stat-label">Deletes</div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{Icons.activity}</div>
          <h3>No audit logs found</h3>
          <p>Actions will appear here as they occur</p>
        </div>
      ) : (
        <>
          <div className="audit-table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td className="time-cell">{formatTime(log.createdAt || log.timestamp)}</td>
                    <td>
                      <span className={`action-badge ${getActionColor(log.action)}`}>
                        <span className="action-icon">{getActionIcon(log.action)}</span>
                        {log.action}
                      </span>
                    </td>
                    <td className="user-cell">{log.performedBy || log.user?.name || 'System'}</td>
                    <td className="details-cell">{typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span className="total-count">Showing {logs.length} entries</span>
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                {Icons.chevronLeft} Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next {Icons.chevronRight}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default withFeatureGate(AuditPage, 'AUDIT_LOGS');