'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from 'react';

import { useNotification } from '@/app/components/NotificationSystem';
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
  login: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    email: string,
    password: string,
    name: string,
    captchaToken: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  ensureAuthAndGo: (path: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);
  const checkAuthPromiseRef = useRef<Promise<'authenticated' | 'unauthorized' | 'unavailable'> | null>(null);
  const lastUnavailableNoticeRef = useRef(0);
  const router = useRouter();
  const { addNotification } = useNotification();

  const redirectToLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      search.set('auth', 'login');
      router.push('/?' + search.toString());
    }
  }, [router]);

  const notifyAuthUnavailable = useCallback(() => {
    const now = Date.now();
    if (now - lastUnavailableNoticeRef.current < 4000) {
      return;
    }

    lastUnavailableNoticeRef.current = now;
    addNotification({
      type: 'warning',
      title: 'Сервер авторизації тимчасово недоступний',
      message:
        'Не вдалося перевірити сесію. Спробуйте ще раз за кілька секунд.',
      duration: 5000,
    });
  }, [addNotification]);

  const checkAuthStatus = useCallback(async (): Promise<
    'authenticated' | 'unauthorized' | 'unavailable'
  > => {
    if (checkAuthPromiseRef.current) {
      return checkAuthPromiseRef.current;
    }

    const authCheckPromise = (async () => {
      setIsLoading(true);

      try {
        const { res, unauthorized, temporaryFailure } = await fetchWithRefresh(
          '/auth/me',
        );

        if (unauthorized) {
          setUser(null);
          return 'unauthorized' as const;
        }

        if (temporaryFailure || !res) {
          return 'unavailable' as const;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            return 'authenticated' as const;
          }

          setUser(null);
          return 'unauthorized' as const;
        }

        return 'unavailable' as const;
      } catch {
        return 'unavailable' as const;
      } finally {
        setIsLoading(false);
        checkAuthPromiseRef.current = null;
      }
    })();

    checkAuthPromiseRef.current = authCheckPromise;
    return authCheckPromise;
  }, []);

  const ensureAuthAndGo = useCallback(async (path: string) => {
    // если уже на нужном пути и есть пользователь — лишний запрос/редирект не нужен
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === path && user) {
        return;
      }
    }

    try {
      const authStatus = await checkAuthStatus();

      if (authStatus === 'authenticated') {
        router.push(path);
        return;
      }

      if (authStatus === 'unauthorized') {
        redirectToLogin();
        return;
      }

      notifyAuthUnavailable();
    } catch {
      setUser(null);
      notifyAuthUnavailable();
    }
  }, [user, checkAuthStatus, notifyAuthUnavailable, redirectToLogin, router]);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    void checkAuthStatus();
  }, [checkAuthStatus]);

  const checkAuth = useCallback(async () => {
    const authStatus = await checkAuthStatus();
    return authStatus === 'authenticated';
  }, [checkAuthStatus]);

  const login = async (
    email: string,
    password: string,
    captchaToken: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await res.json();

      if (data.status === 'ok') {
        // лёгкая пауза для установки/синка кук
        await new Promise((resolve) => setTimeout(resolve, 100));
        const authStatus = await checkAuthStatus();

        if (authStatus === 'authenticated') {
          return { success: true };
        }

        if (authStatus === 'unauthorized') {
          setUser(null);
          return {
            success: false,
            message: 'Сесію не вдалося підтвердити після входу',
          };
        }

        return {
          success: false,
          message: 'Не вдалося підтвердити сесію через тимчасову помилку мережі',
        };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch {
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    captchaToken: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_URL}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, name, captchaToken }),
        },
      );

      const data = await res.json();

      if (data.status === 'ok') {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const authStatus = await checkAuthStatus();

        if (authStatus === 'authenticated') {
          return { success: true };
        }

        if (authStatus === 'unauthorized') {
          setUser(null);
          return {
            success: false,
            message: 'Сесію не вдалося підтвердити після реєстрації',
          };
        }

        return {
          success: false,
          message: 'Не вдалося підтвердити сесію через тимчасову помилку мережі',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed',
        };
      }
    } catch {
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
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
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
        ensureAuthAndGo,
      }}
    >
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
