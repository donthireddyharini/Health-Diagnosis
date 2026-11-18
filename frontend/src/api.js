import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const googleAuth = (data) => api.post('/auth/google', data);
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// Predictions & Diseases compatibility
export const getPredictions = () => Promise.resolve({ data: [] });
export const getPrediction = (id) => Promise.resolve({ data: null });
export const deletePrediction = (id) => Promise.resolve({ data: { message: 'Deleted' } });
export const getDiseases = () => Promise.resolve({ data: [] });
export const getDisease = (name) => Promise.resolve({ data: null });

// Consultations
export const getConsultations = () => api.get('/consultations');
export const createConsultation = (data) => api.post('/consultations', data);
export const getConsultation = (id) => api.get(`/consultations/${id}`);
export const updateConsultation = (id, data) => api.put(`/consultations/${id}`, data);
export const getDoctors = () => api.get('/doctors');

// Chatbot
export const chat = (message) => api.post('/chat', { message });

// Eye Disease
export const predictEye = (formData) => api.post('/eye/predict', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getEyeHealth = () => api.get('/eye/health');

export default api;
