import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Set hydration state
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // Register new user
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          set({
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth store hydration error:', error);
        }
        // Always set hydrated to true, even on error
        useAuthStore.setState({ _hasHydrated: true });
      }
    }
  )
);

// Expose a method to check hydration status from outside React
useAuthStore.persist.onFinishHydration(() => {
  useAuthStore.setState({ _hasHydrated: true });
});

export default useAuthStore;
