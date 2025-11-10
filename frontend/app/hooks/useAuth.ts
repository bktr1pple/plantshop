// hooks/useAuth.ts - UPDATED
'use client';

import { useState, useCallback } from 'react';
import { AuthForm, User } from '@/app/types/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [form, setForm] = useState<AuthForm>({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent, activeTab: 'login' | 'register', captchaToken: string | null) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!captchaToken) {
      setError("Підтвердіть, що ви не робот");
      setLoading(false);
      return false;
    }

    const endpoint = activeTab === "login" ? "login" : "register";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, captchaToken }),
      });

      const data = await res.json();
      if (data.status === "ok") {
        await fetchUser();
        setCaptchaToken(null); // Reset CAPTCHA on success
        return true;
      } else {
        setError(data.message || "Помилка входу");
        // Don't reset CAPTCHA here - let the AuthModal handle it based on the error
        return false;
      }
    } catch {
      setError("Сервер недоступний");
      return false;
    } finally {
      setLoading(false);
    }
  }, [form, fetchUser]);

  const handleLogout = useCallback(async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  // Reset function for external use
  const resetAuthState = useCallback(() => {
    setError("");
    setCaptchaToken(null);
    setForm({
      name: "",
      email: "",
      password: "",
      rememberMe: false,
    });
  }, []);

  return {
    user,
    setUser,
    captchaToken,
    setCaptchaToken,
    form,
    setForm,
    loading,
    error,
    setError, // Export setError for external control
    fetchUser,
    handleSubmit,
    handleLogout,
    resetAuthState,
  };
}