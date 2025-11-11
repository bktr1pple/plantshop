// src/providers/AppProviders.tsx
'use client';

import { UserProvider } from '@/contexts/UserContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}