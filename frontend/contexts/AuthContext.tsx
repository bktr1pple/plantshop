// contexts/AuthContext.tsx - UPDATED
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

//   // Check authentication status on mount
//   useEffect(() => {
//     checkAuth();
//   }, []);

    // contexts/AuthContext.tsx - Add this to the useEffect
    useEffect(() => {
    const initializeAuth = async () => {
        try {
        // First, try to refresh the token
        console.log('Refreshing token...');
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });
        
        if (refreshRes.ok) {
            console.log('Token refresh successful');
            // If refresh was successful, then check auth status
            await checkAuth();
        } else {
            console.log('Token refresh failed, checking auth directly');
            // If refresh failed, check auth directly
            await checkAuth();
        }
        } catch (error) {
        console.error('Auth initialization error:', error);
        await checkAuth();
        }
    };

    initializeAuth();
    }, []);
  
  const checkAuth = async () => {
    try {
      console.log('Checking auth status...');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // This is crucial for sending cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Auth check response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Auth check successful, user data:', data);
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        console.log('Auth check failed, status:', res.status);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, captchaToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This is crucial for cookies
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await res.json();
      console.log('Login response:', data);
      
      if (data.status === 'ok') {
        console.log('Login successful, checking auth status...');
        // Wait a bit for cookies to be set, then check auth
        setTimeout(async () => {
          await checkAuth();
        }, 100);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, captchaToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      console.log('Attempting registration for:', email);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, captchaToken }),
      });

      const data = await res.json();
      console.log('Registration response:', data);
      
      if (data.status === 'ok' && data.user) {
        // For registration, the backend returns user data directly
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkAuth }}>
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