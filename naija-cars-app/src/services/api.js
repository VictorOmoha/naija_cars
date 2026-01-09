import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // For cookies
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the access token
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Store new access token
        localStorage.setItem('accessToken', data.data.accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  sendOTP: () => api.post('/auth/send-otp'),
  verifyOTP: (code) => api.post('/auth/verify-otp', { code }),
  refreshToken: () => api.post('/auth/refresh')
};

// Listings endpoints
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  updateStatus: (id, status) => api.put(`/listings/${id}/status`, { status }),
  delete: (id) => api.delete(`/listings/${id}`),
  toggleFavorite: (id) => api.post(`/listings/${id}/favorite`)
};

// Users endpoints
export const usersAPI = {
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getListings: (id, params) => api.get(`/users/${id}/listings`, { params }),
  getFavorites: () => api.get('/users/me/favorites')
};

// Media endpoints
export const mediaAPI = {
  upload: (listingId, files) => {
    const formData = new FormData();
    formData.append('listingId', listingId);
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  delete: (id) => api.delete(`/media/${id}`),
  reorder: (listingId, mediaOrders) => api.put('/media/reorder', { listingId, mediaOrders }),
  getByListing: (listingId) => api.get(`/media/listing/${listingId}`)
};

// Bookings endpoints
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  updatePayment: (id, paymentData) => api.put(`/bookings/${id}/payment`, paymentData)
};

// Admin endpoints
export const adminAPI = {
  // Users management
  getUsers: (params) => api.get('/admin/users', { params }),
  verifyUser: (id, isVerified) => api.put(`/admin/users/${id}/verify`, { isVerified }),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  updateUserBadge: (id, verificationBadge) => api.put(`/admin/users/${id}/badge`, { verificationBadge }),
  // Listings management
  getListings: (params) => api.get('/admin/listings', { params }),
  updateListingStatus: (id, status) => api.put(`/admin/listings/${id}/status`, { status }),
  featureListing: (id, isFeatured) => api.put(`/admin/listings/${id}/feature`, { isFeatured }),
  deleteListing: (id) => api.delete(`/admin/listings/${id}`),
  // Dashboard stats
  getStats: () => api.get('/admin/stats')
};
