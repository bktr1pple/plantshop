// components/layout/UserDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Package, ShieldCheck } from 'lucide-react';
import { m, AnimatePresence, easeOut } from 'framer-motion';
import type { User as AuthUser } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

const MotionDiv = m.div;

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    willChange: 'transform, opacity',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

interface UserDropdownProps {
  user: AuthUser;
  onClose?: () => void;
}

export function UserDropdown({ user, onClose }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { logout, ensureAuthAndGo } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const closeDropdown = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleLogout = async () => {
    await logout();
    closeDropdown();
  };

  const handleProfileClick = async () => {
    closeDropdown();
    await ensureAuthAndGo('/dashboard');
  };

  const handleOrdersClick = async () => {
    closeDropdown();
    await ensureAuthAndGo('/dashboard/orders');
  };

  const handleAdminClick = async () => {
    closeDropdown();
    await ensureAuthAndGo('/admin');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 lg:px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full right-0 mt-2 w-56 z-50"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-2">
              
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
              </div>
              
              {/* Menu Items */}
              <div className="space-y-1 py-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Мій профіль
                </button>

                <button 
                  onClick={handleOrdersClick}
                  className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                >
                  <Package className="w-4 h-4 mr-3" />
                  Мої замовлення
                </button>

                {user.role === 'ADMIN' && (
                  <button
                    onClick={handleAdminClick}
                    className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 mr-3" />
                    Адмін панель
                  </button>
                )}
              </div>
              
              {/* Logout */}
              <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 rounded-lg transition-all duration-200 font-medium"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Вийти
                </button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
