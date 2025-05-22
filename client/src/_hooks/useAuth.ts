import { useShallow } from 'zustand/shallow';
import useAuthStore from '@/_store/auth';

export const useAuth = () =>
  useAuthStore(
    useShallow((state) => ({
      accessToken: state.accessToken,
      user:        state.user,
      setAccessToken: state.setAccessToken,
      setUser:        state.setUser,
      logout:         state.logout,
      clearAccessToken: state.clearAccessToken,
    }))
  );
