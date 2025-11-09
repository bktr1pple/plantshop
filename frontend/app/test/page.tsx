// app/page.tsx
'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileThemeToggle } from '@/components/MobileThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
          <h1 className="text-4xl font-bold text-center">
            Stunning Theme Toggle
          </h1>
          
          {/* Desktop version */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          
          {/* Mobile version */}
          <div className="md:hidden">
            <MobileThemeToggle />
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
            Experience the smooth, cinematic theme transition with beautiful ripple animations.
          </p>
        </div>
      </div>
    </div>
  );
}