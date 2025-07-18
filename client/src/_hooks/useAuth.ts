import { useShallow } from 'zustand/shallow';
import useAuthStore from '@/_store/auth';

export const useAuth = () =>
  useAuthStore(
    useShallow((state) => ({
      accessToken: state.accessToken,
      user: state.user,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      setAccessToken: state.setAccessToken,
      setUser: state.setUser,
      setInitialized: state.setInitialized,
      setLoading: state.setLoading,
      logout: state.logout,
      clearAccessToken: state.clearAccessToken,
    }))
  );
