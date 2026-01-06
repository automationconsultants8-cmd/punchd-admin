import axios from 'axios';

const API_BASE_URL = 'https://punchd-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isBillingEndpoint = error.config?.url?.includes('/billing/');
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    if (error.response?.status === 401 && !isBillingEndpoint && !isAuthEndpoint) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
// Auth endpoints
export const authApi = {
  login: (email, password) => api.post('/admin/auth/login', { email, password }),
  signup: (data) => api.post('/admin/auth/signup', data),
  forgotPassword: (email) => api.post('/admin/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/admin/auth/reset-password', data),
  getSubscriptionStatus: () => api.get('/admin/auth/subscription-status'),
};

// Users endpoints
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  deactivate: (id) => api.patch(`/users/${id}`, { isActive: false }),
  
  // Pay rate endpoints
  getJobRates: (id) => api.get(`/users/${id}/rates`),
  setJobRate: (id, data) => api.post(`/users/${id}/rates`, data),
  removeJobRate: (userId, jobId) => api.delete(`/users/${userId}/rates/${jobId}`),
};

// Jobs endpoints
export const jobsApi = {
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Time entries endpoints
export const timeEntriesApi = {
  getAll: (params) => api.get('/time-entries', { params }),
  getStatus: () => api.get('/time-entries/status'),
  clockIn: (data) => api.post('/time-entries/clock-in', data),
  clockOut: (data) => api.post('/time-entries/clock-out', data),
  exportQuickBooks: (params) => api.get('/time-entries/export/quickbooks', { params, responseType: 'blob' }),
  
  // Exports
  exportExcel: (params) => api.get('/time-entries/export/excel', { params, responseType: 'blob' }),
  exportPdf: (params) => api.get('/time-entries/export/pdf', { params, responseType: 'blob' }),
  
  // Approval workflow
  getPending: () => api.get('/time-entries/pending'),
  getApprovalStats: () => api.get('/time-entries/approval-stats'),
  approve: (id) => api.patch(`/time-entries/${id}/approve`),
  reject: (id, reason) => api.patch(`/time-entries/${id}/reject`, { rejectionReason: reason }),
  bulkApprove: (entryIds) => api.post('/time-entries/bulk-approve', { entryIds }),
  bulkReject: (entryIds, reason) => api.post('/time-entries/bulk-reject', { entryIds, rejectionReason: reason }),
  
  // Manual entry
  createManual: (data) => api.post('/time-entries/manual', data),
  
  // Overtime & Labor cost
  getOvertimeSummary: (params) => api.get('/time-entries/overtime-summary', { params }),
};

// Shifts endpoints
export const shiftsApi = {
  getAll: (params) => api.get('/shifts', { params }),
  getById: (id) => api.get(`/shifts/${id}`),
  create: (data) => api.post('/shifts', data),
  update: (id, data) => api.put(`/shifts/${id}`, data),
  delete: (id) => api.delete(`/shifts/${id}`),
  getByUser: (userId) => api.get(`/shifts/user/${userId}`),
  getToday: () => api.get('/shifts/today'),
};

// =============================================
// PHASE 1: SHIFT REQUESTS
// =============================================
export const shiftRequestsApi = {
  // Get all shift requests (with optional filters)
  getAll: (params) => api.get('/shift-requests', { params }),
  
  // Get only pending requests
  getPending: () => api.get('/shift-requests/pending'),
  
  // Get request statistics
  getStats: () => api.get('/shift-requests/stats'),
  
  // Get single request by ID
  getById: (id) => api.get(`/shift-requests/${id}`),
  
  // Create a new shift request (worker action)
  create: (data) => api.post('/shift-requests', data),
  
  // Approve a shift request
  approve: (id, reviewerNotes) => api.patch(`/shift-requests/${id}/approve`, { reviewerNotes }),
  
  // Decline a shift request
  decline: (id, reviewerNotes) => api.patch(`/shift-requests/${id}/decline`, { reviewerNotes }),
  
  // Cancel own request (worker action)
  cancel: (id) => api.patch(`/shift-requests/${id}/cancel`),
};

// =============================================
// PHASE 1: TIME OFF REQUESTS
// =============================================
export const timeOffApi = {
  // Get all time off requests (with optional filters)
  getAll: (params) => api.get('/time-off', { params }),
  
  // Get only pending requests
  getPending: () => api.get('/time-off/pending'),
  
  // Get request statistics
  getStats: () => api.get('/time-off/stats'),
  
  // Get single request by ID
  getById: (id) => api.get(`/time-off/${id}`),
  
  // Create a new time off request (worker action)
  create: (data) => api.post('/time-off', data),
  
  // Approve a time off request
  approve: (id, reviewerNotes) => api.patch(`/time-off/${id}/approve`, { reviewerNotes }),
  
  // Decline a time off request
  decline: (id, reviewerNotes) => api.patch(`/time-off/${id}/decline`, { reviewerNotes }),
  
  // Cancel own request (worker action)
  cancel: (id) => api.patch(`/time-off/${id}/cancel`),
};

// =============================================
// PHASE 1: MESSAGES
// =============================================
export const messagesApi = {
  // Get inbox messages
  getInbox: () => api.get('/messages/inbox'),
  
  // Get sent messages
  getSent: () => api.get('/messages/sent'),
  
  // Get unread messages
  getUnread: () => api.get('/messages/unread'),
  
  // Get unread count
  getUnreadCount: () => api.get('/messages/unread-count'),
  
  // Get messages sent to admins (admin inbox)
  getAdminMessages: () => api.get('/messages/admin'),
  
  // Get single message by ID
  getById: (id) => api.get(`/messages/${id}`),
  
  // Send a message
  send: (data) => api.post('/messages', data),
  
  // Mark message as read
  markAsRead: (id) => api.patch(`/messages/${id}/read`),
  
  // Mark all messages as read
  markAllAsRead: () => api.patch('/messages/read-all'),
};

// Audit endpoints
export const auditApi = {
  getLogs: (params) => api.get('/audit', { params }),
};

// Billing endpoints
export const billingApi = {
  getStatus: () => api.get('/billing/status'),
  createCheckoutSession: (planId, billingCycle, workerCount) =>
    api.post('/billing/create-checkout-session', { planId, billingCycle, workerCount }),
  createPortalSession: () => api.post('/billing/create-portal-session'),
};

// Features endpoints
export const featuresApi = {
  getFeatures: () => api.get('/features'),
};

// Company endpoints
export const companyApi = {
  get: () => api.get('/company'),
  update: (data) => api.patch('/company', data),
};

// Certified Payroll endpoints
export const certifiedPayrollApi = {
  getJobs: () => api.get('/certified-payroll/jobs'),
  generate: (jobId, weekEnding) => api.post('/certified-payroll/generate', { jobId, weekEnding }),
  getHistory: (jobId) => api.get(`/certified-payroll/history/${jobId}`),
  downloadPdf: (id) => api.get(`/certified-payroll/${id}/pdf`, { responseType: 'blob' }),
  submit: (id) => api.patch(`/certified-payroll/${id}/submit`),
};

// Break Compliance endpoints
export const breakComplianceApi = {
  getViolations: (params) => api.get('/break-compliance/violations', { params }),
  getSettings: () => api.get('/break-compliance/settings'),
  updateSettings: (data) => api.patch('/break-compliance/settings', data),
  waiveViolation: (id, reason) => api.patch(`/break-compliance/violations/${id}/waive`, { reason }),
  getStats: (params) => api.get('/break-compliance/stats', { params }),
};

export default api;