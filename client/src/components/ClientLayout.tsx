'use client';

import { useEffect } from 'react';
import api from '@/services/api';
import useAuthStore from '@/store/auth';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from 'next-themes';
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await api.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        if (response.data && response.data.accessToken) {
          useAuthStore.getState().setAccessToken(response.data.accessToken);
        }
      } catch (error) {
        console.error('Failed to refresh access token:', error);
        // No need to redirect here, useAuthGuard will handle unauthorized access
      }
    };

    refreshAccessToken();
  }, []);

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-background font-sans antialiased">
          <Navbar />
          {children}
        </div>
        <ToastProvider>
          <ToastViewport />
        </ToastProvider>
      </ThemeProvider>
    </>
  );
};

export default ClientLayout;