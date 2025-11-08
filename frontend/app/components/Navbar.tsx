"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User, Mail, Lock, Search, ShoppingBag, Heart, ChevronDown, Sun, Moon, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReCAPTCHA from 'react-google-recaptcha';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState(3);
  const [wishlistItems, setWishlistItems] = useState(2);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔁 Refresh token on mount
  useEffect(() => {
    fetch("http://localhost:3001/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") fetchUser();
      })
      .catch(() => {});
  }, []);

  // 👤 Fetch current user
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:3001/auth/me", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch {}
  };

  const captchaRef = useRef<ReCAPTCHA>(null);

  // 📥 Login or register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!captchaToken) {
      setError("Підтвердіть, що ви не робот");
      setLoading(false);
      return;
    }

    const endpoint = activeTab === "login" ? "login" : "register";

    try {
      const res = await fetch(`http://localhost:3001/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, captchaToken }),
      });

      const data = await res.json();
      if (data.status === "ok") {
        await fetchUser();
        setShowAuth(false);
        setCaptchaToken(null);
      } else {
        setError(data.message || "Помилка входу");
      }
    } catch {
      setError("Сервер недоступний");
    } finally {
      setLoading(false);
      setCaptchaToken(null);
      captchaRef.current?.reset();
    }
  };

  // 📤 Logout
  const handleLogout = async () => {
    await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setOpen(false);
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (open && !target.closest('nav') && !target.closest('.mobile-menu-container')) {
        setOpen(false);
        setActiveMobileSubmenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  const links = [
    { href: "/", label: "Головна" },
    { 
      href: "/plants", 
      label: "Рослини",
      submenu: [
        { href: "/plants/indoor", label: "Кімнатні рослини" },
        { href: "/plants/outdoor", label: "Садові рослини" },
        { href: "/plants/succulents", label: "Кактуси та сукуленти" },
        { href: "/plants/rare", label: "Рідкісні види" },
      ]
    },
    { href: "/pots", label: "Горщики" },
    { href: "/care", label: "Догляд" },
    { href: "/about", label: "Про нас" },
    { href: "/contact", label: "Контакти" },
  ];

  const toggleMobileSubmenu = (label: string) => {
    setActiveMobileSubmenu(activeMobileSubmenu === label ? null : label);
  };

  return (
    <>
      {/* 🧭 Enhanced Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b transition-all duration-500 ease-out ${
          scrolled 
            ? "bg-white/95 dark:bg-gray-900/95 shadow-lg border-gray-200/50 dark:border-gray-700/50 py-2" 
            : "bg-white/85 dark:bg-gray-900/85 border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo with gradient */}
            <Link
              href="/"
              className="flex items-center space-x-2 group"
              onClick={() => setOpen(false)}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
                Plant<span className="text-gray-900 dark:text-white">Shop</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
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
                              key={subItem.href}
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
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300">
                <Heart className="w-5 h-5" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300">
                <ShoppingBag className="w-5 h-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>

              {/* User Auth */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-2">
                      <button className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium">
                        Мій профіль
                      </button>
                      <button className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium">
                        Мої замовлення
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 rounded-lg transition-all duration-200 font-medium"
                      >
                        Вийти
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Увійти</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                aria-label="Toggle menu"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setOpen(false);
                setActiveMobileSubmenu(null);
              }}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute top-0 right-0 h-full w-80 max-w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 overflow-y-auto mobile-menu-container"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                      PlantShop
                    </span>
                  </Link>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <div className="p-4">
                  {/* User Info Section */}
                  {user ? (
                    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-green-600/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <button
                        onClick={() => {
                          setShowAuth(true);
                          setOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        <User className="w-5 h-5" />
                        <span>Увійти в акаунт</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <button 
                      onClick={() => setSearchOpen(true)}
                      className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <Search className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Пошук</span>
                    </button>
                    <button className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300">
                      <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Обране</span>
                      {wishlistItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {wishlistItems}
                        </span>
                      )}
                    </button>
                    <button className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300">
                      <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Кошик</span>
                      {cartItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {cartItems}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                    >
                      {darkMode ? (
                        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      ) : (
                        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {darkMode ? 'Світла' : 'Темна'}
                      </span>
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="space-y-2">
                    {links.map((link) => (
                      <div key={link.href}>
                        {link.submenu ? (
                          <div>
                            <button
                              onClick={() => toggleMobileSubmenu(link.label)}
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
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-4 pl-4 border-l-2 border-emerald-200/50 dark:border-emerald-800/50 space-y-2 py-2">
                                    {link.submenu.map((subItem) => (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        onClick={() => {
                                          setOpen(false);
                                          setActiveMobileSubmenu(null);
                                        }}
                                        className="block p-3 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                                      >
                                        {subItem.label}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="block p-4 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 font-medium"
                          >
                            {link.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>

                  {/* User Menu for Mobile */}
                  {user && (
                    <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
                      <button className="w-full text-left p-4 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 font-medium">
                        Мій профіль
                      </button>
                      <button className="w-full text-left p-4 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 font-medium">
                        Мої замовлення
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left p-4 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 rounded-xl transition-all duration-300 font-medium"
                      >
                        Вийти з акаунта
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* 🔍 Enhanced Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex justify-center items-start pt-20 lg:pt-32"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Пошук рослин, аксесуарів, порад..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-2"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Search Suggestions */}
              <div className="mt-6 space-y-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Популярні запити:</p>
                <div className="flex flex-wrap gap-2">
                  {['монстера', 'кактуси', 'орхідеї', 'фікус', 'сукуленти', 'пальми'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchOpen(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-200 text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Нещодавні пошуки:</p>
                  <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    Очистити
                  </button>
                </div>
                <div className="space-y-2">
                  {['філодендрон', 'калатея', 'заміокулькас'].map((term) => (
                    <button
                      key={term}
                      className="w-full flex items-center justify-between p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                    >
                      <span>{term}</span>
                      <X size={14} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔐 Enhanced Auth Modal - Mobile Optimized */}
      <AnimatePresence mode="wait">
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4"
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full mx-auto relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-green-600"></div>
              
              <button
                onClick={() => setShowAuth(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition z-10 p-2"
              >
                <X size={20} />
              </button>

              <div className="p-6 lg:p-8">
                {/* Logo in modal */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                      PlantShop
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-6 bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      activeTab === "login"
                        ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Увійти
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      activeTab === "register"
                        ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Реєстрація
                  </button>
                </div>
                
                {/* Form */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Register: Name */}
                      {activeTab === "register" && (
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Ім'я"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                              focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none 
                              transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 
                              shadow-sm focus:shadow-md text-lg lg:text-base"
                          />
                        </div>
                      )}

                      {/* Email */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          placeholder="Email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none 
                            transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 
                            shadow-sm focus:shadow-md text-lg lg:text-base"
                        />
                      </div>

                      {/* Password */}
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="password"
                          placeholder="Пароль"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none 
                            transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 
                            shadow-sm focus:shadow-md text-lg lg:text-base"
                        />
                      </div>

                      {/* Remember me & Forgot password */}
                      {activeTab === "login" && (
                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.rememberMe}
                              onChange={(e) =>
                                setForm({ ...form, rememberMe: e.target.checked })
                              }
                              className="accent-emerald-500 rounded focus:ring-2 focus:ring-emerald-200 w-4 h-4"
                            />
                            <span className="text-sm">Запам'ятати мене</span>
                          </label>
                          <a
                            href="#"
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition font-medium text-sm"
                          >
                            Забули пароль?
                          </a>
                        </div>
                      )}

                      {/* reCAPTCHA */}
                      <div className="flex justify-center scale-90 lg:scale-100">
                        <ReCAPTCHA
                          ref={captchaRef}
                          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                          onChange={(token) => setCaptchaToken(token)}
                        />
                      </div>

                      {/* Error message */}
                      {error && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg"
                        >
                          {error}
                        </motion.p>
                      )}

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-semibold 
                          hover:shadow-lg hover:scale-[1.02] active:scale-100 
                          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Зачекайте...</span>
                          </div>
                        ) : activeTab === "login" ? (
                          "Увійти"
                        ) : (
                          "Зареєструватися"
                        )}
                      </button>
                    </form>

                    {/* Social login */}
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Або увійдіть через
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                          Google
                        </button>
                        <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                          Facebook
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}