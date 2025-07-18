import { useShallow } from 'zustand/shallow';
import useAuthStore from '@/_store/auth';

export const useAuth = () =>
  useAuthStore(
    useShallow((state) => ({
      accessToken: state.accessToken,
      user: state.user,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      hasHydrated: state._hasHydrated,
      setAccessToken: state.setAccessToken,
      setUser: state.setUser,
      setInitialized: state.setInitialized,
      setLoading: state.setLoading,
      setHasHydrated: state.setHasHydrated,
      logout: state.logout,
      clearAccessToken: state.clearAccessToken,
    }))
  );
