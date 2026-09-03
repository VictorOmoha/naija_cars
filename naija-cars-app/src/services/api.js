import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://naija-cars-api.onrender.com/api' : 'http://localhost:5000/api');

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
    // Let the browser set Content-Type automatically for FormData
    // (it must include the multipart boundary, which axios can't set manually)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh mutex to prevent race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// A 401 from one of these endpoints is the endpoint's real response (for
// example, incorrect login details). Trying to refresh in that situation
// masks the useful error with "Refresh token not provided".
const authEndpointsWithoutRefresh = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh'
];

const canRefreshRequest = (request) => {
  const requestUrl = request?.url || '';
  const isPublicAuthRequest = authEndpointsWithoutRefresh.some((endpoint) =>
    requestUrl.includes(endpoint)
  );

  return !isPublicAuthRequest && Boolean(localStorage.getItem('accessToken'));
};

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (
      error.response?.status === 401
      && originalRequest
      && !originalRequest._retry
      && canRefreshRequest(originalRequest)
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the access token
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.data.accessToken;

        // Store new access token
        localStorage.setItem('accessToken', newToken);

        // Process queued requests
        processQueue(null, newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear tokens and notify the store to log out
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new Event('auth:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Listings endpoints
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  toggleFavorite: (id) => api.post(`/listings/${id}/favorite`)
};

// Users endpoints
export const usersAPI = {
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getListings: (id, params) => api.get(`/users/${id}/listings`, { params }),
  getFavorites: () => api.get('/users/me/favorites'),
  getDealers: (params) => api.get('/users/dealers', { params })
};

// Admin endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getRecentListings: () => api.get('/admin/listings/recent'),
  getRecentUsers: () => api.get('/admin/users/recent'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getListings: (params) => api.get('/admin/listings', { params }),
  verifyUser: (id) => api.patch(`/admin/users/${id}/verify`),
  toggleUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  updateUserRole: (id, userType) => api.patch(`/admin/users/${id}/role`, { userType }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  approveListing: (id) => api.patch(`/admin/listings/${id}/approve`),
  rejectListing: (id) => api.patch(`/admin/listings/${id}/reject`),
  toggleFeatured: (id, isFeatured) => api.patch(`/admin/listings/${id}/featured`, { isFeatured }),
  deleteListing: (id) => api.delete(`/admin/listings/${id}`)
};

// Subscription endpoints
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/me'),
  initialize: (planType) => api.post('/subscriptions/initialize', { planType }),
  verify: (reference) => api.get('/subscriptions/verify', { params: { reference } }),
  cancel: () => api.post('/subscriptions/cancel'),
};
