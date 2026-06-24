import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// =============================================
// LOCATION API
// =============================================

export const locationAPI = {
  getDistricts: () => api.get('/locations/districts'),
  getTehsils: (districtId) => api.get(`/locations/tehsils/${districtId}`),
  getVillages: (tehsilId) => api.get(`/locations/villages/${tehsilId}`),
  getVillagesByDistrict: (districtId) => api.get(`/locations/villages/district/${districtId}`),
  getDistrict: (id) => api.get(`/locations/districts/${id}`),
  getTehsil: (id) => api.get(`/locations/tehsil/${id}`),
  getVillage: (id) => api.get(`/locations/village/${id}`),
  searchLocations: (query, type) => api.get(`/locations/search?query=${query}${type ? `&type=${type}` : ''}`),
};

// =============================================
// PROPERTY API
// =============================================

export const propertyAPI = {
  getProperties: (params = {}) => api.get('/properties', { params }),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (data) => api.post('/properties', data),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  getFeaturedProperties: () => api.get('/properties/featured'),
  getPropertyStats: () => api.get('/properties/stats'),
  uploadImages: (id, formData) => api.post(`/properties/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// =============================================
// AUTH API (Buyers & Sellers)
// =============================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  loginWithMobile: (mobile, password) => api.post('/auth/login', { mobile, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateFCMToken: (fcm_token) => api.put('/auth/fcm-token', { fcm_token }),
  logout: () => api.post('/auth/logout'),
};

// =============================================
// FAVORITES API
// =============================================

export const favoriteAPI = {
  getFavorites: (params = {}) => api.get('/favorites', { params }),
  addFavorite: (property_id) => api.post('/favorites', { property_id }),
  removeFavorite: (id) => api.delete(`/favorites/${id}`),
  removeFavoriteByProperty: (propertyId) => api.delete(`/favorites/property/${propertyId}`),
  checkFavorite: (propertyId) => api.get(`/favorites/check/${propertyId}`),
};

// =============================================
// LEADS API
// =============================================

export const leadAPI = {
  createLead: (data) => api.post('/leads', data),
  getSellerLeads: (params = {}) => api.get('/leads/seller', { params }),
  getBuyerLeads: (params = {}) => api.get('/leads/buyer', { params }),
  updateLeadStatus: (id, status, notes) => api.put(`/leads/${id}/status`, { status, notes }),
};

// =============================================
// CHAT API
// =============================================

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (userId, params = {}) => api.get(`/chat/${userId}`, { params }),
  sendMessage: (data) => api.post('/chat/send', data),
  getUnreadCount: () => api.get('/chat/unread'),
};

// =============================================
// NOTIFICATIONS API
// =============================================

export const notificationAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// =============================================
// ADMIN API
// =============================================

export const adminAPI = {
  login: (username, password) => api.post('/admin/login', { username, password }),
  getDashboard: () => api.get('/admin/dashboard'),
  getImportLogs: () => api.get('/admin/imports'),
  importDistricts: (formData) => api.post('/admin/import/districts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  importTehsils: (formData) => api.post('/admin/import/tehsils', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  importVillages: (formData) => api.post('/admin/import/villages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  createVillage: (data) => api.post('/admin/villages', data),
  updateVillage: (id, data) => api.put(`/admin/villages/${id}`, data),
  deleteVillage: (id) => api.delete(`/admin/villages/${id}`),
};

export default api;