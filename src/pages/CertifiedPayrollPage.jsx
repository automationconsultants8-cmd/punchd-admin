import { useState, useEffect } from 'react';
import { certifiedPayrollApi } from '../services/api';
import './CertifiedPayrollPage.css';

function CertifiedPayrollPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [jobs, setJobs] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [weekEndingDate, setWeekEndingDate] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadData();
    // Set default week ending date to last Saturday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const lastSaturday = new Date(today);
    if (dayOfWeek === 6) {
      // Today is Saturday
      lastSaturday.setDate(today.getDate());
    } else {
      lastSaturday.setDate(today.getDate() - dayOfWeek - 1);
    }
    setWeekEndingDate(lastSaturday.toISOString().split('T')[0]);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, payrollsRes] = await Promise.all([
        certifiedPayrollApi.getPrevailingWageJobs().catch(() => ({ data: [] })),
        certifiedPayrollApi.getPayrolls().catch(() => ({ data: [] })),
      ]);
      setJobs(jobsRes.data || []);
      setPayrolls(payrollsRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const handlePreview = async () => {
    if (!selectedJob || !weekEndingDate) {
      alert('Please select a job and week ending date');
      return;
    }

    setPreviewLoading(true);
    try {
      const res = await certifiedPayrollApi.previewPayroll(selectedJob, weekEndingDate);
      setPreviewData(res.data);
    } catch (err) {
      console.error('Failed to preview:', err);
      alert('Failed to load preview data');
    }
    setPreviewLoading(false);
  };

  const handleGenerate = async () => {
    if (!selectedJob || !weekEndingDate) {
      alert('Please select a job and week ending date');
      return;
    }

    setGenerating(true);
    try {
      await certifiedPayrollApi.generatePayroll(selectedJob, weekEndingDate);
      alert('Certified payroll generated successfully!');
      setPreviewData(null);
      setActiveTab('history');
      loadData();
    } catch (err) {
      console.error('Failed to generate:', err);
      alert(err.response?.data?.message || 'Failed to generate payroll');
    }
    setGenerating(false);
  };

  const handleDownloadPDF = async (payrollId) => {
    try {
      const response = await certifiedPayrollApi.downloadPDF(payrollId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WH-347_${payrollId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const handleSubmit = async (payrollId) => {
    if (!confirm('Are you sure you want to submit this payroll? This marks it as officially submitted.')) {
      return;
    }

    try {
      await certifiedPayrollApi.submitPayroll(payrollId);
      alert('Payroll submitted successfully!');
      loadData();
    } catch (err) {
      console.error('Failed to submit:', err);
      alert(err.response?.data?.message || 'Failed to submit payroll');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="badge badge-success">✓ Submitted</span>;
      case 'DRAFT':
      default:
        return <span className="badge badge-warning">Draft</span>;
    }
  };

  if (loading) {
    return (
      <div className="certified-payroll-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="certified-payroll-page">
      <div className="page-header">
        <h1 className="page-title">Certified Payroll</h1>
        <p className="page-subtitle">Generate WH-347 forms for prevailing wage projects</p>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p className="empty-title">No Prevailing Wage Jobs</p>
            <p className="empty-text">
              To generate certified payroll, you need at least one job marked as "Prevailing Wage". 
              Go to Job Sites and enable prevailing wage on a job.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'generate' ? 'active' : ''}`} 
              onClick={() => setActiveTab('generate')}
            >
              Generate Report
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`} 
              onClick={() => setActiveTab('history')}
            >
              Report History 
              {payrolls.length > 0 && <span className="tab-badge">{payrolls.length}</span>}
            </button>
          </div>

          {activeTab === 'generate' && (
            <div className="generate-section">
              <div className="card">
                <h3>Select Report Parameters</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prevailing Wage Job *</label>
                    <select 
                      value={selectedJob} 
                      onChange={(e) => { setSelectedJob(e.target.value); setPreviewData(null); }}
                      className="form-select"
                    >
                      <option value="">Select a job...</option>
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>
                          {job.name} {job.projectNumber ? `(#${job.projectNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Week Ending Date (Saturday) *</label>
                    <input 
                      type="date" 
                      value={weekEndingDate}
                      onChange={(e) => { setWeekEndingDate(e.target.value); setPreviewData(null); }}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group form-actions-inline">
                    <button 
                      className="btn btn-secondary"
                      onClick={handlePreview}
                      disabled={!selectedJob || !weekEndingDate || previewLoading}
                    >
                      {previewLoading ? 'Loading...' : 'Preview Data'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              {previewData && (
                <div className="preview-section">
                  <div className="card preview-card">
                    <div className="preview-header">
                      <div>
                        <h3>WH-347 Preview</h3>
                        <p className="preview-subtitle">
                          {previewData.job?.name} • Week Ending: {formatDate(previewData.weekEnding)}
                        </p>
                      </div>
                      <div className="preview-stats">
                        <div className="preview-stat">
                          <span className="stat-value">{previewData.workers?.length || 0}</span>
                          <span className="stat-label">Workers</span>
                        </div>
                        <div className="preview-stat">
                          <span className="stat-value">{previewData.entryCount || 0}</span>
                          <span className="stat-label">Entries</span>
                        </div>
                        <div className="preview-stat">
                          <span className="stat-value money">{formatCurrency(previewData.totalGrossPay)}</span>
                          <span className="stat-label">Total Gross</span>
                        </div>
                      </div>
                    </div>

                    {previewData.workers?.length === 0 ? (
                      <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <p className="empty-title">No Time Entries Found</p>
                        <p className="empty-text">
                          There are no approved time entries for this job during the selected week.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="table-container">
                          <table className="preview-table">
                            <thead>
                              <tr>
                                <th>Worker</th>
                                <th>Classification</th>
                                <th>SSN</th>
                                <th className="day-col">S</th>
                                <th className="day-col">M</th>
                                <th className="day-col">T</th>
                                <th className="day-col">W</th>
                                <th className="day-col">T</th>
                                <th className="day-col">F</th>
                                <th className="day-col">S</th>
                                <th className="num-col">Total</th>
                                <th className="num-col">Rate</th>
                                <th className="num-col">Gross</th>
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.workers?.map((worker, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <div className="worker-cell">
                                      <span className="worker-name">{worker.name}</span>
                                      <span className="worker-address">{worker.address}</span>
                                    </div>
                                  </td>
                                  <td className="classification-cell">{worker.tradeClassification}</td>
                                  <td className="ssn-cell">XXX-XX-{worker.lastFourSSN}</td>
                                  <td className={`day-col ${worker.dailyHours?.Sun > 0 ? 'has-hours' : ''}`}>
                                    {worker.dailyHours?.Sun > 0 ? worker.dailyHours.Sun.toFixed(1) : '–'}
                                  </td>
                                  <td className={`day-col ${worker.dailyHours?.Mon > 0 ? 'has-hours' : ''}`}>
                                    {worker.dailyHours?.Mon > 0 ? worker.dailyHours.Mon.toFixed(1) : '–'}
                                  </td>
                                  <td className={`day-col ${worker.dailyHours?.Tue > 0 ? 'has-hours' : ''}`}>
                                    {worker.dailyHours?.Tue > 0 ? worker.dailyHours.Tue.toFixed(1) : '–'}
                                  </td>
                                  <td className={`day-col ${worker.dailyHours?.Wed > 0 ? 'has-hours' : ''}`}>
                                    {worker.dailyHours?.Wed > 0 ? worker.dailyHours.Wed.toFixed(1) : '–'}
                                  </td>
                                  <td className={`day-col ${worker.dailyHours?.Thu > 0 ? 'has-hours' : ''}`}>
                                    {worker.dailyHours?.Thu > 0 ? worker.dailyHours.Thu.toFixed(1) : '–'}
                                  </td>
                                  <td className={`day-col ${worker.dailyHours?.Fri > 0 ? 'has-hours' : ''}`}>
                                    {worker.dailyHours?.Fri > 0 ? worker.dailyHours.Fri.toFixed(1) : '–'}
                                  </td>
                                  <td className={`day-col ${worker.dailyHours?.Sat > 0 ? 'has-hours' : ''}`}>
                                    {worker.dailyHours?.Sat > 0 ? worker.dailyHours.Sat.toFixed(1) : '–'}
                                  </td>
                                  <td className="num-col total-hours">{worker.totalHours?.toFixed(1)}</td>
                                  <td className="num-col rate-cell">{formatCurrency(worker.hourlyRate)}</td>
                                  <td className="num-col gross-cell">{formatCurrency(worker.grossPay)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan="12" className="totals-label">Total Gross Pay</td>
                                <td className="total-gross">{formatCurrency(previewData.totalGrossPay)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        {/* Missing Info Warnings */}
                        {previewData.workers?.some(w => 
                          w.lastFourSSN === 'XXXX' || 
                          !w.address || 
                          w.address === 'Address not provided'
                        ) && (
                          <div className="warning-banner">
                            <span>⚠️</span>
                            <div>
                              <strong>Missing Worker Information</strong>
                              <p>Some workers are missing address or SSN information required for WH-347. Update their profiles in Workers before submitting to the government.</p>
                            </div>
                          </div>
                        )}

                        <div className="preview-actions">
                          <button 
                            className="btn btn-primary btn-lg"
                            onClick={handleGenerate}
                            disabled={generating}
                          >
                            {generating ? 'Generating...' : 'Generate WH-347 Report'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-section">
              {payrolls.length === 0 ? (
                <div className="card">
                  <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <p className="empty-title">No Reports Yet</p>
                    <p className="empty-text">Generate your first certified payroll report to see it here.</p>
                  </div>
                </div>
              ) : (
                <div className="payrolls-grid">
                  {payrolls.map(payroll => (
                    <div key={payroll.id} className="card payroll-card">
                      <div className="payroll-header">
                        <div>
                          <div className="payroll-job">{payroll.job?.name}</div>
                          <div className="payroll-number">Payroll #{payroll.payrollNumber}</div>
                        </div>
                        {getStatusBadge(payroll.status)}
                      </div>
                      
                      <div className="payroll-details">
                        <div className="detail-row">
                          <span className="detail-label">Week Ending</span>
                          <span className="detail-value">{formatDate(payroll.weekEndingDate)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Project #</span>
                          <span className="detail-value">{payroll.job?.projectNumber || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Created</span>
                          <span className="detail-value">{formatDate(payroll.createdAt)}</span>
                        </div>
                        {payroll.submittedAt && (
                          <div className="detail-row">
                            <span className="detail-label">Submitted</span>
                            <span className="detail-value">{formatDate(payroll.submittedAt)}</span>
                          </div>
                        )}
                      </div>

                      <div className="payroll-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleDownloadPDF(payroll.id)}
                        >
                          📥 Download PDF
                        </button>
                        {payroll.status === 'DRAFT' && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleSubmit(payroll.id)}
                          >
                            Mark Submitted
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CertifiedPayrollPage;