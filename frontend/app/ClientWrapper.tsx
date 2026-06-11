"use client";

import { Suspense } from "react";
import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar';
import Footer from "./components/Footer";
import { ThemeProvider } from '@/components/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import PWAInstaller from '@/components/PWAInstaller';
import { ThemeScript } from '@/app/components/ThemeScript';
import NotificationProvider from './components/NotificationSystem';
import type { SiteSettings } from '@/lib/site-settings';

export default function ClientWrapper({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <ThemeProvider>
      <NotificationProvider>
        <SiteSettingsProvider initialSettings={initialSettings}>
          <AuthProvider>
            <CartProvider>
              <PWAInstaller />
              <div className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex flex-col">
                {!isAdminRoute && (
                  <Suspense fallback={null}>
                    <Navbar />
                  </Suspense>
                )}
                {/* Landmark <main> рендерить кожна сторінка самостійно — тут лише обгортка */}
                <div className={isAdminRoute ? 'min-h-screen' : 'flex-1'}>
                  {children}
                </div>
                {!isAdminRoute && <Footer />}
              </div>
              <ThemeScript />
            </CartProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
