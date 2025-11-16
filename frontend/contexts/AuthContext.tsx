'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, captchaToken: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string, captchaToken: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  ensureAuthAndGo: (path: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let globalMountCount = 0;

export function AuthProvider({ children }: { children: ReactNode }) {
  const mountId = useRef(++globalMountCount);
  const mountTime = useRef(Date.now());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);
  const isCheckingAuth = useRef(false);
  const router = useRouter();

  const ensureAuthAndGo = async (path: string) => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === path && user) {
        return;
      }
    }

    try {
      const { res, unauthorized } = await fetchWithRefresh('/auth/me');

      if (unauthorized) {
        setUser(null);

        if (typeof window !== 'undefined') {
          const search = new URLSearchParams(window.location.search);
          search.set('auth', 'login');
          router.push('/?' + search.toString());
        }

        return;
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      }

      router.push(path);
    } catch (error) {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        search.set('auth', 'login');
        router.push('/?' + search.toString());
      }
    }
  };

  useEffect(() => {

    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }

  }, []);

  const checkAuth = async () => {
    if (isCheckingAuth.current) return;

    isCheckingAuth.current = true;
    setIsLoading(true);

    try {
      const { res, unauthorized } = await fetchWithRefresh('/auth/me');

      if (unauthorized) {
        setUser(null);
        return;
      }

      if (!res) {
        setUser(null);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
    }
  };

  const login = async (email: string, password: string, captchaToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await res.json();
      
      if (data.status === 'ok') {
        await new Promise(resolve => setTimeout(resolve, 100));
        await checkAuth();
        
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, captchaToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, captchaToken }),
      });

      const data = await res.json();

      if (data.status === 'ok') {
        if (data.user) {
          setUser(data.user);
          return { success: true };
        } else {
          const loginResult = await login(email, password, captchaToken);
          return loginResult;
        }
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('🔐 Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkAuth, ensureAuthAndGo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}