import { useState, useEffect } from 'react';
import { useFeatures } from '../context/FeatureContext';
import UpgradePrompt from '../components/UpgradePrompt';
import { auditApi } from '../services/api';

function AuditPage() {
  const { hasFeature, loading: featuresLoading } = useFeatures();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (hasFeature('AUDIT_LOGS')) {
      loadLogs();
    }
  }, [filter, hasFeature]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditApi.getLogs({ action: filter || undefined, limit: 100 });
      console.log('Audit response:', response.data);
      
      // Response is { logs: [...], total: n }
      const logsData = response.data?.logs || response.data || [];
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action?.includes('CREATE') || action?.includes('APPROVED')) return '#22c55e';
    if (action?.includes('DELETE') || action?.includes('REJECTED') || action?.includes('DEACTIVATE')) return '#ef4444';
    if (action?.includes('UPDATE') || action?.includes('EDIT')) return '#f59e0b';
    if (action?.includes('LOGIN')) return '#3b82f6';
    return '#a855f7';
  };

  const getActionIcon = (action) => {
    if (action?.includes('CREATE') || action?.includes('USER')) return '👤';
    if (action?.includes('DELETE')) return '🗑️';
    if (action?.includes('UPDATE') || action?.includes('EDIT')) return '✏️';
    if (action?.includes('LOGIN')) return '🔐';
    if (action?.includes('CLOCK')) return '⏰';
    if (action?.includes('APPROVED')) return '✅';
    if (action?.includes('REJECTED')) return '❌';
    return '📋';
  };

  const getPerformerName = (log) => {
    if (log.performer?.name) return log.performer.name;
    if (typeof log.performer === 'string') return log.performer;
    if (log.performerName) return log.performerName;
    if (log.user?.name) return log.user.name;
    return 'System';
  };

  const getDetails = (log) => {
    if (!log.details) return '—';
    if (typeof log.details === 'string') return log.details;
    if (typeof log.details === 'object') {
      try {
        return JSON.stringify(log.details);
      } catch {
        return '—';
      }
    }
    return String(log.details);
  };

  if (featuresLoading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading...</div>;
  }

  if (!hasFeature('AUDIT_LOGS')) {
    return <UpgradePrompt feature="AUDIT_LOGS" requiredPlan="Enterprise" />;
  }

  const actionTypes = [...new Set(logs.map(log => log.action).filter(Boolean))];

  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '5px' }}>
            🔍 Audit Log
          </h1>
          <p style={{ color: '#888' }}>Track all admin actions and changes</p>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '12px 20px', background: '#2a2a3d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', minWidth: '200px' }}
        >
          <option value="" style={{ background: '#2a2a3d', color: '#fff' }}>All Actions</option>
          {actionTypes.map(action => (
            <option key={action} value={action} style={{ background: '#2a2a3d', color: '#fff' }}>{action}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #a855f7', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Total Events</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#a855f7', margin: '5px 0 0 0' }}>{logs.length}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #22c55e', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Creates</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e', margin: '5px 0 0 0' }}>{logs.filter(l => l.action?.includes('CREATE')).length}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Updates</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', margin: '5px 0 0 0' }}>{logs.filter(l => l.action?.includes('UPDATE')).length}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #ef4444', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Deletes</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444', margin: '5px 0 0 0' }}>{logs.filter(l => l.action?.includes('DELETE')).length}</p>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading audit logs...</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={{ textAlign: 'left', color: '#888', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Time</th>
                <th style={{ textAlign: 'left', color: '#888', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Action</th>
                <th style={{ textAlign: 'left', color: '#888', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Performed By</th>
                <th style={{ textAlign: 'left', color: '#888', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((log, index) => (
                <tr key={log.id || index}>
                  <td style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#888', fontSize: '14px' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: `${getActionColor(log.action)}15`,
                      color: getActionColor(log.action),
                    }}>
                      {getActionIcon(log.action)} {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontWeight: '500' }}>
                    {getPerformerName(log)}
                  </td>
                  <td style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#888', fontSize: '14px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getDetails(log)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                    <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>📭</span>
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ textAlign: 'center', color: '#666', marginTop: '20px', fontSize: '14px' }}>
        Showing {logs.length} entries
      </p>
    </div>
  );
}

export default AuditPage;