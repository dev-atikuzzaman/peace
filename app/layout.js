import './globals.css';
import { AdminProvider } from '@/lib/useAdminSession';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata = {
  title: 'নূর-এ-হেদায়াহ',
  description: 'কুরআন, হাদীস ও আল্লাহর ৯৯ নাম — রেফারেন্সসহ',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#0E9F6E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-night-900 antialiased">
        <AdminProvider>
          {children}
          <ServiceWorkerRegister />
        </AdminProvider>
      </body>
    </html>
  );
}
