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
    // 1. Если уже на этой странице и юзер есть — ничего не делаем
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === path && user) {
        return;
      }
    }

    try {
      // 2. Пытаемся тихо проверить/обновить авторизацию
      const { res, unauthorized } = await fetchWithRefresh('/auth/me');

      if (unauthorized) {
        // refresh тоже не помог — считаем, что пользователь разлогинен
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

      // 3. Навигация только после успешной проверки
      router.push(path);
    } catch (error) {
      console.error('ensureAuthAndGo error:', error);
      // в случае ошибки тоже можно открыть логин
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        search.set('auth', 'login');
        router.push('/?' + search.toString());
      }
    }
  };

useEffect(() => {
    const currentMountId = mountId.current;
    const currentMountTime = mountTime.current;
    
    console.log(`🏗️ AuthProvider MOUNTED [ID: ${currentMountId}]`, {
      timeSincePageLoad: Date.now() - currentMountTime + 'ms',
      hasCheckedAuth: hasCheckedAuth.current,
      previousUser: user
    });

    // Проверяем что это не hot reload
    if ((window as any).__AUTH_PROVIDER_ACTIVE__) {
      console.warn('⚠️ Another AuthProvider already active!');
    }
    (window as any).__AUTH_PROVIDER_ACTIVE__ = true;

    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      console.log(`🔐 First check for mount ${currentMountId}`);
      checkAuth();
    }

    return () => {
      console.log(`🏗️ AuthProvider UNMOUNTED [ID: ${currentMountId}]`, {
        lifetime: Date.now() - currentMountTime + 'ms',
        wasLoading: isLoading,
        hadUser: !!user
      });
      console.trace(`🏗️ AuthProvider ${currentMountId} unmount stack`);
      (window as any).__AUTH_PROVIDER_ACTIVE__ = false;
    };
  }, []);

  // useEffect(() => {
  //   //console.log('🔐 AuthProvider mounted, hasCheckedAuth:', hasCheckedAuth.current);
    
  //   if (!hasCheckedAuth.current) {
  //     hasCheckedAuth.current = true;
  //     //console.log('🔐 First mount - calling checkAuth');
  //     checkAuth();
  //   }
  // }, []);

  const checkAuth = async () => {
    if (isCheckingAuth.current) return;

    isCheckingAuth.current = true;
    setIsLoading(true);

    try {
      const { res, unauthorized } = await fetchWithRefresh('/auth/me');

      if (unauthorized) {
        // Полностью неавторизован: нет access, refresh тоже не сработал
        setUser(null);
        return; // ❗ НИКАКИХ router.push здесь
      }

      if (!res) {
        // Что-то пошло совсем не так
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
        // 400/500 — считаем, что не авторизован
        setUser(null);
      }
    } catch (error) {
      console.error('🔐 Auth error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
    }
  };

  const login = async (email: string, password: string, captchaToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      //console.log('🔐 Attempting login...');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await res.json();
      //console.log('🔐 Login response:', data);
      
      if (data.status === 'ok') {
        //console.log('✅ Login successful, checking auth status...');
        
        // Даем время на установку cookies
        await new Promise(resolve => setTimeout(resolve, 100));
        await checkAuth();
        
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, captchaToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      //console.log('🔐 Attempting registration...');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, captchaToken }),
      });

      const data = await res.json();
      //console.log('🔐 Registration response:', data);
      
      if (data.status === 'ok') {
        if (data.user) {
          setUser(data.user);
          return { success: true };
        } else {
          //console.log('✅ Registration successful, attempting auto-login...');
          const loginResult = await login(email, password, captchaToken);
          return loginResult;
        }
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('🔐 Registration error:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      //console.log('🔐 Logging out...');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      //console.log('✅ Logout successful');
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