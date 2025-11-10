// app/ClientWrapper.tsx — Client Component
"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Navbar from './components/Navbar';
import Footer from "./components/Footer";
import { ThemeProvider } from '@/components/ThemeContext';
import { EnhancedThemeRipple } from '@/components/EnhancedThemeRipple';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DebugAuth } from '@/app/components/DebugAuth';
import PWAInstaller from '@/components/PWAInstaller';
import NetworkStatus from '@/components/NetworkStatus';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const themeScript = `
  (function() {
    var theme = localStorage.getItem('theme');
    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var currentTheme = theme || systemTheme;
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#ffffff';
    }
  })();
`;

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <EnhancedThemeRipple />
            <PWAInstaller />
            <NetworkStatus />
            <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex flex-col`}>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            <DebugAuth />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
