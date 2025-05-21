import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import ClientLayout from '@/components/ClientLayout';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JudgeAndSolve - Online Judge Platform',
  description: 'Solve coding problems, improve your skills, and compete with others',
  // You can add more metadata here
  // icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>
            {children}
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}
