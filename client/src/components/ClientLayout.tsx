"use client"
import { useEffect } from 'react';
import api from '@/services/api';
import useAuthStore from '@/store/auth';
import { ThemeProvider } from 'next-themes';
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Header } from './Header';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await api.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        if (response.data?.accessToken) {
          useAuthStore.getState().setAccessToken(response.data.accessToken);
        }
      } catch (error) {
        console.error('Failed to refresh access token:', error);
      }
    };

    refreshAccessToken();
  }, []);


  return (
    <ThemeProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        
        <div className="flex flex-col min-h-screen bg-background font-sans antialiased">
            <Header />
            <main className="flex-1 overflow-y-auto px-4 py-6">
              {children}
            </main>
        
          <ToastViewport />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default ClientLayout;
