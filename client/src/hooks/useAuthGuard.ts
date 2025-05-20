import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import  useAuthStore from '@/store/auth';

export const useAuthGuard = () => {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      redirect('/auth/login');
    }
  }, [accessToken]);
};