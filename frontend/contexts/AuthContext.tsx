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
  checkAuth: () => Promise<void>;
  ensureAuthAndGo: (path: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// 🔑 ключ маркера авторизации в localStorage
const AUTH_MARKER_KEY = 'ps_auth_marker';

// вспомогательные функции для работы с маркером
const hasAuthMarker = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(AUTH_MARKER_KEY) === '1';
  } catch {
    return false;
  }
};

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
  const isCheckingAuth = useRef(false);
  const router = useRouter();

  const ensureAuthAndGo = async (path: string) => {
    // если уже на нужном пути и есть пользователь — лишний запрос/редирект не нужен
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === path && user) {
        return;
      }
    }

    // ⚠️ если у нас вообще нет маркера авторизации,
    // не дергаем /auth/me, сразу отправляем на логин
    if (!hasAuthMarker()) {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        search.set('auth', 'login');
        router.push('/?' + search.toString());
      }
      return;
    }

    try {
      const { res, unauthorized } = await fetchWithRefresh('/auth/me');

      if (unauthorized) {
        clearAuthMarker();
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
      clearAuthMarker();
      setUser(null);
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        search.set('auth', 'login');
        router.push('/?' + search.toString());
      }
    }
  };

  useEffect(() => {
    // ✅ минимизация запросов: если маркера нет — не зовём checkAuth
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    if (!hasAuthMarker()) {
      // пользователь явно не логинился в этом браузере
      setUser(null);
      setIsLoading(false);
      return;
    }

    // если маркер есть — уже имеет смысл проверить /auth/me
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (isCheckingAuth.current) return;

    isCheckingAuth.current = true;
    setIsLoading(true);

    try {
      const { res, unauthorized } = await fetchWithRefresh('/auth/me');

      if (unauthorized) {
        clearAuthMarker();
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
        // сразу ставим маркер — мы знаем, что бэк выдал куки
        setAuthMarker();

        // лёгкая пауза для установки/синка кук
        await new Promise((resolve) => setTimeout(resolve, 100));
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
        // сервер уже створив реальну auth-сесію та виставив cookies
        setAuthMarker();
        await new Promise((resolve) => setTimeout(resolve, 100));
        await checkAuth();

        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed',
        };
      }
    } catch (error) {
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
