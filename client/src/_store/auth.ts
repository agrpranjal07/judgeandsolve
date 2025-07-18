import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/_services/api';

interface User {
  id: string;
  username: string;
  email: string;
  usertype: string;
  createdAt: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  _hasHydrated: boolean; // Add hydration flag
  
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  logout: () => void;
  clearAccessToken: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isInitialized: false,
      isLoading: true,
      _hasHydrated: false,
      
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      logout: () => {
        const currentAccessToken = get().accessToken;
        
        // Clear state first
        set({ 
          accessToken: null, 
          user: null, 
          isInitialized: true,
          isLoading: false 
        });
        
        // Manually clear localStorage to ensure cross-tab sync
        try {
          localStorage.removeItem('auth-storage');
          // Dispatch a storage event manually to ensure all tabs are notified
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'auth-storage',
            oldValue: localStorage.getItem('auth-storage'),
            newValue: null,
            storageArea: localStorage
          }));
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
        
        // Only call logout API if we actually have a valid token
        if (currentAccessToken) {
          try {
            // Call the logout API to invalidate the refresh token on the server
            api.post('/auth/logout');
          } catch (error) {
            console.warn('Logout API call failed:', error);
          }
        }
      },
      clearAccessToken: () => set({ accessToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        accessToken: state.accessToken, // Store the access token
        user: state.user,
        // Store when the user was last authenticated to help with cross-tab sync
        lastAuthTime: state.user ? Date.now() : null,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when the state is rehydrated from storage
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export type { AuthState };
export default useAuthStore;