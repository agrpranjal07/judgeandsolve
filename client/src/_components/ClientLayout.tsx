'use client';

import { ThemeProvider } from 'next-themes';
import { ToastProvider, ToastViewport } from "@/_components/ui/toast";
import { Header } from './Header';
import AuthProvider from './AuthProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 overflow-y-auto">{children}</main>
            <ToastViewport />
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
