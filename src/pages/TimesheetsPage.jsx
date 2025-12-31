import { useState, useEffect } from 'react';
import { timeEntriesApi, usersApi, jobsApi } from '../services/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './TimesheetsPage.css';

function TimesheetsPage() {
  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    userId: '',
    jobId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesRes, usersRes, jobsRes] = await Promise.all([
        timeEntriesApi.getAll(),
        usersApi.getAll(),
        jobsApi.getAll(),
      ]);
      setEntries(entriesRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filters.userId && entry.userId !== filters.userId) return false;
    if (filters.jobId && entry.jobId !== filters.jobId) return false;
    if (filters.startDate && new Date(entry.clockInTime) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(entry.clockInTime) > new Date(filters.endDate)) return false;
    return true;
  });

  const totalHours = filteredEntries.reduce((sum, entry) => {
    return sum + (entry.durationMinutes || 0);
  }, 0);

  const activeEntries = filteredEntries.filter(e => !e.clockOutTime).length;

  const clearFilters = () => {
    setFilters({
      userId: '',
      jobId: '',
      startDate: '',
      endDate: '',
    });
  };

  // EXPORT TO EXCEL
  const exportToExcel = () => {
    const data = filteredEntries.map(entry => ({
      'Worker': entry.user?.name || 'Unknown',
      'Phone': entry.user?.phone || '',
      'Job Site': entry.job?.name || 'Travel Time',
      'Clock In': new Date(entry.clockInTime).toLocaleString(),
      'Clock Out': entry.clockOutTime ? new Date(entry.clockOutTime).toLocaleString() : '-',
      'Duration': entry.durationMinutes ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m` : '-',
      'Status': entry.clockOutTime ? 'Completed' : 'Active',
      'Flagged': entry.isFlagged ? 'Yes' : 'No',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheets');
    
    const colWidths = [
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
    ];
    ws['!cols'] = colWidths;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `Timesheets_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  };

  // EXPORT TO PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.text('ApexChronos', 14, 22);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Timesheet Report', 14, 32);

    // Date range
    let dateRangeText = 'All Dates';
    if (filters.startDate || filters.endDate) {
      const start = filters.startDate || 'Beginning';
      const end = filters.endDate || 'Present';
      dateRangeText = `${start} to ${end}`;
    }
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(dateRangeText, 14, 40);

    // Generated timestamp
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);

    // Table data
    const tableData = filteredEntries.map(entry => [
      entry.user?.name || 'Unknown',
      entry.job?.name || 'Travel Time',
      new Date(entry.clockInTime).toLocaleDateString(),
      new Date(entry.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      entry.clockOutTime
        ? new Date(entry.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Active',
      entry.durationMinutes
        ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m`
        : '-',
      entry.clockOutTime ? 'Completed' : 'Active'
    ]);

    // Generate table
    autoTable(doc, {
      startY: 55,
      head: [['Worker', 'Job Site', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [124, 58, 237],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 243, 255]
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });

    // Summary section
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Entries: ${filteredEntries.length}`, 14, finalY);
    doc.text(`Total Hours: ${Math.floor(totalHours / 60)}h ${totalHours % 60}m`, 14, finalY + 6);
    doc.text(`Active Now: ${activeEntries}`, 14, finalY + 12);

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | ApexChronos Time & Attendance`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save
    const fileName = `Timesheet_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="timesheets-page">
        <div className="loading">Loading timesheets...</div>
      </div>
    );
  }

  return (
    <div className="timesheets-page">
      <div className="page-header">
        <h1 className="page-title">📋 Timesheets</h1>
        <div className="export-buttons">
          <button className="btn-export" onClick={exportToExcel}>
            📥 Export Excel
          </button>
          <button className="btn-export btn-pdf" onClick={exportToPDF}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Entries</h3>
          <p className="value">{filteredEntries.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Hours</h3>
          <p className="value">
            {Math.floor(totalHours / 60)}h {totalHours % 60}m
          </p>
        </div>
        <div className="summary-card">
          <h3>Active Now</h3>
          <p className="value">{activeEntries}</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Worker</label>
            <select
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            >
              <option value="">All Workers</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Job Site</label>
            <select
              value={filters.jobId}
              onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
            >
              <option value="">All Job Sites</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>

        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="entries-table">
        {filteredEntries.length === 0 ? (
          <div className="no-entries">No time entries found</div>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="table-row">
              <div className="table-cell">
                <span className="cell-label">Worker</span>
                <span className="cell-value worker-name">{entry.user?.name || 'Unknown'}</span>
                <span className="cell-value phone">{entry.user?.phone || ''}</span>
              </div>
              
              <div className="table-cell">
                <span className="cell-label">Job Site</span>
                <span className="cell-value">{entry.job?.name || 'Travel Time'}</span>
              </div>
              
              <div className="table-cell">
                <span className="cell-label">Clock In</span>
                <span className="cell-value">
                  {new Date(entry.clockInTime).toLocaleDateString()}
                </span>
                <span className="cell-value phone">
                  {new Date(entry.clockInTime).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="table-cell">
                <span className="cell-label">Clock Out</span>
                <span className="cell-value">
                  {entry.clockOutTime 
                    ? new Date(entry.clockOutTime).toLocaleDateString()
                    : '-'
                  }
                </span>
                <span className="cell-value phone">
                  {entry.clockOutTime 
                    ? new Date(entry.clockOutTime).toLocaleTimeString()
                    : '-'
                  }
                </span>
              </div>
              
              <div className="table-cell">
                <span className="cell-label">Duration</span>
                <span className="cell-value">
                  {entry.durationMinutes 
                    ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m`
                    : '-'
                  }
                </span>
              </div>
              
              <div className="table-cell">
                <span className="cell-label">Status</span>
                <span className={`status-badge ${entry.clockOutTime ? 'completed' : 'active'}`}>
                  {entry.clockOutTime ? 'Completed' : 'Active'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TimesheetsPage;