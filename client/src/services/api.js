import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Modules ----
export const getModules = () => api.get('/modules').then(r => r.data);
export const getAllModules = () => api.get('/modules/all').then(r => r.data);
export const getModuleQuestions = (code) => api.get(`/modules/${code}/questions`).then(r => r.data);

// ---- Plants ----
export const getPlants = (userId) => api.get('/plants', { params: { userId } }).then(r => r.data);
export const getPlant = (id) => api.get(`/plants/${id}`).then(r => r.data);
export const createPlant = (data) => api.post('/plants', data).then(r => r.data);

// ---- Decision ----
export const evaluateDecision = (moduleCode, answers) =>
  api.post('/decision/evaluate', { moduleCode, answers }).then(r => r.data);
export const checkEarlyTermination = (moduleCode, answers) =>
  api.post('/decision/check-early', { moduleCode, answers }).then(r => r.data);

// ---- AI ----
export const extractAIParameters = (text) =>
  api.post('/ai/extract-parameters', { text }).then(r => r.data);

// ---- Auth ----
export const login = (email) => api.post('/auth/login', { email }).then(r => r.data);
export const register = (fullName, email) =>
  api.post('/auth/register', { fullName, email }).then(r => r.data);

// ---- Admin ----
export const getAdminStats = () => api.get('/admin/stats').then(r => r.data);
export const getAdminModules = () => api.get('/admin/modules').then(r => r.data);
export const getAdminQuestions = () => api.get('/admin/questions').then(r => r.data);
export const getAdminRules = () => api.get('/admin/rules').then(r => r.data);
export const getAdminRuleSets = () => api.get('/admin/rule-sets').then(r => r.data);
export const getAdminResultTemplates = () => api.get('/admin/result-templates').then(r => r.data);
export const getAdminContactSettings = () => api.get('/admin/contact-settings').then(r => r.data);
export const updateAdminContactSettings = (data) =>
  api.put('/admin/contact-settings', data).then(r => r.data);

// ---- Public Contact ----
export const getContactInfo = () => api.get('/contact').then(r => r.data);

export default api;
