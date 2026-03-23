"use client";

import { Suspense } from "react";
import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar';
import Footer from "./components/Footer";
import { ThemeProvider } from '@/components/ThemeContext';
import { EnhancedThemeRipple } from '@/components/EnhancedThemeRipple';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import PWAInstaller from '@/components/PWAInstaller';
import { ThemeScript } from '@/app/components/ThemeScript';
import NotificationProvider from './components/NotificationSystem';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <ThemeProvider>
      <NotificationProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <EnhancedThemeRipple />
                <PWAInstaller />
                <div className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex flex-col">
                  {!isAdminRoute && (
                    <Suspense fallback={null}>
                      <Navbar />
                    </Suspense>
                  )}
                  <main className={isAdminRoute ? 'min-h-screen' : 'flex-1'}>
                    {children}
                  </main>
                  {!isAdminRoute && <Footer />}
                </div>
                <ThemeScript />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
