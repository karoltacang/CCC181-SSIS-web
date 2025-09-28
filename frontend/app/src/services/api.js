import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Colleges API
export const collegesAPI = {
  getAll: (params = {}) => api.get('/colleges', { params }),
  getByCode: (code) => api.get(`/colleges/${code}`),
  create: (data) => api.post('/colleges', data),
  update: (code, data) => api.put(`/colleges/${code}`, data),
  delete: (code) => api.delete(`/colleges/${code}`),
};

// Programs API
export const programsAPI = {
  getAll: (params = {}) => api.get('/programs', { params }),
  getByCode: (code) => api.get(`/programs/${code}`),
  create: (data) => api.post('/programs', data),
  update: (code, data) => api.put(`/programs/${code}`, data),
  delete: (code) => api.delete(`/programs/${code}`),
};

// Students API
export const studentsAPI = {
  getAll: (params = {}) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export default api;