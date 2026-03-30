import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cl_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cl_token');
      localStorage.removeItem('cl_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
