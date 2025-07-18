import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/_store/auth';
import { useAuthContext } from '@/_components/AuthProvider';

/**
 * Hook for protected routes that require authentication
 * Prevents API calls and rendering if user is not authenticated
 */
export const useProtectedRoute = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, user } = useAuthStore();
  const { isInitialized, isLoading } = useAuthContext();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized || isLoading) {
      setIsAllowed(false);
      return;
    }

    // Check if user is authenticated
    if (!accessToken || !user) {
      // Store the current path to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      
      // Add the redirect path as a URL parameter for better reliability
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      
      router.push(loginUrl);
      setIsAllowed(false);
      return;
    }

    // User is authenticated, allow access
    setIsAllowed(true);
  }, [accessToken, user, isInitialized, isLoading, pathname, router]);

  return {
    isAuthenticated: !!accessToken && !!user,
    isLoading: !isInitialized || isLoading || !isAllowed,
    isAllowed,
    user
  };
};
