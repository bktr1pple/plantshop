// components/layout/AuthModal.tsx - UPDATED
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, User, Mail, Lock, Sparkles } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import ReCAPTCHA from 'react-google-recaptcha';
import { AuthForm } from '@/app/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { modalBackdropVariants, scaleInVariants, tabContentVariants } from '@/app/animations/navbar';

const MotionDiv = m.div;
const MotionP = m.p;

interface AuthModalProps {
  showAuth: boolean;
  activeTab: 'login' | 'register';
  authModalRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onTabChange: (tab: 'login' | 'register') => void;
}

export function AuthModal({
  showAuth,
  activeTab,
  authModalRef,
  onClose,
  onTabChange,
}: AuthModalProps) {
  const { login, register } = useAuth();
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [isCaptchaReady, setIsCaptchaReady] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<AuthForm>({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Combined error state
  const displayError = localError;

  // Reset everything when modal opens/closes or tabs change
  useEffect(() => {
    if (showAuth) {
      // Reset states
      setLocalError('');
      setForm({
        name: "",
        email: "",
        password: "",
        rememberMe: false,
      });
      setCaptchaToken(null);
      setIsCaptchaReady(false);
      
      // Reset CAPTCHA with a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (captchaRef.current) {
          captchaRef.current.reset();
          setIsCaptchaReady(true);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Clean up when modal closes
      setIsCaptchaReady(false);
    }
  }, [showAuth, activeTab]);

  const handleInputChange = (field: keyof AuthForm, value: string | boolean) => {
    // Clear errors when user starts typing
    if (localError) setLocalError('');
    
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCaptchaChange = (token: string | null) => {
    console.log('reCAPTCHA token received:', token ? 'YES' : 'NO');
    setCaptchaToken(token);
    // Clear CAPTCHA-related errors when user solves it
    if (token && localError?.includes('робот')) {
      setLocalError('');
    }
  };

  const handleCaptchaErrored = () => {
    console.error('reCAPTCHA failed to load');
    setIsCaptchaReady(false);
  };

  const handleCaptchaExpired = () => {
    console.log('reCAPTCHA expired');
    setCaptchaToken(null);
  };

  const handleCaptchaLoaded = () => {
    console.log('reCAPTCHA successfully loaded');
    setIsCaptchaReady(true);
  };

  // Validate form function
  const validateForm = useCallback((): boolean => {
    setLocalError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      setLocalError('Будь ласка, введіть коректний email');
      return false;
    }

    // Password validation
    if (!form.password || form.password.length < 6) {
      setLocalError('Пароль повинен містити щонайменше 6 символів');
      return false;
    }

    // Name validation for registration
    if (activeTab === 'register' && (!form.name || form.name.trim().length < 2)) {
      setLocalError('Ім\'я повинно містити щонайменше 2 символи');
      return false;
    }

    // CAPTCHA validation
    if (!captchaToken) {
      setLocalError('Будь ласка, підтвердіть, що ви не робот');
      return false;
    }

    return true;
  }, [form, activeTab, captchaToken]);

  // Check if form is valid for button state
  const isFormValid = useCallback((): boolean => {
    if (activeTab === 'login') {
      return !!form.email && !!form.password && !!captchaToken;
    } else {
      return !!form.name && !!form.email && !!form.password && !!captchaToken;
    }
  }, [form, activeTab, captchaToken]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      let result;
      if (activeTab === 'login') {
        result = await login(form.email, form.password, captchaToken!);
      } else {
        result = await register(form.email, form.password, form.name, captchaToken!);
      }

      if (result.success) {
        // Success - close modal
        onClose();
        // Reset form
        setForm({
          name: "",
          email: "",
          password: "",
          rememberMe: false,
        });
        setCaptchaToken(null);
        if (captchaRef.current) {
          captchaRef.current.reset();
        }
      } else {
        // Error - show message and reset CAPTCHA
        setLocalError(result.message || 'Сталася помилка');
        setCaptchaToken(null);
        if (captchaRef.current) {
          captchaRef.current.reset();
        }
      }
    } catch (error) {
      setLocalError('Сталася неочікувана помилка');
      setCaptchaToken(null);
      if (captchaRef.current) {
        captchaRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    // Clear all errors and reset CAPTCHA when switching tabs
    setLocalError('');
    setCaptchaToken(null);
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
    onTabChange(tab);
  };

  // Simple reCAPTCHA render function
  const renderRecaptcha = () => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
      return (
        <div className="flex justify-center items-center h-20 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
          <div className="text-red-600 text-sm text-center">
            reCAPTCHA configuration error: Site key missing
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center transition-opacity duration-300">
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={siteKey}
          onChange={handleCaptchaChange}
          onErrored={handleCaptchaErrored}
          onExpired={handleCaptchaExpired}
          onLoad={handleCaptchaLoaded}
          className="recaptcha-container transform scale-95 lg:scale-100"
        />
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {showAuth && (
        <MotionDiv
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4"
          style={{ willChange: 'opacity' }}
        >
          <MotionDiv
            ref={authModalRef}
            variants={scaleInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-green-600"></div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition z-10 p-2"
              aria-label="Close modal"
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
                  onClick={() => handleTabChange("login")}
                  className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === "login"
                      ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Увійти
                </button>
                <button
                  onClick={() => handleTabChange("register")}
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
                <MotionDiv
                  key={activeTab}
                  custom={activeTab === "login" ? -1 : 1}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* Form fields */}
                    {activeTab === "register" && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Ім'я"
                          value={form.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none 
                            transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 
                            shadow-sm focus:shadow-md text-base"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none 
                          transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 
                          shadow-sm focus:shadow-md text-base"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        placeholder="Пароль"
                        value={form.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none 
                          transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 
                          shadow-sm focus:shadow-md text-base"
                      />
                    </div>

                    {/* Remember me & Forgot password */}
                    {activeTab === "login" && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.rememberMe}
                            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                            className="accent-emerald-500 rounded focus:ring-2 focus:ring-emerald-200 w-4 h-4"
                          />
                          <span className="text-sm">Запам'ятати мене</span>
                        </label>
                        <a
                          href="#"
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition font-medium text-sm text-right"
                        >
                          Забули пароль?
                        </a>
                      </div>
                    )}

                    {/* reCAPTCHA Section */}
                    <div className="py-2 min-h-[78px] flex items-center justify-center">
                      {renderRecaptcha()}
                    </div>

                    {/* Error message */}
                    {displayError && (
                      <MotionP 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg"
                        style={{ willChange: 'transform, opacity' }}
                      >
                        {displayError}
                      </MotionP>
                    )}

                    {/* Submit button - NOW PROPERLY MANAGED */}
                    <button
                      type="submit"
                      disabled={loading || !isFormValid()}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-semibold 
                        hover:shadow-lg hover:scale-[1.02] active:scale-100 
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base
                        disabled:hover:scale-100 disabled:hover:shadow-none"
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
                      <button 
                        type="button"
                        className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                      >
                        Google
                      </button>
                      <button 
                        type="button"
                        className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                      >
                        Facebook
                      </button>
                    </div>
                  </div>
                </MotionDiv>
              </AnimatePresence>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}