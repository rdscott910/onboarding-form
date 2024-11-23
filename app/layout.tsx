import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PageHeader from '@/components/layout/page-header';
import { AuthProvider } from './providers/AuthProvider';
import { FormProvider } from '@/components/providers/FormProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Virnika - Create Account',
  description: 'Create your Virnika account',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-900 text-white">
        <div className="p-8">
          <PageHeader />
          <AuthProvider>
            <FormProvider>{children}</FormProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
