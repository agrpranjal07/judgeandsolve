import { create } from 'zustand';
import api from '@/_services/api';

interface User {
  username: string; 
  email: string;
  usertype: string; 
  createdAt: Date;
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
      api.post('/auth/logout');
    } catch (error) { // Handle logout error if necessary, maybe log it
      console.error('Logout API call failed:', error);
    }
  },
  clearAccessToken: () => set({ accessToken: null }),
}));
export type { AuthState };


export default useAuthStore;