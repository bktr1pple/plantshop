'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const AUTH_MARKER_KEY = 'ps_auth_marker';

const setAuthMarker = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUTH_MARKER_KEY, '1');
  } catch {
    // ignore
  }
};

const clearAuthMarker = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTH_MARKER_KEY);
  } catch {
    // ignore
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);
  const checkAuthPromiseRef = useRef<Promise<'authenticated' | 'unauthorized' | 'unavailable'> | null>(null);
  const router = useRouter();

  const redirectToLogin = () => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      search.set('auth', 'login');
      router.push('/?' + search.toString());
    }
  };

  const ensureAuthAndGo = async (path: string) => {
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
      }
    } catch {
      clearAuthMarker();
      setUser(null);
      redirectToLogin();
    }
  };

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    void checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<
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
          clearAuthMarker();
          setUser(null);
          return 'unauthorized' as const;
        }

        if (temporaryFailure || !res) {
          return 'unavailable' as const;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAuthMarker();
            setUser(data.user);
            return 'authenticated' as const;
          }

          clearAuthMarker();
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
  };

  const checkAuth = async () => {
    const authStatus = await checkAuthStatus();
    return authStatus === 'authenticated';
  };

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
          clearAuthMarker();
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
          clearAuthMarker();
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
      clearAuthMarker();
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
