'use client';

import { useEffect } from 'react';
import api from '@/_services/api';
import useAuthStore from '@/_store/auth';
import { ThemeProvider } from 'next-themes';
import { ToastProvider, ToastViewport } from "@/_components/ui/toast";
import { Header } from './Header';
import Router from 'next/router';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const setAccessToken = useAuthStore(s => s.setAccessToken);
  const setUser        = useAuthStore(s => s.setUser);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const refreshResponse =
          await api.post('/auth/refresh', {}, { withCredentials: true });
        const { data: { accessToken } } = refreshResponse.data;
        if (accessToken) {
          setAccessToken(accessToken);
          const { data: user } = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          });
          setUser(user);
          Router.push('/');
        }
      } catch (err) {
        console.error('Auth init failed:', err);
      }
    };
    initAuth();
  }, [setAccessToken, setUser]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
          <ToastViewport />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
