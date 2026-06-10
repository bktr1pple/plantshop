// components/layout/MobileNavigation.tsx - UPDATED
'use client';

import Link from "next/link";
import { X, Search, ShoppingBag, ChevronRight, Sparkles, User, LogOut, Settings, Package, ShieldCheck } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { NavLink } from '@/app/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mobileMenuVariants, slideInVariants, mobileSubmenuVariants } from '@/app/animations/navbar';

const MotionDiv = m.div;

interface MobileNavigationProps {
  open: boolean;
  links: NavLink[];
  theme: string;
  isAnimating: boolean;
  totalItems: number;
  activeMobileSubmenu: string | null;
  mobileMenuRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onThemeToggle: () => void;
  onAuthOpen: () => void;
  onSearchOpen: () => void;
  onCartOpen: () => void;
  onSubmenuToggle: (label: string) => void;
}

export function MobileNavigation({
  open,
  links,
  totalItems,
  activeMobileSubmenu,
  mobileMenuRef,
  onClose,
  onAuthOpen,
  onSearchOpen,
  onCartOpen,
  onSubmenuToggle,
}: MobileNavigationProps) {
  const { user, logout, isLoading, ensureAuthAndGo } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(false);
  const canShowCartBadge = hasHydrated && totalItems > 0;

  useEffect(() => {
    const timeout = window.setTimeout(() => setHasHydrated(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const handleLogout = async () => {
    const loggedOut = await logout();
    if (!loggedOut) {
      return;
    }

    onClose();
  };

  const mobileButtons = (
    <>
      <button 
        onClick={() => {
          onSearchOpen();
          onClose();
        }}
        className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300 relative"
      >
        <Search className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Пошук</span>
      </button>
      
      <button 
        onClick={() => {
          onCartOpen();
          onClose();
        }}
        className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300 relative"
      >
        <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Кошик</span>
        {canShowCartBadge && (
          <span className="absolute top-1 right-2 bg-emerald-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
    </>
  );

  return (
    <AnimatePresence mode="wait">
      {open && (
        <MotionDiv
          variants={mobileMenuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          style={{ willChange: 'opacity' }}
        >
          <MotionDiv
            ref={mobileMenuRef}
            variants={slideInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-0 right-0 h-full w-full max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 overflow-y-auto"
            style={{ willChange: 'transform' }}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={onClose}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  PlantShop
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                aria-label="Закрити меню"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation Content */}
            <div className="p-4">
              {/* User Info Section - UPDATED */}
              {!isLoading && user ? (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-green-600/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                !isLoading && (
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        onAuthOpen();
                        onClose();
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      <User className="w-5 h-5" />
                      <span>Увійти в акаунт</span>
                    </button>
                  </div>
                )
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {mobileButtons}
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {links.map((link) => (
                  <div key={link.href}>
                    {link.submenu ? (
                      <div>
                        <button
                          onClick={() => onSubmenuToggle(link.label)}
                          className="w-full flex items-center justify-between p-4 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 font-medium"
                        >
                          <span>{link.label}</span>
                          <ChevronRight 
                            className={`w-4 h-4 transition-transform duration-300 ${
                              activeMobileSubmenu === link.label ? 'rotate-90' : ''
                            }`} 
                          />
                        </button>
                        
                        <AnimatePresence>
                          {activeMobileSubmenu === link.label && (
                            <MotionDiv
                              variants={mobileSubmenuVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                              style={{ willChange: 'height, opacity' }}
                            >
                              <div className="ml-4 pl-4 border-l-2 border-emerald-200/50 dark:border-emerald-800/50 space-y-1 py-2">
                                {link.submenu.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => {
                                      onClose();
                                    }}
                                    className="block p-3 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </MotionDiv>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="block p-4 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 font-medium"
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* User Menu for Mobile - UPDATED */}
              {!isLoading && user && (
                <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 space-y-1">
                  <button
                    onClick={async () => {
                      onClose();
                      await ensureAuthAndGo('/dashboard');
                    }}
                    className="w-full flex items-center p-4 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 font-medium">
                    <Settings className="w-4 h-4 mr-3" />
                    Мій профіль
                  </button>
                  <button 
                    onClick={async () => {
                      onClose();
                      await ensureAuthAndGo('/dashboard/orders');
                    }}
                    className="w-full flex items-center p-4 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 font-medium">
                    <Package className="w-4 h-4 mr-3" />
                    Мої замовлення
                  </button>
                  {user.role === 'ADMIN' && (
                    <button
                      onClick={async () => {
                        onClose();
                        await ensureAuthAndGo('/admin');
                      }}
                      className="w-full flex items-center p-4 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 mr-3" />
                      Адмін панель
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center p-4 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 rounded-xl transition-all duration-300 font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Вийти з акаунта
                  </button>
                </div>
              )}
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
