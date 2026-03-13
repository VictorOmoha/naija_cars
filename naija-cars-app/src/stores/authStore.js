import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register new user
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user, accessToken } = response.data.data;

          // Store token so OTP verification (which requires auth) works immediately
          localStorage.setItem('accessToken', accessToken);

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || 'Registration failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Login user
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, accessToken } = response.data.data;

          // Store access token
          localStorage.setItem('accessToken', accessToken);

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || 'Login failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Logout user
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null
          });
        }
      },

      // Get current user
      getMe: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          const { user } = response.data.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });

          return user;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
          throw error;
        }
      },

      // Send OTP
      sendOTP: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.sendOTP();
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || 'Failed to send OTP';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Verify OTP
      verifyOTP: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.verifyOTP(code);

          // Update user verification status
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, isVerified: true },
              isLoading: false
            });
          }

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || 'Invalid OTP';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Update user in store
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Clear auth state when the refresh token expires / becomes invalid
window.addEventListener('auth:session-expired', () => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    error: null
  });
});

export default useAuthStore;
