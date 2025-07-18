import { createContext, useContext, useEffect } from 'react';
import useAuthStore from '@/_store/auth';
import api from '@/_services/api';

interface AuthContextType {
  isInitialized: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
  isLoading: true,
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const store = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // Wait for Zustand to hydrate from localStorage first
      if (!store._hasHydrated) {
        return;
      }
      
      store.setLoading(true);
      
      try {
        // Now check for stored auth data after hydration
        const hasStoredAuth = store.accessToken || store.user;
        
        // Only attempt token refresh if we have stored auth data or current auth state
        if (hasStoredAuth) {
          const response = await api.post('/auth/refresh', {}, { withCredentials: true });
          
          // Check different possible response structures
          const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
          
          if (accessToken) {
            store.setAccessToken(accessToken);
            
            // If we don't have user data, fetch it
            if (!store.user) {
              try {
                const profileResponse = await api.get('/auth/me');
                if (profileResponse.data?.data) {
                  store.setUser(profileResponse.data.data);
                }
              } catch (profileError) {
                console.warn('Failed to fetch user profile:', profileError);
              }
            }
          } else {
            // No valid refresh token, clear state
            store.clearAccessToken();
            store.setUser(null);
          }
        } else {
          // No stored auth data, this is a fresh session
          store.clearAccessToken();
          store.setUser(null);
        }
      } catch (error: unknown) {
        // Only log the error if we actually attempted a refresh
        const hasStoredAuth = store.accessToken || store.user;
        
        if (hasStoredAuth && (error as { response?: { status: number } })?.response?.status !== 401) {
          console.warn('Token refresh failed:', (error as Error).message);
        }
        store.clearAccessToken();
        store.setUser(null);
      } finally {
        store.setInitialized(true);
        store.setLoading(false);
      }
    };

    // Run initialization on every mount, but wait for hydration
    initializeAuth();
  }, [store._hasHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up storage event listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-storage') {
        if (e.newValue === null) {
          // User logged out in another tab, clear state immediately
          store.clearAccessToken();
          store.setUser(null);
          store.setInitialized(true);
          store.setLoading(false);
          
          // Redirect to home page to show landing page if on a protected route
          const currentPath = window.location.pathname;
          const protectedRoutes = ['/me', '/stats/leaderboard', '/submissions'];
          const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
          
          if (isProtectedRoute) {
            window.location.href = '/';
          }
        } else if (e.newValue && e.newValue !== e.oldValue) {
          // User data changed in another tab (login or user update)
          try {
            const newData = JSON.parse(e.newValue);
            const currentUser = store.user;
            const currentToken = store.accessToken;
            
            // Check if user logged in another tab (new user data but no current user/token)
            if (newData.user && !currentUser && !currentToken) {
              // Set the user data immediately from storage
              if (newData.accessToken) {
                store.setAccessToken(newData.accessToken);
              }
              store.setUser(newData.user);
              
              // Try to get a fresh token as well
              const initAuth = async () => {
                try {
                  store.setLoading(true);
                  const response = await api.post('/auth/refresh', {}, { withCredentials: true });
                  const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
                  
                  if (accessToken) {
                    store.setAccessToken(accessToken);
                  }
                } catch (error) {
                  console.warn('Failed to refresh token after cross-tab login:', error);
                } finally {
                  store.setInitialized(true);
                  store.setLoading(false);
                }
              };
              initAuth();
            } else if (newData.accessToken && newData.user && (!currentToken || !currentUser)) {
              // Direct sync if we have both token and user in the new data
              store.setAccessToken(newData.accessToken);
              store.setUser(newData.user);
            }
          } catch (parseError) {
            console.warn('Failed to parse storage data:', parseError);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ isInitialized: store.isInitialized, isLoading: store.isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
