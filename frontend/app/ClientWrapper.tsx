"use client";

import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from './components/Navbar';
import Footer from "./components/Footer";
import { ThemeProvider } from '@/components/ThemeContext';
import { EnhancedThemeRipple } from '@/components/EnhancedThemeRipple';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/contexts/AuthContext';
import PWAInstaller from '@/components/PWAInstaller';
import { ThemeScript } from '@/app/components/ThemeScript';
import NotificationProvider from './components/NotificationSystem';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <EnhancedThemeRipple />
              <PWAInstaller />
              <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex flex-col`}>
                <Suspense fallback={null}>
                  <Navbar />
                </Suspense>
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <ThemeScript />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
