import { useState, useEffect } from 'react';
import { timeEntriesApi } from '../services/api';
import './AnalyticsPage.css';

// SVG Icons
const Icons = {
  dollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  trendingUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4c0-.27.1-.52.3-.71.2-.2.44-.29.7-.29h10c.27 0 .52.1.71.29.2.2.29.45.29.71v18"/>
      <path d="M6 12H4c-.27 0-.52.1-.71.29-.2.2-.29.45-.29.71v9"/>
      <path d="M18 9h2c.27 0 .52.1.71.29.2.2.29.45.29.71v12"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  barChart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
};

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const response = await timeEntriesApi.getOvertimeSummary({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      setData(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const response = await timeEntriesApi.exportPdf({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cost-analytics-${dateRange}days.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;
  const formatHours = (hours) => `${(hours || 0).toFixed(1)}h`;

  // Calculate stats from API response
  const totals = data?.totals || {};
  const byWorker = data?.byWorker || [];

  const stats = {
    totalHours: (totals.regularHours || 0) + (totals.overtimeHours || 0) + (totals.doubleTimeHours || 0),
    totalCost: totals.totalPay || 0,
    overtimeHours: (totals.overtimeHours || 0) + (totals.doubleTimeHours || 0),
    overtimeCost: (totals.overtimePay || 0) + (totals.doubleTimePay || 0),
    regularHours: totals.regularHours || 0,
    regularCost: totals.regularPay || 0,
    doubleTimeHours: totals.doubleTimeHours || 0,
    doubleTimeCost: totals.doubleTimePay || 0,
    avgDailyCost: totals.totalPay ? totals.totalPay / parseInt(dateRange) : 0,
    otPercentage: ((totals.regularHours || 0) + (totals.overtimeHours || 0) + (totals.doubleTimeHours || 0)) > 0 
      ? ((totals.overtimeHours || 0) / ((totals.regularHours || 0) + (totals.overtimeHours || 0) + (totals.doubleTimeHours || 0)) * 100) 
      : 0,
    avgHoursPerWorker: byWorker.length > 0 
      ? ((totals.regularHours || 0) + (totals.overtimeHours || 0) + (totals.doubleTimeHours || 0)) / byWorker.length 
      : 0,
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <div className="page-icon">{Icons.dollarSign}</div>
            <h1>Cost Analytics</h1>
          </div>
          <p>Track labor costs and overtime in real-time</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>
            {Icons.download}
            <span>Export Report</span>
          </button>
          <div className="date-filters">
            {['7', '30', '90'].map(days => (
              <button
                key={days}
                className={dateRange === days ? 'active' : ''}
                onClick={() => setDateRange(days)}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">{Icons.clock}</div>
          <div className="stat-content">
            <div className="stat-label">Total Hours</div>
            <div className="stat-value">{formatHours(stats.totalHours)}</div>
            <div className="stat-sublabel">hours worked</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.dollarSign}</div>
          <div className="stat-content">
            <div className="stat-label">Total Labor Cost</div>
            <div className="stat-value money">{formatCurrency(stats.totalCost)}</div>
            <div className="stat-sublabel">with overtime</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">{Icons.zap}</div>
          <div className="stat-content">
            <div className="stat-label">Overtime Hours</div>
            <div className="stat-value">{formatHours(stats.overtimeHours)}</div>
            <div className="stat-sublabel">OT + DT hours</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">{Icons.trendingUp}</div>
          <div className="stat-content">
            <div className="stat-label">Overtime Cost</div>
            <div className="stat-value money">{formatCurrency(stats.overtimeCost)}</div>
            <div className="stat-sublabel">premium pay</div>
          </div>
        </div>
      </div>

      {/* Overtime Breakdown */}
      <div className="breakdown-section">
        <h3>
          <span className="section-icon">{Icons.zap}</span>
          Overtime Breakdown
        </h3>
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <div className="breakdown-label">Regular Time</div>
            <div className="breakdown-value">{formatHours(stats.regularHours)}</div>
            <div className="breakdown-cost">{formatCurrency(stats.regularCost)}</div>
            <div className="breakdown-note">1.0x rate</div>
          </div>
          <div className="breakdown-card">
            <div className="breakdown-label">Overtime (1.5x)</div>
            <div className="breakdown-value orange">{formatHours(totals.overtimeHours || 0)}</div>
            <div className="breakdown-cost">{formatCurrency(totals.overtimePay || 0)}</div>
            <div className="breakdown-note">Over 8 hrs/day or 40 hrs/week</div>
          </div>
          <div className="breakdown-card">
            <div className="breakdown-label">Double Time (2x)</div>
            <div className="breakdown-value red">{formatHours(stats.doubleTimeHours)}</div>
            <div className="breakdown-cost">{formatCurrency(stats.doubleTimeCost)}</div>
            <div className="breakdown-note">Over 12 hrs/day</div>
          </div>
        </div>
      </div>

      {/* Cost by Section */}
      <div className="cost-sections">
        <div className="cost-section">
          <h3>
            <span className="section-icon">{Icons.building}</span>
            Cost by Job Site
          </h3>
          {data?.byJobSite?.length > 0 ? (
            <div className="cost-list">
              {data.byJobSite.slice(0, 5).map((job, i) => (
                <div key={i} className="cost-row">
                  <div className="cost-info">
                    <span className="cost-name">{job.name}</span>
                    <span className="cost-details">{formatHours(job.hours)} • {job.entries || 0} entries</span>
                  </div>
                  <div className="cost-right">
                    <span className="cost-amount">{formatCurrency(job.cost)}</span>
                    <span className="cost-percentage">{((job.cost / stats.totalCost) * 100 || 0).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No job site data available</p>
          )}
        </div>

        <div className="cost-section">
          <h3>
            <span className="section-icon">{Icons.users}</span>
            Cost by Worker
          </h3>
          {byWorker.length > 0 ? (
            <div className="cost-list">
              {byWorker.slice(0, 5).map((worker, i) => (
                <div key={i} className="cost-row">
                  <div className="cost-info">
                    <div className="worker-indicator" style={{ background: ['#4B7BB5', '#3D8B5F', '#C9A227', '#B54B4B', '#6B5B7A'][i % 5] }}></div>
                    <span className="cost-name">{worker.name}</span>
                    <span className="cost-details">
                      {formatHours((worker.regularMinutes + worker.overtimeMinutes + worker.doubleTimeMinutes) / 60)} • +{formatHours((worker.overtimeMinutes + worker.doubleTimeMinutes) / 60)} OT
                    </span>
                  </div>
                  <div className="cost-right">
                    <span className="cost-amount">{formatCurrency(worker.totalPay)}</span>
                    <span className="cost-percentage">{((worker.totalPay / stats.totalCost) * 100 || 0).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No worker data available</p>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="insights-section">
        <h3>
          <span className="section-icon">{Icons.zap}</span>
          Quick Insights
        </h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon blue">{Icons.calendar}</div>
            <div className="insight-content">
              <span className="insight-label">Avg Daily Cost</span>
              <span className="insight-value">{formatCurrency(stats.avgDailyCost)}/day</span>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon gold">{Icons.zap}</div>
            <div className="insight-content">
              <span className="insight-label">OT % of Total</span>
              <span className="insight-value">{stats.otPercentage.toFixed(1)}%</span>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon green">{Icons.users}</div>
            <div className="insight-content">
              <span className="insight-label">Avg Hours/Worker</span>
              <span className="insight-value">{formatHours(stats.avgHoursPerWorker)}</span>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon red">{Icons.target}</div>
            <div className="insight-content">
              <span className="insight-label">Top Job Site</span>
              <span className="insight-value">{data?.byJobSite?.[0]?.name || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;