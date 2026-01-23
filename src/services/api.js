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
  loginDashboard: (email, password) => api.post('/auth/login/dashboard', { email, password }),
};

// Users endpoints
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  deactivate: (id) => api.patch(`/users/${id}`, { isActive: false }),
  approve: (id) => api.patch(`/users/${id}/approve`),
  decline: (id) => api.patch(`/users/${id}/decline`),
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
  getMine: (params) => api.get('/time-entries/mine', { params }),
  getStatus: () => api.get('/time-entries/status'),
  clockIn: (data) => api.post('/time-entries/clock-in', data),
  clockOut: (data) => api.post('/time-entries/clock-out', data),
  exportQuickBooks: (params) => api.get('/time-entries/export/quickbooks', { params, responseType: 'blob' }),
  exportExcel: (params) => api.get('/time-entries/export/excel', { params, responseType: 'blob' }),
  exportPdf: (params) => api.get('/time-entries/export/pdf', { params, responseType: 'blob' }),
  getPending: () => api.get('/time-entries/pending'),
  getApprovalStats: () => api.get('/time-entries/approval-stats'),
  approve: (id) => api.patch(`/time-entries/${id}/approve`),
  reject: (id, reason) => api.patch(`/time-entries/${id}/reject`, { rejectionReason: reason }),
  bulkApprove: (entryIds) => api.post('/time-entries/bulk-approve', { entryIds }),
  bulkReject: (entryIds, reason) => api.post('/time-entries/bulk-reject', { entryIds, rejectionReason: reason }),
  createManual: (data) => api.post('/time-entries/manual', data),
  getOvertimeSummary: (params) => api.get('/time-entries/overtime-summary', { params }),
  exportCsv: (params) => api.get('/time-entries/export/csv', { params, responseType: 'blob' }),
  exportAdp: (params) => api.get('/time-entries/export/adp', { params, responseType: 'blob' }),
  exportGusto: (params) => api.get('/time-entries/export/gusto', { params, responseType: 'blob' }),
  exportPaychex: (params) => api.get('/time-entries/export/paychex', { params, responseType: 'blob' }),
  update: (id, data) => api.patch(`/time-entries/${id}`, data),
  archive: (id, reason) => api.patch(`/time-entries/${id}/archive`, { reason }),
};

// Shifts endpoints
export const shiftsApi = {
  getAll: (params) => api.get('/shifts', { params }),
  getById: (id) => api.get(`/shifts/${id}`),
  create: (data) => api.post('/shifts', data),
  update: (id, data) => api.patch(`/shifts/${id}`, data),
  delete: (id) => api.delete(`/shifts/${id}`),
  getOpenShifts: () => api.get('/shifts/open'),
  claimShift: (id) => api.post(`/shifts/${id}/claim`),
  markAsOpen: (id) => api.patch(`/shifts/${id}/mark-open`),
  deleteFutureShifts: (userId) => api.delete(`/shifts/worker/${userId}/future`),
};

// Shift Requests
export const shiftRequestsApi = {
  getAll: (params) => api.get('/shift-requests', { params }),
  getPending: () => api.get('/shift-requests/pending'),
  getStats: () => api.get('/shift-requests/stats'),
  getById: (id) => api.get(`/shift-requests/${id}`),
  create: (data) => api.post('/shift-requests', data),
  approve: (id, reviewerNotes) => api.patch(`/shift-requests/${id}/approve`, { reviewerNotes }),
  decline: (id, reviewerNotes) => api.patch(`/shift-requests/${id}/decline`, { reviewerNotes }),
  cancel: (id) => api.patch(`/shift-requests/${id}/cancel`),
};

// Time Off Requests
export const timeOffApi = {
  getAll: (params) => api.get('/time-off', { params }),
  getPending: () => api.get('/time-off/pending'),
  getStats: () => api.get('/time-off/stats'),
  getById: (id) => api.get(`/time-off/${id}`),
  create: (data) => api.post('/time-off', data),
  approve: (id, reviewerNotes) => api.patch(`/time-off/${id}/approve`, { reviewerNotes }),
  decline: (id, reviewerNotes) => api.patch(`/time-off/${id}/decline`, { reviewerNotes }),
  cancel: (id) => api.patch(`/time-off/${id}/cancel`),
};

