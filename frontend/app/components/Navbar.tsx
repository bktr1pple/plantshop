"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔁 Оновлення токена при старті
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

  // 👤 Отримати поточного користувача
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:3001/auth/me", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch {}
  };

  // 📥 Логін або реєстрація
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint =
      activeTab === "login" ? "login" : "register";

    try {
      const res = await fetch(`http://localhost:3001/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.status === "ok") {
        await fetchUser();
        setShowAuth(false);
      } else {
        setError(data.message || "Помилка входу");
      }
    } catch {
      setError("Сервер недоступний");
    } finally {
      setLoading(false);
    }
  };

  // 📤 Вихід
  const handleLogout = async () => {
    await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Головна" },
    { href: "/plants", label: "Рослини" },
    { href: "/about", label: "Про нас" },
    { href: "/contact", label: "Контакти" },
  ];

  return (
    <>
      {/* 🧭 Navbar */}
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/85 shadow-[0_1px_0_rgba(0,0,0,0.05)] border-b border-gray-100 transition-all duration-300 ease-out"
        >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-green-600"
          >
            Plant<span className="text-gray-800">Shop</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-green-600 transition font-medium"
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition font-medium"
            >
              <User size={18} />
              <span>Увійти</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-gray-100 bg-white/90 backdrop-blur-xl"
            >
              <div className="flex flex-col p-4 space-y-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-gray-700 hover:text-green-600 font-medium transition"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowAuth(true);
                  }}
                  className="bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Увійти
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* 🔐 Auth Modal */}
            <AnimatePresence mode="wait">
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 flex justify-center items-center backdrop-blur-sm"
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 relative"
            >
              <button
                onClick={() => setShowAuth(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>

              {/* Tabs */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`px-4 py-2 text-sm font-semibold ${
                    activeTab === "login"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Увійти
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`px-4 py-2 text-sm font-semibold ${
                    activeTab === "register"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Реєстрація
                </button>
              </div>
              
              {/* Form */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 
                            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none 
                            transition-all duration-200 text-gray-800 placeholder-gray-400 shadow-sm 
                            focus:shadow-md"
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
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 
                          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none 
                          transition-all duration-200 text-gray-800 placeholder-gray-400 shadow-sm 
                          focus:shadow-md"
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
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 
                          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none 
                          transition-all duration-200 text-gray-800 placeholder-gray-400 shadow-sm 
                          focus:shadow-md"
                      />
                    </div>

                    {/* Remember me & Forgot password */}
                    {activeTab === "login" && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.rememberMe}
                            onChange={(e) =>
                              setForm({ ...form, rememberMe: e.target.checked })
                            }
                            className="accent-emerald-500 rounded"
                          />
                          Запам’ятати мене
                        </label>
                        <a
                          href="#"
                          className="text-emerald-600 hover:text-emerald-700 transition font-medium"
                        >
                          Забули пароль?
                        </a>
                      </div>
                    )}

                    {/* Error message */}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold 
                        hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 
                        transition-all duration-200"
                    >
                      {loading
                        ? "Зачекайте..."
                        : activeTab === "login"
                        ? "Увійти"
                        : "Зареєструватися"}
                    </button>
                  </form>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
