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
import {
  verifyLoginChallenge,
  type SecurityErrorCode,
} from '@/lib/auth-security';
import { useRouter } from 'next/navigation';

export type UserRole = 'USER' | 'ADMIN';
export type ProfileVisibility = 'public' | 'friends' | 'private';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  emailNotifications?: boolean;
  orderUpdates?: boolean;
  careReminders?: boolean;
  promotional?: boolean;
  profileVisibility?: ProfileVisibility;
  dataSharing?: boolean;
  personalizedAds?: boolean;
  role: UserRole;
}

export type AuthActionStatus =
  | 'ok'
  | 'verification_required'
  | 'challenge_required'
  | 'error';

export interface AuthActionResult {
  success: boolean;
  status: AuthActionStatus;
  message?: string;
  email?: string;
  challengeId?: number;
  waitSeconds?: number;
  errorCode?: SecurityErrorCode;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<AuthActionResult>;
  register: (
    email: string,
    password: string,
    name: string,
    captchaToken: string,
  ) => Promise<AuthActionResult>;
  completeLoginChallenge: (
    challengeId: number,
    code: string,
  ) => Promise<AuthActionResult>;
  logout: () => Promise<boolean>;
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
  ): Promise<AuthActionResult> => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = (await res.json().catch(() => null)) as
        | {
            status?: AuthActionStatus;
            message?: string;
            email?: string;
            challengeId?: number;
            waitSeconds?: number;
          }
        | null;

      if (data?.status === 'ok') {
        // лёгкая пауза для установки/синка кук
        await new Promise((resolve) => setTimeout(resolve, 100));
        const authStatus = await checkAuthStatus();

        if (authStatus === 'authenticated') {
          return { success: true, status: 'ok' };
        }

        if (authStatus === 'unauthorized') {
          setUser(null);
          return {
            success: false,
            status: 'error',
            message: 'Сесію не вдалося підтвердити після входу',
          };
        }

        return {
          success: false,
          status: 'error',
          message: 'Не вдалося підтвердити сесію через тимчасову помилку мережі',
        };
      }

      if (data?.status === 'verification_required') {
        return {
          success: false,
          status: 'verification_required',
          message: data.message,
          email: data.email,
          waitSeconds: data.waitSeconds,
        };
      }

      if (data?.status === 'challenge_required') {
        return {
          success: false,
          status: 'challenge_required',
          message: data.message,
          email: data.email,
          challengeId: data.challengeId,
          waitSeconds: data.waitSeconds,
        };
      }

      return {
        success: false,
        status: 'error',
        message: data?.message || 'Login failed',
      };
    } catch {
      return { success: false, status: 'error', message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    captchaToken: string,
  ): Promise<AuthActionResult> => {
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

      const data = (await res.json().catch(() => null)) as
        | {
            status?: AuthActionStatus;
            message?: string;
            email?: string;
            waitSeconds?: number;
          }
        | null;

      if (data?.status === 'verification_required') {
        return {
          success: false,
          status: 'verification_required',
          message: data.message,
          email: data.email,
          waitSeconds: data.waitSeconds,
        };
      }

      return {
        success: false,
        status: 'error',
        message: data?.message || 'Registration failed',
      };
    } catch {
      return { success: false, status: 'error', message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setUser(null);
        return true;
      }
    } catch (error) {
      console.error('🔐 Logout error:', error);
    }

    const authStatus = await checkAuthStatus();

    if (authStatus === 'unauthorized') {
      setUser(null);
      return true;
    }

    if (authStatus === 'unavailable') {
      notifyAuthUnavailable();
      return false;
    }

    addNotification({
      type: 'error',
      title: 'Не вдалося завершити сеанс',
      message:
        'Сервер не підтвердив вихід. Ви все ще залишаєтесь в акаунті.',
      duration: 5000,
    });

    return false;
  };

  const completeLoginChallenge = async (
    challengeId: number,
    code: string,
  ): Promise<AuthActionResult> => {
    try {
      setIsLoading(true);

      const result = await verifyLoginChallenge({
        challengeId,
        code,
      });

      if (!result.success) {
        return {
          success: false,
          status: 'error',
          message: result.message,
          errorCode: result.errorCode,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      const authStatus = await checkAuthStatus();

      if (authStatus === 'authenticated') {
        return {
          success: true,
          status: 'ok',
          message: result.message,
        };
      }

      if (authStatus === 'unauthorized') {
        setUser(null);
        return {
          success: false,
          status: 'error',
          message: 'Сесію не вдалося підтвердити після перевірки коду.',
        };
      }

      return {
        success: false,
        status: 'error',
        message:
          'Код підтверджено, але не вдалося перевірити сесію через тимчасову помилку мережі.',
        errorCode: 'TEMPORARILY_UNAVAILABLE',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        completeLoginChallenge,
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
