'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, User, Mail, Lock, Sparkles, ArrowLeft, Shield } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '@/contexts/AuthContext';
import { forgotPassword, getSecurityErrorMessage, resendVerificationEmail } from '@/lib/auth-security';
import { modalBackdropVariants, scaleInVariants, tabContentVariants } from '@/app/animations/navbar';
import type { AuthModalTab } from '@/app/hooks/useNavbarState';

const MotionDiv = m.div;
const MotionP = m.p;

type ModalView =
  | AuthModalTab
  | 'verification-pending'
  | 'challenge';

interface AuthFormState {
  name: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ChallengeState {
  challengeId: number;
  email: string;
  waitSeconds?: number;
  message: string;
}

interface VerificationState {
  email: string;
  waitSeconds?: number;
  message: string;
}

interface AuthModalProps {
  showAuth: boolean;
  activeTab: AuthModalTab;
  authModalRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onTabChange: (tab: AuthModalTab) => void;
}

function createInitialForm(): AuthFormState {
  return {
    name: '',
    email: '',
    password: '',
    rememberMe: false,
  };
}

export function AuthModal({
  showAuth,
  activeTab,
  authModalRef,
  onClose,
  onTabChange,
}: AuthModalProps) {
  const { login, register, completeLoginChallenge } = useAuth();
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [view, setView] = useState<ModalView>(activeTab);
  const [form, setForm] = useState<AuthFormState>(createInitialForm());
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeCode, setChallengeCode] = useState('');
  const [challengeState, setChallengeState] = useState<ChallengeState | null>(
    null,
  );
  const [verificationState, setVerificationState] =
    useState<VerificationState | null>(null);
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );
  const [forgotMessage, setForgotMessage] = useState(
    'Введіть email, і ми надішлемо інструкції для скидання пароля, якщо такий акаунт існує.',
  );

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
  }, []);

  const clearTransientState = useCallback(() => {
    setLocalError('');
    setLoading(false);
    setChallengeCode('');
    setChallengeState(null);
    setVerificationState(null);
    setForgotStatus('idle');
    setForgotMessage(
      'Введіть email, і ми надішлемо інструкції для скидання пароля, якщо такий акаунт існує.',
    );
  }, []);

  const resetAllState = useCallback(() => {
    clearTransientState();
    setForm(createInitialForm());
    resetCaptcha();
  }, [clearTransientState, resetCaptcha]);

  useEffect(() => {
    if (!showAuth) {
      return;
    }

    setView(activeTab);
    clearTransientState();
    setForm(createInitialForm());
    setCaptchaToken(null);

    const timer = setTimeout(() => {
      if (captchaRef.current) {
        captchaRef.current.reset();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [showAuth, activeTab, clearTransientState]);

  const handleInputChange = useCallback(
    (field: keyof AuthFormState, value: string | boolean) => {
      if (localError) {
        setLocalError('');
      }

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [localError],
  );

  const switchBaseView = useCallback(
    (nextView: AuthModalTab) => {
      clearTransientState();
      setView(nextView);
      setChallengeCode('');
      resetCaptcha();
      onTabChange(nextView);
    },
    [clearTransientState, onTabChange, resetCaptcha],
  );

  const validateCredentialsForm = useCallback((): boolean => {
    setLocalError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      setLocalError('Будь ласка, введіть коректний email.');
      return false;
    }

    if (!form.password || form.password.length < 6) {
      setLocalError('Пароль повинен містити щонайменше 6 символів.');
      return false;
    }

    if (view === 'register' && (!form.name || form.name.trim().length < 2)) {
      setLocalError("Ім'я повинно містити щонайменше 2 символи.");
      return false;
    }

    if (!captchaToken) {
      setLocalError('Будь ласка, підтвердіть, що ви не робот.');
      return false;
    }

    return true;
  }, [captchaToken, form, view]);

  const isCredentialsFormValid =
    !!form.email &&
    !!form.password &&
    !!captchaToken &&
    (view !== 'register' || !!form.name);

  const handleCredentialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if ((view !== 'login' && view !== 'register') || !validateCredentialsForm()) {
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      const result =
        view === 'login'
          ? await login(form.email, form.password, captchaToken!)
          : await register(
              form.email,
              form.password,
              form.name,
              captchaToken!,
            );

      if (result.success) {
        resetAllState();
        onClose();
        return;
      }

      if (result.status === 'verification_required') {
        setVerificationState({
          email: result.email || form.email.trim(),
          waitSeconds: result.waitSeconds,
          message:
            result.message ||
            'Ми надіслали лист для підтвердження email. Підтвердьте адресу, щоб продовжити.',
        });
        setView('verification-pending');
        resetCaptcha();
        return;
      }

      if (
        result.status === 'challenge_required' &&
        result.challengeId &&
        (result.email || form.email)
      ) {
        setChallengeState({
          challengeId: result.challengeId,
          email: result.email || form.email.trim(),
          waitSeconds: result.waitSeconds,
          message:
            result.message ||
            'Ми надіслали код підтвердження на ваш email, щоб завершити вхід.',
        });
        setChallengeCode('');
        setView('challenge');
        resetCaptcha();
        return;
      }

      setLocalError(result.message || 'Сталася помилка входу.');
      resetCaptcha();
    } catch {
      setLocalError('Сталася неочікувана помилка. Спробуйте ще раз.');
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.email.trim()) {
      setForgotStatus('error');
      setForgotMessage('Введіть email, щоб продовжити.');
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      const result = await forgotPassword(form.email.trim());
      setForgotStatus(result.success ? 'success' : 'error');
      setForgotMessage(
        result.success
          ? result.message
          : getSecurityErrorMessage(
              result.errorCode,
              result.message || 'Не вдалося надіслати інструкції.',
            ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationState?.email) {
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      const result = await resendVerificationEmail(verificationState.email);

      if (result.success) {
        setVerificationState({
          email: verificationState.email,
          waitSeconds: result.waitSeconds,
          message: result.message,
        });
        return;
      }

      setLocalError(
        getSecurityErrorMessage(
          result.errorCode,
          result.message || 'Не вдалося повторно надіслати лист.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!challengeState?.challengeId) {
      setLocalError('Challenge більше неактивний. Почніть вхід заново.');
      return;
    }

    if (challengeCode.trim().length !== 6) {
      setLocalError('Введіть 6-значний код із листа.');
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      const result = await completeLoginChallenge(
        challengeState.challengeId,
        challengeCode.trim(),
      );

      if (result.success) {
        resetAllState();
        onClose();
        return;
      }

      setLocalError(
        getSecurityErrorMessage(
          result.errorCode,
          result.message || 'Не вдалося підтвердити вхід.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRecaptcha = () => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      return (
        <div className="flex h-20 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20">
          <div className="text-center text-sm text-red-600">
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
          onChange={(token) => {
            setCaptchaToken(token);
            if (token && localError.includes('робот')) {
              setLocalError('');
            }
          }}
          onErrored={() => {
            setLocalError('Не вдалося завантажити reCAPTCHA. Спробуйте ще раз.');
          }}
          onExpired={() => {
            setCaptchaToken(null);
          }}
          className="recaptcha-container transform scale-95 lg:scale-100"
        />
      </div>
    );
  };

  const headerTitle =
    view === 'forgot-password'
      ? 'Відновлення доступу'
      : view === 'verification-pending'
        ? 'Підтвердження email'
        : view === 'challenge'
          ? 'Підтвердження входу'
          : view === 'register'
            ? 'Створіть акаунт'
            : 'Увійдіть у PlantShop';

  const headerDescription =
    view === 'forgot-password'
      ? 'Скидання пароля відбувається прямо тут, без переходу на окрему сторінку.'
      : view === 'verification-pending'
        ? 'Ми не створюємо повний акаунт, доки ви не підтвердите володіння email.'
        : view === 'challenge'
          ? 'Основні облікові дані перевірені. Завершіть вхід кодом із листа.'
          : view === 'register'
            ? 'Створіть акаунт, щоб оформлювати замовлення та керувати кабінетом.'
            : 'Увійдіть, щоб керувати профілем, замовленнями та налаштуваннями.';

  const motionDirection =
    view === 'register'
      ? 1
      : view === 'login'
        ? -1
        : 0;

  return (
    <AnimatePresence mode="wait">
      {showAuth && (
        <MotionDiv
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          style={{ willChange: 'opacity' }}
        >
          <MotionDiv
            ref={authModalRef}
            variants={scaleInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-h-[90vh] w-full max-w-md overflow-hidden overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-gray-800"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-emerald-500 to-green-600" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="p-6 lg:p-8">
              <div className="mb-6 flex justify-center">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-xl font-bold text-transparent">
                    PlantShop
                  </span>
                </div>
              </div>

              {(view === 'login' || view === 'register') && (
                <div className="mb-6 flex justify-center rounded-2xl bg-gray-100 p-1 dark:bg-gray-700">
                  <button
                    onClick={() => switchBaseView('login')}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      view === 'login'
                        ? 'bg-white text-emerald-600 shadow-sm dark:bg-gray-600 dark:text-emerald-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Увійти
                  </button>
                  <button
                    onClick={() => switchBaseView('register')}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      view === 'register'
                        ? 'bg-white text-emerald-600 shadow-sm dark:bg-gray-600 dark:text-emerald-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Реєстрація
                  </button>
                </div>
              )}

              {view !== 'login' && view !== 'register' && (
                <button
                  type="button"
                  onClick={() => switchBaseView('login')}
                  className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Повернутися до входу
                </button>
              )}

              <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  {headerTitle}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {headerDescription}
                </p>
              </div>

              <MotionDiv
                key={view}
                custom={motionDirection}
                variants={tabContentVariants}
                initial={false}
                animate="visible"
                style={{ willChange: 'transform, opacity' }}
              >
                  {(view === 'login' || view === 'register') && (
                    <form onSubmit={handleCredentialSubmit} className="space-y-4">
                      {view === 'register' && (
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Ім'я"
                            value={form.name}
                            onChange={(event) =>
                              handleInputChange('name', event.target.value)
                            }
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-base text-gray-800 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-emerald-800"
                          />
                        </div>
                      )}

                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          placeholder="Email"
                          value={form.email}
                          onChange={(event) =>
                            handleInputChange('email', event.target.value)
                          }
                          required
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-base text-gray-800 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-emerald-800"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          placeholder="Пароль"
                          value={form.password}
                          onChange={(event) =>
                            handleInputChange('password', event.target.value)
                          }
                          required
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-base text-gray-800 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-emerald-800"
                        />
                      </div>

                      {view === 'login' && (
                        <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={form.rememberMe}
                              onChange={(event) =>
                                handleInputChange(
                                  'rememberMe',
                                  event.target.checked,
                                )
                              }
                              className="h-4 w-4 rounded accent-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            />
                            <span>Запам&apos;ятати мене</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              clearTransientState();
                              setView('forgot-password');
                            }}
                            className="text-right text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                          >
                            Забули пароль?
                          </button>
                        </div>
                      )}

                      <div className="flex min-h-[78px] items-center justify-center py-2">
                        {renderRecaptcha()}
                      </div>

                      {localError && (
                        <MotionP
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg bg-red-50 py-2 text-center text-sm text-red-500 dark:bg-red-900/20"
                          style={{ willChange: 'transform, opacity' }}
                        >
                          {localError}
                        </MotionP>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !isCredentialsFormValid}
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Зачекайте...</span>
                          </div>
                        ) : view === 'login' ? (
                          'Увійти'
                        ) : (
                          'Продовжити'
                        )}
                      </button>
                    </form>
                  )}

                  {view === 'forgot-password' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          placeholder="Email"
                          value={form.email}
                          onChange={(event) =>
                            handleInputChange('email', event.target.value)
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-base text-gray-800 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-emerald-800"
                        />
                      </div>

                      <div
                        className={`rounded-xl px-4 py-3 text-sm ${
                          forgotStatus === 'error'
                            ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
                            : forgotStatus === 'success'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : 'border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {forgotMessage}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        {loading ? 'Надсилаємо...' : 'Надіслати інструкції'}
                      </button>
                    </form>
                  )}

                  {view === 'verification-pending' && verificationState && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">
                        <p className="font-medium">Email для підтвердження</p>
                        <p className="mt-1 break-all">{verificationState.email}</p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                        {verificationState.message}
                      </div>

                      {verificationState.waitSeconds ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                          Новий лист можна запросити приблизно через{' '}
                          {verificationState.waitSeconds} с.
                        </div>
                      ) : null}

                      {localError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                          {localError}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleResendVerification()}
                        disabled={loading}
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        {loading ? 'Надсилаємо...' : 'Надіслати лист повторно'}
                      </button>
                    </div>
                  )}

                  {view === 'challenge' && challengeState && (
                    <form onSubmit={handleChallengeSubmit} className="space-y-4">
                      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">
                        <div className="flex items-start gap-3">
                          <Shield className="mt-0.5 h-5 w-5 shrink-0" />
                          <div>
                            <p className="font-medium">Підтвердження для {challengeState.email}</p>
                            <p className="mt-1">{challengeState.message}</p>
                          </div>
                        </div>
                      </div>

                      {challengeState.waitSeconds ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                          Якщо лист щойно відправлено, зачекайте приблизно{' '}
                          {challengeState.waitSeconds} с перед повторною спробою входу.
                        </div>
                      ) : null}

                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder="Код із листа"
                          value={challengeCode}
                          onChange={(event) =>
                            setChallengeCode(
                              event.target.value.replace(/\D/g, '').slice(0, 6),
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-base tracking-[0.2em] text-gray-800 shadow-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-emerald-800"
                        />
                      </div>

                      {localError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                          {localError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        {loading ? 'Перевіряємо...' : 'Завершити вхід'}
                      </button>
                    </form>
                  )}
              </MotionDiv>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
