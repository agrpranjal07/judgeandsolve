import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import useAuthStore from '@/_store/auth';
import { useAuthContext } from '@/_components/AuthProvider';

export const useAuthGuard = () => {
  const { accessToken, user } = useAuthStore();
  const { isInitialized, isLoading } = useAuthContext();

  useEffect(() => {
    // Only redirect if auth is initialized and user is not authenticated
    if (isInitialized && !isLoading && !accessToken && !user) {
      redirect('/auth/login');
    }
  }, [accessToken, user, isInitialized, isLoading]);

  return {
    isAuthenticated: !!accessToken && !!user,
    isLoading: !isInitialized || isLoading,
    user
  };
};