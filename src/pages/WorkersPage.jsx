import { useState, useEffect, useRef } from 'react';
import { usersApi, jobsApi, shiftsApi } from '../services/api';
import './WorkersPage.css';

// SVG Icons
const Icons = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  userPlus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
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
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  checkCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  xCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  dollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  userCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>
  ),
  userX: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  hash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  alertTriangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
};

const TRADE_CLASSIFICATIONS = [
  'Laborer',
  'Carpenter',
  'Electrician',
  'Plumber',
  'HVAC Technician',
  'Ironworker',
  'Mason',
  'Painter',
  'Roofer',
  'Sheet Metal Worker',
  'Pipefitter',
  'Welder',
  'Equipment Operator',
  'Truck Driver',
  'Foreman',
  'Superintendent',
  'Other',
];

function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [deactivateModal, setDeactivateModal] = useState({ open: false, worker: null, deleteShifts: true, loading: false });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'worker',
    hourlyRate: '',
    status: 'active',
    // WH-347 fields
    address: '',
    city: '',
    state: '',
    zip: '',
    lastFourSSN: '',
    tradeClassification: '',
  });

  // Import modal state
  const [importModal, setImportModal] = useState({
    open: false,
    step: 'upload', // 'upload', 'preview', 'importing', 'results'
    file: null,
    parsedData: [],
    errors: [],
    results: { success: 0, failed: 0, errors: [] }
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workersRes, jobsRes] = await Promise.all([
        usersApi.getAll(),
        jobsApi.getAll()
      ]);
      setWorkers(workersRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert frontend fields to backend fields
      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role?.toUpperCase() || 'WORKER',
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        isActive: formData.status === 'active',
        // WH-347 fields
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip: formData.zip || undefined,
        lastFourSSN: formData.lastFourSSN || undefined,
        tradeClassification: formData.tradeClassification || undefined,
      };

      if (editingWorker) {
        await usersApi.update(editingWorker.id, payload);
      } else {
        await usersApi.create(payload);
      }
      setShowModal(false);
      setEditingWorker(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving worker:', error);
      alert(error.response?.data?.message || 'Failed to save worker');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'worker',
      hourlyRate: '',
      status: 'active',
      address: '',
      city: '',
      state: '',
      zip: '',
      lastFourSSN: '',
      tradeClassification: '',
    });
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name || '',
      email: worker.email || '',
      phone: worker.phone || '',
      role: worker.role?.toLowerCase() || 'worker',
      hourlyRate: worker.hourlyRate || '',
      status: worker.isActive ? 'active' : 'inactive',
      address: worker.address || '',
      city: worker.city || '',
      state: worker.state || '',
      zip: worker.zip || '',
      lastFourSSN: worker.lastFourSSN || '',
      tradeClassification: worker.tradeClassification || '',
    });
    setShowModal(true);
  };

  const handleDeactivate = (worker) => {
    setDeactivateModal({ open: true, worker, deleteShifts: true, loading: false });
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateModal.worker) return;
    
    setDeactivateModal(prev => ({ ...prev, loading: true }));
    
    try {
      // Deactivate the worker
      await usersApi.update(deactivateModal.worker.id, { isActive: false });
      
      // Delete future shifts if checkbox is checked
      if (deactivateModal.deleteShifts) {
        try {
          await shiftsApi.deleteUserFutureShifts(deactivateModal.worker.id);
        } catch (shiftError) {
          console.error('Error deleting shifts:', shiftError);
        }
      }
      
      setDeactivateModal({ open: false, worker: null, deleteShifts: true, loading: false });
      loadData();
    } catch (error) {
      console.error('Error deactivating worker:', error);
      alert(error.response?.data?.message || 'Failed to deactivate worker');
      setDeactivateModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleReactivate = async (worker) => {
    try {
      await usersApi.update(worker.id, { isActive: true });
      loadData();
    } catch (error) {
      console.error('Error reactivating worker:', error);
      alert(error.response?.data?.message || 'Failed to reactivate worker');
    }
  };

  // ============================================
  // CSV IMPORT FUNCTIONS
  // ============================================

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { data: [], errors: ['CSV file must have a header row and at least one data row'] };
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Validate required columns
    const requiredColumns = ['name', 'phone'];
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    if (missingColumns.length > 0) {
      return { data: [], errors: [`Missing required columns: ${missingColumns.join(', ')}`] };
    }

    // Parse data rows
    const data = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle CSV with quoted values
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      // Map to object
      const row = {};
      header.forEach((col, idx) => {
        row[col] = values[idx]?.replace(/^["']|["']$/g, '') || '';
      });

      // Validate row
      const rowErrors = [];
      if (!row.name?.trim()) rowErrors.push('Name is required');
      if (!row.phone?.trim()) rowErrors.push('Phone is required');
      
      // Validate phone format (basic)
      if (row.phone && !/^[\d\s\-\(\)\+]+$/.test(row.phone)) {
        rowErrors.push('Invalid phone format');
      }

      // Validate role if provided
      if (row.role && !['worker', 'manager', 'admin', 'owner'].includes(row.role.toLowerCase())) {
        rowErrors.push('Invalid role (must be worker, manager, or admin)');
      }

      // Validate hourly rate if provided
      if (row.hourlyrate && isNaN(parseFloat(row.hourlyrate))) {
        rowErrors.push('Invalid hourly rate');
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
      } else {
        data.push({
          name: row.name.trim(),
          phone: row.phone.trim().replace(/\D/g, ''), // Strip non-digits
          email: row.email?.trim() || '',
          role: (row.role?.toUpperCase() || 'WORKER'),
          hourlyRate: row.hourlyrate ? parseFloat(row.hourlyrate) : null,
          tradeClassification: row.trade || row.tradeclassification || '',
        });
      }
    }

    return { data, errors };
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      const { data, errors } = parseCSV(text);
      
      setImportModal(prev => ({
        ...prev,
        file,
        parsedData: data,
        errors,
        step: 'preview'
      }));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImportModal(prev => ({ ...prev, step: 'importing' }));

    const results = { success: 0, failed: 0, errors: [] };

    for (const worker of importModal.parsedData) {
      try {
        await usersApi.create({
          name: worker.name,
          phone: worker.phone,
          email: worker.email || undefined,
          role: worker.role,
          hourlyRate: worker.hourlyRate || undefined,
          tradeClassification: worker.tradeClassification || undefined,
          isActive: true,
        });
        results.success++;
      } catch (error) {
        results.failed++;
        const message = error.response?.data?.message || 'Unknown error';
        results.errors.push(`${worker.name}: ${message}`);
      }
    }

    setImportModal(prev => ({ ...prev, step: 'results', results }));
    loadData();
  };

  const resetImportModal = () => {
    setImportModal({
      open: false,
      step: 'upload',
      file: null,
      parsedData: [],
      errors: [],
      results: { success: 0, failed: 0, errors: [] }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = 'name,phone,email,role,hourlyrate,trade\nJohn Smith,555-123-4567,john@example.com,worker,25.00,Laborer\nJane Doe,555-987-6543,jane@example.com,worker,30.00,Carpenter';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workers_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          worker.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'active' && worker.isActive) ||
                          (statusFilter === 'inactive' && !worker.isActive) ||
                          (statusFilter === 'pending' && worker.approvalStatus === 'PENDING');

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: workers.length,
    active: workers.filter(w => w.isActive).length,
    inactive: workers.filter(w => !w.isActive).length,
    pending: workers.filter(w => w.approvalStatus === 'PENDING').length,
  };

  if (loading) {
    return (
      <div className="workers-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workers-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <div className="page-icon">{Icons.users}</div>
            <h1>Workers</h1>
          </div>
          <p>Manage your workforce</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={() => setImportModal({ ...importModal, open: true, step: 'upload' })}>
            {Icons.upload}
            <span>Import CSV</span>
          </button>
          <button className="btn-primary" onClick={() => { setEditingWorker(null); resetForm(); setShowModal(true); }}>
            {Icons.userPlus}
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold">{Icons.users}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Workers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.checkCircle}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">{Icons.xCircle}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactive}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
        {stats.pending > 0 && (
          <div className="stat-card">
            <div className="stat-icon orange">{Icons.clock}</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">{Icons.search}</span>
          <input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Workers List */}
      <div className="workers-grid">
        {filteredWorkers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{Icons.users}</div>
            <h3>No workers found</h3>
            <p>{searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first worker to get started'}</p>
          </div>
        ) : (
          filteredWorkers.map(worker => (
            <div key={worker.id} className={`worker-card ${!worker.isActive ? 'inactive' : ''}`}>
              <div className="worker-card-header">
                <div className="worker-avatar">
                  {worker.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                </div>
                <div className="worker-info">
                  <h3>{worker.name}</h3>
                  <span className={`role-badge ${worker.role?.toLowerCase()}`}>{worker.role}</span>
                </div>
                <div className="worker-status">
                  {worker.isActive ? (
                    <span className="status-badge active">{Icons.checkCircle} Active</span>
                  ) : (
                    <span className="status-badge inactive">{Icons.xCircle} Inactive</span>
                  )}
                </div>
              </div>
              <div className="worker-card-body">
                {worker.phone && (
                  <div className="worker-detail">
                    {Icons.phone}
                    <span>{worker.phone}</span>
                  </div>
                )}
                {worker.email && (
                  <div className="worker-detail">
                    {Icons.mail}
                    <span>{worker.email}</span>
                  </div>
                )}
                {worker.hourlyRate && (
                  <div className="worker-detail">
                    {Icons.dollarSign}
                    <span>${Number(worker.hourlyRate).toFixed(2)}/hr</span>
                  </div>
                )}
                {worker.tradeClassification && (
                  <div className="worker-detail">
                    {Icons.briefcase}
                    <span>{worker.tradeClassification}</span>
                  </div>
                )}
              </div>
              <div className="worker-card-footer">
                <button className="btn-icon" onClick={() => handleEdit(worker)} title="Edit">
                  {Icons.edit}
                </button>
                {worker.isActive ? (
                  <button className="btn-icon danger" onClick={() => handleDeactivate(worker)} title="Deactivate">
                    {Icons.userX}
                  </button>
                ) : (
                  <button className="btn-icon success" onClick={() => handleReactivate(worker)} title="Reactivate">
                    {Icons.userCheck}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Worker Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{editingWorker ? Icons.edit : Icons.userPlus}</span>
                <h2>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>{Icons.x}</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Basic Info Section */}
                <div className="form-section">
                  <h3 className="form-section-title">Basic Information</h3>
                  
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.user}</span>Full Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required placeholder="John Smith" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.phone}</span>Phone</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="(555) 123-4567" />
                    </div>
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.mail}</span>Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.shield}</span>Role</label>
                      <select value={formData.role} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}>
                        <option value="worker">Worker</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.dollarSign}</span>Hourly Rate</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={formData.hourlyRate} 
                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))} 
                        placeholder="25.00" 
                      />
                    </div>
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.checkCircle}</span>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* WH-347 / Certified Payroll Section */}
                <div className="form-section">
                  <h3 className="form-section-title">Certified Payroll Info (WH-347)</h3>
                  <p className="form-section-subtitle">Required for prevailing wage projects</p>
                  
                  <div className="form-group">
                    <label><span className="label-icon">{Icons.mapPin}</span>Street Address</label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} 
                      placeholder="123 Main Street" 
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input 
                        type="text" 
                        value={formData.city} 
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} 
                        placeholder="San Jose" 
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input 
                        type="text" 
                        value={formData.state} 
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} 
                        placeholder="CA" 
                        maxLength={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input 
                        type="text" 
                        value={formData.zip} 
                        onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))} 
                        placeholder="95123" 
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.hash}</span>Last 4 of SSN</label>
                      <input 
                        type="text" 
                        value={formData.lastFourSSN} 
                        onChange={(e) => setFormData(prev => ({ ...prev, lastFourSSN: e.target.value.replace(/\D/g, '').slice(0, 4) }))} 
                        placeholder="1234" 
                        maxLength={4}
                      />
                    </div>
                    <div className="form-group">
                      <label><span className="label-icon">{Icons.briefcase}</span>Trade Classification</label>
                      <select 
                        value={formData.tradeClassification} 
                        onChange={(e) => setFormData(prev => ({ ...prev, tradeClassification: e.target.value }))}
                      >
                        <option value="">Select trade...</option>
                        {TRADE_CLASSIFICATIONS.map(trade => (
                          <option key={trade} value={trade}>{trade}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{Icons.check}<span>{editingWorker ? 'Save Changes' : 'Add Worker'}</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivateModal.open && deactivateModal.worker && (
        <div className="modal-overlay" onClick={() => !deactivateModal.loading && setDeactivateModal({ open: false, worker: null, deleteShifts: true, loading: false })}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon danger">{Icons.alertTriangle}</span>
                <h2>Deactivate Worker</h2>
              </div>
              <button 
                className="modal-close" 
                onClick={() => !deactivateModal.loading && setDeactivateModal({ open: false, worker: null, deleteShifts: true, loading: false })}
                disabled={deactivateModal.loading}
              >
                {Icons.x}
              </button>
            </div>
            <div className="modal-body">
              <p className="deactivate-message">
                Are you sure you want to deactivate <strong>{deactivateModal.worker.name}</strong>?
              </p>
              <p className="deactivate-submessage">
                They will no longer be able to access the app or clock in.
              </p>
              
              <div className="deactivate-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={deactivateModal.deleteShifts}
                    onChange={(e) => setDeactivateModal(prev => ({ ...prev, deleteShifts: e.target.checked }))}
                    disabled={deactivateModal.loading}
                  />
                  <span className="checkbox-icon">{Icons.calendar}</span>
                  <span>Also delete all future scheduled shifts</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setDeactivateModal({ open: false, worker: null, deleteShifts: true, loading: false })}
                disabled={deactivateModal.loading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-danger" 
                onClick={handleDeactivateConfirm}
                disabled={deactivateModal.loading}
              >
                {deactivateModal.loading ? 'Deactivating...' : 'Deactivate Worker'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {importModal.open && (
        <div className="modal-overlay" onClick={() => importModal.step !== 'importing' && resetImportModal()}>
          <div className="modal modal-medium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{Icons.upload}</span>
                <h2>Import Workers from CSV</h2>
              </div>
              {importModal.step !== 'importing' && (
                <button className="modal-close" onClick={resetImportModal}>{Icons.x}</button>
              )}
            </div>
            <div className="modal-body">
              
              {/* Step 1: Upload */}
              {importModal.step === 'upload' && (
                <div className="import-upload-step">
                  <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <div className="upload-icon">{Icons.fileText}</div>
                    <h3>Click to select CSV file</h3>
                    <p>or drag and drop</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div className="import-help">
                    <h4>CSV Format</h4>
                    <p>Required columns: <strong>name</strong>, <strong>phone</strong></p>
                    <p>Optional columns: email, role, hourlyrate, trade</p>
                    <button className="btn-link" onClick={downloadTemplate}>
                      {Icons.download} Download template
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Preview */}
              {importModal.step === 'preview' && (
                <div className="import-preview-step">
                  <div className="import-summary">
                    <div className="import-stat success">
                      <span className="import-stat-value">{importModal.parsedData.length}</span>
                      <span className="import-stat-label">Workers to import</span>
                    </div>
                    {importModal.errors.length > 0 && (
                      <div className="import-stat error">
                        <span className="import-stat-value">{importModal.errors.length}</span>
                        <span className="import-stat-label">Rows with errors</span>
                      </div>
                    )}
                  </div>

                  {importModal.errors.length > 0 && (
                    <div className="import-errors">
                      <h4>Errors (these rows will be skipped):</h4>
                      <ul>
                        {importModal.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {importModal.errors.length > 5 && (
                          <li>...and {importModal.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {importModal.parsedData.length > 0 && (
                    <div className="import-preview-table">
                      <h4>Preview:</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importModal.parsedData.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                              <td>{row.name}</td>
                              <td>{row.phone}</td>
                              <td>{row.email || '-'}</td>
                              <td>{row.role}</td>
                              <td>{row.hourlyRate ? `$${row.hourlyRate}` : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importModal.parsedData.length > 5 && (
                        <p className="preview-more">...and {importModal.parsedData.length - 5} more workers</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Importing */}
              {importModal.step === 'importing' && (
                <div className="import-loading-step">
                  <div className="spinner"></div>
                  <p>Importing workers...</p>
                </div>
              )}

              {/* Step 4: Results */}
              {importModal.step === 'results' && (
                <div className="import-results-step">
                  <div className="import-summary">
                    <div className="import-stat success">
                      <span className="import-stat-icon">{Icons.checkCircle}</span>
                      <span className="import-stat-value">{importModal.results.success}</span>
                      <span className="import-stat-label">Successfully imported</span>
                    </div>
                    {importModal.results.failed > 0 && (
                      <div className="import-stat error">
                        <span className="import-stat-icon">{Icons.xCircle}</span>
                        <span className="import-stat-value">{importModal.results.failed}</span>
                        <span className="import-stat-label">Failed</span>
                      </div>
                    )}
                  </div>

                  {importModal.results.errors.length > 0 && (
                    <div className="import-errors">
                      <h4>Errors:</h4>
                      <ul>
                        {importModal.results.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {importModal.step === 'upload' && (
                <button className="btn-secondary" onClick={resetImportModal}>Cancel</button>
              )}
              {importModal.step === 'preview' && (
                <>
                  <button className="btn-secondary" onClick={() => setImportModal(prev => ({ ...prev, step: 'upload', file: null, parsedData: [], errors: [] }))}>
                    Back
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleImport}
                    disabled={importModal.parsedData.length === 0}
                  >
                    {Icons.upload} Import {importModal.parsedData.length} Workers
                  </button>
                </>
              )}
              {importModal.step === 'results' && (
                <button className="btn-primary" onClick={resetImportModal}>Done</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkersPage;