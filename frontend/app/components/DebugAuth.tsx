// components/DebugAuth.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function DebugAuth() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('🔐 Auth Debug - User:', user, 'Loading:', isLoading);
    
    // Check cookies
    console.log('🍪 Cookies:', document.cookie);
    
    // Check if we can access the auth endpoint
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: 'include'
    })
      .then(res => {
        console.log('🔍 Auth endpoint status:', res.status);
        return res.json();
      })
      .then(data => console.log('🔍 Auth endpoint response:', data))
      .catch(err => console.error('🔍 Auth endpoint error:', err));
  }, [user, isLoading]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>User: {user ? user.name : 'None'}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Cookies: {document.cookie ? 'Present' : 'None'}</div>
    </div>
  );
}