// Messages
export const messagesApi = {
  getInbox: () => api.get('/messages/inbox'),
  getSent: () => api.get('/messages/sent'),
  getUnread: () => api.get('/messages/unread'),
  getUnreadCount: () => api.get('/messages/unread-count'),
  getAdminMessages: () => api.get('/messages/admin'),
  getById: (id) => api.get(`/messages/${id}`),
  send: (data) => api.post('/messages', data),
  markAsRead: (id) => api.patch(`/messages/${id}/read`),
  markAllAsRead: () => api.patch('/messages/read-all'),
  delete: (id) => api.delete(`/messages/${id}`),
};

// Audit
export const auditApi = {
  getLogs: (params) => api.get('/audit', { params }),
};

// Billing
export const billingApi = {
  getStatus: () => api.get('/billing/status'),
  createCheckoutSession: (planId, billingCycle, workerCount) =>
    api.post('/billing/create-checkout-session', { planId, billingCycle, workerCount }),
  createPortalSession: () => api.post('/billing/create-portal-session'),
};

// Features
export const featuresApi = {
  getFeatures: () => api.get('/features'),
};

// Company
export const companyApi = {
  get: () => api.get('/company'),
  update: (data) => api.patch('/company', data),
};

// Certified Payroll
export const certifiedPayrollApi = {
  getJobs: () => api.get('/certified-payroll/jobs'),
  getPrevailingWageJobs: () => api.get('/certified-payroll/jobs'),
  getPayrolls: () => api.get('/certified-payroll'),
  previewPayroll: (jobId, weekEndingDate) => api.get('/certified-payroll/preview', { 
    params: { jobId, weekEndingDate } 
  }),
  generatePayroll: (jobId, weekEndingDate) => api.post('/certified-payroll/generate', { jobId, weekEndingDate }),
  getHistory: (jobId) => api.get(`/certified-payroll/history/${jobId}`),
  downloadPDF: (id) => api.get(`/certified-payroll/${id}/pdf`, { responseType: 'blob' }),
  submitPayroll: (id) => api.post(`/certified-payroll/${id}/submit`),
};

// Break Compliance
export const breakComplianceApi = {
  getViolations: (params) => api.get('/break-compliance/violations', { params }),
  getSettings: () => api.get('/break-compliance/settings'),
  updateSettings: (data) => api.patch('/break-compliance/settings', data),
  waiveViolation: (id, reason) => api.patch(`/break-compliance/violations/${id}/waive`, { reason }),
  getStats: (params) => api.get('/break-compliance/stats', { params }),
};

// Role Management
export const roleManagementApi = {
  getTeam: () => api.get('/role-management/team'),
  create: (data) => api.post('/role-management/create', data),
  promote: (data) => api.post('/role-management/promote', data),
  demote: (userId) => api.post(`/role-management/demote/${userId}`),
  getManagerDetails: (managerId) => api.get(`/role-management/manager/${managerId}`),
  updatePermissions: (managerId, permissions) => api.patch(`/role-management/manager/${managerId}/permissions`, permissions),
  assignLocations: (managerId, data) => api.patch(`/role-management/manager/${managerId}/locations`, data),
  assignWorkers: (managerId, data) => api.patch(`/role-management/manager/${managerId}/workers`, data),
};

// Pay Periods
export const payPeriodsApi = {
  getAll: (params) => api.get('/pay-periods', { params }),
  getCurrent: () => api.get('/pay-periods/current'),
  getSettings: () => api.get('/pay-periods/settings'),
  updateSettings: (data) => api.patch('/pay-periods/settings', data),
  getById: (id) => api.get(`/pay-periods/${id}`),
  create: (data) => api.post('/pay-periods', data),
  lock: (id) => api.post(`/pay-periods/${id}/lock`),
  unlock: (id, reason) => api.post(`/pay-periods/${id}/unlock`, { reason }),
  markExported: (id) => api.post(`/pay-periods/${id}/mark-exported`),
  export: (id, format = 'CSV') => api.get(`/pay-periods/${id}/export`, { params: { format } }),
  delete: (id) => api.delete(`/pay-periods/${id}`),
};

// Leave Management
export const leaveApi = {
  getPolicies: () => api.get('/leave/policies'),
  createPolicy: (data) => api.post('/leave/policies', data),
  updatePolicy: (id, data) => api.patch(`/leave/policies/${id}`, data),
  deletePolicy: (id) => api.delete(`/leave/policies/${id}`),
  applyPolicyToAll: (policyId) => api.post(`/leave/policies/${policyId}/apply-to-all`),
  getBalances: (params) => api.get('/leave/balances', { params }),
  updateBalance: (id, data) => api.patch(`/leave/balances/${id}`, data),
  getWorkerBalances: (userId) => api.get(`/leave/balances/worker/${userId}`),
  getSummary: () => api.get('/leave/summary'),
};

export default api;