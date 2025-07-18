import { createContext, useContext, useEffect, useState } from 'react';
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
      store.setLoading(true);
      
      try {
        // Always attempt token refresh on every new tab/page load
        // This is crucial for cross-tab authentication
        console.log('Attempting token refresh...');
        const response = await api.post('/auth/refresh', {}, { withCredentials: true });
        
        console.log('Refresh response:', response.data);
        
        // Check different possible response structures
        const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
        
        if (accessToken) {
          console.log('Token refresh successful');
          store.setAccessToken(accessToken);
          
          // If we don't have user data, fetch it
          const currentUser = store.user;
          if (!currentUser) {
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
          console.log('No access token in refresh response. Response structure:', response.data);
          store.clearAccessToken();
          store.setUser(null);
        }
      } catch (error: any) {
        // Refresh failed, user needs to login
        console.log('Token refresh failed:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        store.clearAccessToken();
        store.setUser(null);
      } finally {
        store.setInitialized(true);
        store.setLoading(false);
      }
    };

    // Run initialization on every mount (including new tabs)
    initializeAuth();
  }, []); // Empty dependency array - run once per component mount

  // Set up storage event listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-storage') {
        console.log('Storage change detected:', { 
          key: e.key, 
          oldValue: e.oldValue, 
          newValue: e.newValue 
        });
        
        if (e.newValue === null) {
          // User logged out in another tab, clear state immediately
          console.log('User logged out in another tab, clearing local state');
          store.clearAccessToken();
          store.setUser(null);
          store.setInitialized(true);
          store.setLoading(false);
          
          // Redirect to home page to show landing page
          if (window.location.pathname !== '/' && window.location.pathname !== '/problems') {
            window.location.href = '/';
          }
        } else if (e.newValue && e.newValue !== e.oldValue) {
          // User data changed in another tab (login or user update)
          try {
            const newData = JSON.parse(e.newValue);
            const currentUser = store.user;
            
            if (newData.user && !currentUser) {
              console.log('User logged in another tab, attempting token refresh');
              // User logged in another tab, try to get fresh token
              const initAuth = async () => {
                try {
                  store.setLoading(true);
                  const response = await api.post('/auth/refresh', {}, { withCredentials: true });
                  const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
                  
                  if (accessToken) {
                    store.setAccessToken(accessToken);
                    store.setUser(newData.user);
                    console.log('Successfully synced login from another tab');
                  }
                } catch (error) {
                  console.warn('Failed to refresh token after cross-tab login:', error);
                } finally {
                  store.setInitialized(true);
                  store.setLoading(false);
                }
              };
              initAuth();
            }
          } catch (parseError) {
            console.warn('Failed to parse storage data:', parseError);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isInitialized: store.isInitialized, isLoading: store.isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
