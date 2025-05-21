import { create } from 'zustand';
import api from '@/services/api';

interface User {
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  clearAccessToken: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user: user }),
  logout: () => {
    set({ accessToken: null, user: null }); // Clear state immediately
    try {
      // Call the logout API to invalidate the refresh token on the server
      api.post('/api/v1/auth/logout');
    } catch (error) { // Handle logout error if necessary, maybe log it
      console.error('Logout API call failed:', error);
    }
  },
  clearAccessToken: () => set({ accessToken: null }),
}));
export type { AuthState };


export default useAuthStore;