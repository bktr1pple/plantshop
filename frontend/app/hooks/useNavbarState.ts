// hooks/useNavbarState.ts
'use client';

import { useState, useCallback } from 'react';

export type AuthModalTab = 'login' | 'register' | 'forgot-password';

export function useNavbarState() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthModalTab>('login');
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  const openCartModal = useCallback(() => {
    setOpen(false);
    setCartModalOpen(true);
  }, []);

  const toggleMobileSubmenu = useCallback((label: string) => {
    setActiveMobileSubmenu(current => current === label ? null : label);
  }, []);

  return {
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
    setActiveMobileSubmenu,
    cartModalOpen,
    setCartModalOpen,
    openCartModal,
    toggleMobileSubmenu,
  };
}
