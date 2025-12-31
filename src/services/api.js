import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    if (error.response?.status === 401) {
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
};

// Users endpoints
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getPending: () => api.get('/users/pending'),
  approve: (id) => api.patch(`/users/${id}/approve`),
  reject: (id) => api.patch(`/users/${id}/reject`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  reactivate: (id) => api.patch(`/users/${id}/reactivate`),
  update: (id, data) => api.patch(`/users/${id}`, data),
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
  exportExcel: (params) => api.get('/time-entries/export/excel', { params, responseType: 'blob' }),
  exportPdf: (params) => api.get('/time-entries/export/pdf', { params, responseType: 'blob' }),
};

// Shifts endpoints
export const shiftsApi = {
  getAll: (params) => api.get('/shifts', { params }),
  getById: (id) => api.get(`/shifts/${id}`),
  create: (data) => api.post('/shifts', data),
  update: (id, data) => api.put(`/shifts/${id}`, data),
  delete: (id) => api.delete(`/shifts/${id}`),
  getByUser: (userId) => api.get(`/shifts/user/${userId}`),
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

export default api;