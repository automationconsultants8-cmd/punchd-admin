import { useState, useEffect } from 'react';
import { certifiedPayrollApi } from '../services/api';
import { withFeatureGate } from '../components/FeatureGate';
import './CertifiedPayrollPage.css';

function CertifiedPayrollPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [jobs, setJobs] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [weekEndingDate, setWeekEndingDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    loadData();
    // Set default week ending date to this Saturday (or today if Saturday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate days to add/subtract to get to Saturday
    let daysToSaturday;
    if (dayOfWeek === 6) {
      daysToSaturday = 0; // Today is Saturday
    } else if (dayOfWeek === 0) {
      daysToSaturday = -1; // Sunday, go back 1 day
    } else {
      daysToSaturday = -(dayOfWeek + 1); // Mon-Fri, go back to last Saturday
    }
    
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + daysToSaturday);
    
    // Format as YYYY-MM-DD using local date parts
    const year = saturday.getFullYear();
    const month = String(saturday.getMonth() + 1).padStart(2, '0');
    const day = String(saturday.getDate()).padStart(2, '0');
    setWeekEndingDate(`${year}-${month}-${day}`);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, payrollsRes] = await Promise.all([
        certifiedPayrollApi.getJobs().catch(() => ({ data: [] })),
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

    setPreviewing(true);
    setPreviewData(null);
    try {
      const response = await certifiedPayrollApi.previewPayroll(selectedJob, weekEndingDate);
      setPreviewData(response.data);
    } catch (err) {
      console.error('Failed to preview:', err);
      alert(err.response?.data?.message || 'Failed to preview payroll');
    }
    setPreviewing(false);
  };

  const handleGenerate = async () => {
    if (!selectedJob || !weekEndingDate) {
      alert('Please select a job and week ending date');
      return;
    }

    // Warn if workers have missing info
    if (previewData?.workers?.length > 0) {
      const workersWithMissingInfo = previewData.workers.filter(w => 
        w.address === 'Address not provided' || 
        w.lastFourSSN === 'XXXX' ||
        !w.tradeClassification
      );
      
      if (workersWithMissingInfo.length > 0) {
        const proceed = window.confirm(
          `${workersWithMissingInfo.length} worker(s) have incomplete WH-347 information (address, SSN, or trade classification). The report will show placeholder values.\n\nDo you want to continue anyway?`
        );
        if (!proceed) return;
      }
    }

    setGenerating(true);
    try {
      await certifiedPayrollApi.generatePayroll(selectedJob, weekEndingDate);
      alert('Certified payroll generated successfully!');
      setActiveTab('history');
      setPreviewData(null);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
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

  const getWorkerWarnings = (worker) => {
    const warnings = [];
    if (worker.address === 'Address not provided') warnings.push('No address');
    if (worker.lastFourSSN === 'XXXX') warnings.push('No SSN');
    if (!worker.tradeClassification) warnings.push('No trade');
    if (!worker.hourlyRate || worker.hourlyRate === 0) warnings.push('No rate');
    return warnings;
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
                      disabled={!selectedJob || !weekEndingDate || previewing}
                    >
                      {previewing ? 'Loading...' : 'Preview'}
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleGenerate}
                      disabled={!selectedJob || !weekEndingDate || generating}
                    >
                      {generating ? 'Generating...' : 'Generate WH-347'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              {previewData && (
                <div className="card preview-card">
                  <h3>Preview: {previewData.job?.name}</h3>
                  <p className="preview-subtitle">
                    Week ending {formatDate(previewData.weekEnding)} • {previewData.entryCount} time entries
                  </p>

                  {previewData.workers?.length === 0 ? (
                    <div className="empty-state small">
                      <span className="empty-icon">📭</span>
                      <p>No approved time entries found for this week.</p>
                    </div>
                  ) : (
                    <>
                      {/* Warnings */}
                      {previewData.workers?.some(w => getWorkerWarnings(w).length > 0) && (
                        <div className="warning-banner">
                          <span className="warning-icon">⚠️</span>
                          <div className="warning-content">
                            <strong>Some workers have incomplete information</strong>
                            <p>Update worker profiles in the Workers page to include address, SSN, and trade classification for accurate WH-347 reports.</p>
                          </div>
                        </div>
                      )}

                      {/* Workers Table */}
                      <div className="preview-table-wrapper">
                        <table className="preview-table">
                          <thead>
                            <tr>
                              <th>Worker</th>
                              <th>Trade</th>
                              <th>Hours</th>
                              <th>Rate</th>
                              <th>Gross Pay</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.workers?.map((worker, idx) => {
                              const warnings = getWorkerWarnings(worker);
                              return (
                                <tr key={idx} className={warnings.length > 0 ? 'has-warnings' : ''}>
                                  <td>
                                    <div className="worker-cell">
                                      <strong>{worker.name}</strong>
                                      <span className="worker-ssn">XXX-XX-{worker.lastFourSSN}</span>
                                    </div>
                                  </td>
                                  <td>{worker.tradeClassification || 'Not set'}</td>
                                  <td>{worker.totalHours?.toFixed(1)}h</td>
                                  <td>{formatCurrency(worker.hourlyRate)}/hr</td>
                                  <td>{formatCurrency(worker.grossPay)}</td>
                                  <td>
                                    {warnings.length > 0 ? (
                                      <span className="status-warning" title={warnings.join(', ')}>
                                        ⚠️ {warnings.join(', ')}
                                      </span>
                                    ) : (
                                      <span className="status-ok">✓ Complete</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="2"><strong>TOTALS</strong></td>
                              <td><strong>{previewData.workers?.reduce((sum, w) => sum + (w.totalHours || 0), 0).toFixed(1)}h</strong></td>
                              <td></td>
                              <td><strong>{formatCurrency(previewData.totalGrossPay)}</strong></td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )}
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

export default withFeatureGate(CertifiedPayrollPage, 'CERTIFIED_PAYROLL');