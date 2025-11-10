// components/layout/Navbar.tsx - UPDATED
'use client';

import { useEffect, useRef } from "react";
import { LazyMotion, m, AnimatePresence, domAnimation } from "framer-motion";

// Hooks
import { useNavbarState } from '@/app/hooks/useNavbarState';
import { useTheme } from '@/components/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { useScrollEffect } from '@/app/hooks/useScrollEffect';

// Components
import { DesktopNavigation } from './layout/DesktopNavigation';
import { MobileNavigation } from './layout/MobileNavigation';
import { SearchModal } from './layout/SearchModal';
import { AuthModal } from './layout/AuthModal';
import { CartModal } from '@/components/CartModal';
import { WishlistModal } from '@/components/WishlistModal';

// Animations
import { navVariants } from '@/app/animations/navbar';

// Constants
import { NAV_LINKS, POPULAR_SEARCHES, RECENT_SEARCHES } from '@/app/constants/navigation';

// Optimized motion components
const MotionNav = m.nav;

export default function Navbar() {
  const {
    open,
    setOpen,
    showAuth,
    setShowAuth,
    activeTab,
    setActiveTab,
    scrolled,
    setScrolled,
    searchOpen,
    setSearchOpen,
    activeMobileSubmenu,
    cartModalOpen,
    setCartModalOpen,
    wishlistModalOpen,
    setWishlistModalOpen,
    openCartModal,
    openWishlistModal,
    toggleMobileSubmenu,
  } = useNavbarState();

  const { theme, toggleTheme, isAnimating } = useTheme();
  const { totalItems } = useCart();

  // Refs for click outside detection
  const mobileMenuRef = useRef<HTMLDivElement>(null!);
  const authModalRef = useRef<HTMLDivElement>(null!);
  const searchModalRef = useRef<HTMLDivElement>(null!);

  // Scroll effect
  useScrollEffect(setScrolled);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (open && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setOpen(false);
      }

      if (showAuth && authModalRef.current && !authModalRef.current.contains(target)) {
        setShowAuth(false);
      }

      if (searchOpen && searchModalRef.current && !searchModalRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, showAuth, searchOpen, setOpen, setShowAuth, setSearchOpen]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (open || showAuth || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, showAuth, searchOpen]);

  const wishlistItems = 2; // This should come from wishlist context

  return (
    <LazyMotion features={domAnimation} strict>
      {/* Modals */}
      <CartModal 
        isOpen={cartModalOpen} 
        onClose={() => setCartModalOpen(false)} 
      />
      <WishlistModal 
        isOpen={wishlistModalOpen} 
        onClose={() => setWishlistModalOpen(false)} 
      />

      {/* Main Navbar */}
      <MotionNav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 w-full z-50 border-b transition-all duration-500 ease-out ${
          scrolled 
            ? "bg-white/95 dark:bg-gray-900/95 shadow-lg border-gray-200/50 dark:border-gray-700/50 py-2" 
            : "bg-white/85 dark:bg-gray-900/85 border-transparent py-3 lg:py-4"
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DesktopNavigation
            links={NAV_LINKS}
            theme={theme}
            isAnimating={isAnimating}
            totalItems={totalItems}
            wishlistItems={wishlistItems}
            onThemeToggle={toggleTheme}
            onAuthOpen={() => setShowAuth(true)}
            onCartOpen={openCartModal}
            onWishlistOpen={openWishlistModal}
            onSearchOpen={() => setSearchOpen(true)}
            onMenuOpen={() => setOpen(true)}
          />
        </div>
      </MotionNav>

      {/* Mobile Navigation */}
      <MobileNavigation
        open={open}
        links={NAV_LINKS}
        theme={theme}
        isAnimating={isAnimating}
        totalItems={totalItems}
        wishlistItems={wishlistItems}
        activeMobileSubmenu={activeMobileSubmenu}
        mobileMenuRef={mobileMenuRef}
        onClose={() => setOpen(false)}
        onThemeToggle={toggleTheme}
        onAuthOpen={() => {
          setShowAuth(true);
          setOpen(false);
        }}
        onSearchOpen={() => {
          setSearchOpen(true);
          setOpen(false);
        }}
        onCartOpen={openCartModal}
        onWishlistOpen={openWishlistModal}
        onSubmenuToggle={toggleMobileSubmenu}
      />

      {/* Search Modal */}
      <SearchModal
        searchOpen={searchOpen}
        searchModalRef={searchModalRef}
        popularSearches={POPULAR_SEARCHES}
        recentSearches={RECENT_SEARCHES}
        onClose={() => setSearchOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        showAuth={showAuth}
        activeTab={activeTab}
        authModalRef={authModalRef}
        onClose={() => setShowAuth(false)}
        onTabChange={setActiveTab}
      />
    </LazyMotion>
  );
}