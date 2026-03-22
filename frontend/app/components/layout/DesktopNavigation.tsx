// components/layout/DesktopNavigation.tsx - FIXED
'use client';

import Link from "next/link";
import { Search, ShoppingBag, Heart, ChevronDown, Sun, Moon, Sparkles, User, Menu } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { NavLink } from '@/app/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserDropdown } from './UserDropdown';

const MotionP = m.p;

interface DesktopNavigationProps {
  links: NavLink[];
  theme: string;
  isAnimating: boolean;
  totalItems: number;
  wishlistItems: number;
  onThemeToggle: () => void;
  onAuthOpen: () => void;
  onCartOpen: () => void;
  onWishlistOpen: () => void;
  onSearchOpen: () => void;
  onMenuOpen: () => void;
  isThemeLoaded?: boolean;
}

export function DesktopNavigation({
  links,
  theme,
  isAnimating,
  totalItems,
  wishlistItems,
  onThemeToggle,
  onAuthOpen,
  onCartOpen,
  onWishlistOpen,
  onSearchOpen,
  onMenuOpen,
  isThemeLoaded,
}: DesktopNavigationProps) {
  const { user } = useAuth();

  return (
    <div className="flex justify-between items-center">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center space-x-2 group flex-shrink-0"
      >
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
          Plant<span className="text-gray-900 dark:text-white">Shop</span>
        </span>
      </Link>

      {/* Desktop Navigation Links - ТОЛЬКО для десктопа */}
      <div className="hidden lg:flex items-center space-x-1">
        {links.map((link) => (
          <div key={link.href} className="relative group">
            <Link
              href={link.href}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 font-medium rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
            >
              {link.label}
              {link.submenu && <ChevronDown className="ml-1 w-4 h-4" />}
            </Link>
            
            {/* Submenu Dropdown */}
            {link.submenu && (
              <div className="absolute top-full left-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                <div className="pt-2">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-2">
                    {link.submenu.map((subItem) => (
                      <Link
                        key={`${subItem.href}-${subItem.label}`}
                        href={subItem.href}
                        className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-2 lg:space-x-3">
        {/* Desktop Actions - СКРЫТЫ на мобильных */}
        <div className="hidden lg:flex items-center space-x-2 lg:space-x-3">
          {/* Search Button */}
          <button
            onClick={onSearchOpen}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            disabled={isAnimating}
            className={`relative p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 ${
              isAnimating ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
            }`}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              <MotionP
                key={theme}
                initial={{ scale: 0.8, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.8, rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {!isThemeLoaded
                  ? <Sun className="w-5 h-5" />
                  : theme === 'light'
                    ? <Moon className="w-5 h-5" />
                    : <Sun className="w-5 h-5" />
                }
              </MotionP>
            </AnimatePresence>

          </button>

          {/* Wishlist Button */}
          <button 
            onClick={onWishlistOpen}
            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button 
            onClick={onCartOpen}
            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Auth - ТОЛЬКО для десктопа */}
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <button
              onClick={onAuthOpen}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 lg:px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              <User className="w-4 h-4" />
              <span>Увійти</span>
            </button>
          )}
        </div>

        {/* Mobile menu button - ТОЛЬКО для мобильных */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
      </div>
    </div>
  );
}
