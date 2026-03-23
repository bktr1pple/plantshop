'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LazyMotion, m as motion, domAnimation, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

import { useAuth, type User as AuthUser } from '@/contexts/AuthContext';
import { useNotification } from '@/app/components/NotificationSystem';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';

// ---- Типы ----

type SectionId = 'profile' | 'notifications' | 'privacy' | 'data';

interface ProfileState {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  careReminders: boolean;
  promotional: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  personalizedAds: boolean;
}

interface SettingsValidationErrors {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

function createProfileState(user: AuthUser | null): ProfileState {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    bio: user?.bio ?? '',
  };
}

function createNotificationState(user: AuthUser | null): NotificationSettings {
  return {
    emailNotifications: user?.emailNotifications ?? true,
    orderUpdates: user?.orderUpdates ?? true,
    careReminders: user?.careReminders ?? true,
    promotional: user?.promotional ?? false,
  };
}

function createPrivacyState(user: AuthUser | null): PrivacySettings {
  return {
    profileVisibility: user?.profileVisibility ?? 'friends',
    dataSharing: user?.dataSharing ?? false,
    personalizedAds: user?.personalizedAds ?? false,
  };
}

interface NavigationProps {
  children: React.ReactNode
  className?: string
}

export function Navigation({ children, className }: NavigationProps) {
  return (
    <nav className={cn('space-y-1.5', className)}>
      {children}
    </nav>
  )
}

interface NavigationItemProps {
  children: React.ReactNode
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export function NavigationItem({ 
  children, 
  isActive = false, 
  onClick, 
  className 
}: NavigationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
        isActive
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900',
        className
      )}
    >
      {children}
    </button>
  )
}

// ---- Базовые компоненты / UI ----

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className={
      'rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100/70 dark:border-gray-800/80 shadow-sm backdrop-blur-lg ' +
      className
    }
  >
    {children}
  </motion.div>
);

const SectionShell: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
  <Card className="p-5 sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
        {icon}
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
    {children}
  </Card>
);

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, type = 'text', placeholder, disabled = false }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50 dark:focus:ring-emerald-900/40"
    />
  </div>
);

const Textarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, disabled = false }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={4}
      className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50 dark:focus:ring-emerald-900/40"
    />
  </div>
);

const ToggleRow: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}> = ({ label, description, checked, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    disabled={disabled}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5 text-left text-sm transition hover:border-emerald-200 hover:bg-emerald-50/60 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-800 dark:bg-gray-900/70 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"
  >
    <div>
      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-50">{label}</p>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
    <div
      className={
        'flex h-5 w-9 items-center rounded-full px-0.5 transition ' +
        (checked
          ? 'bg-emerald-500'
          : 'bg-gray-300 dark:bg-gray-700')
      }
    >
      <div
        className={
          'h-4 w-4 rounded-full bg-white shadow-sm transition-transform ' +
          (checked ? 'translate-x-4' : 'translate-x-0')
        }
      />
    </div>
  </button>
);

// ---- Основная страница ----

export default function SettingsPage() {
  const { user, checkAuth, isLoading } = useAuth();
  const { addNotification } = useNotification();

  const [profile, setProfile] = useState<ProfileState>(() =>
    createProfileState(user),
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(() =>
    createNotificationState(user),
  );
  const [privacy, setPrivacy] = useState<PrivacySettings>(() =>
    createPrivacyState(user),
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProfile(createProfileState(user));
      setNotifications(createNotificationState(user));
      setPrivacy(createPrivacyState(user));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [user]);

  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const accountSettingsBackendConnected = true;
  const controlsDisabled = isLoading || isSaving;

  const savedProfile = useMemo(() => createProfileState(user), [user]);
  const savedNotifications = useMemo(() => createNotificationState(user), [user]);
  const savedPrivacy = useMemo(() => createPrivacyState(user), [user]);

  const validationErrors = useMemo<SettingsValidationErrors>(() => {
    const errors: SettingsValidationErrors = {};

    if (profile.name.length > 120) {
      errors.name = 'Імʼя не може бути довшим за 120 символів.';
    }

    if (profile.phone.length > 50) {
      errors.phone = 'Телефон не може бути довшим за 50 символів.';
    }

    if (profile.address.length > 191) {
      errors.address = 'Адреса не може бути довшою за 191 символ.';
    }

    if (profile.bio.length > 1000) {
      errors.bio = 'Опис не може бути довшим за 1000 символів.';
    }

    return errors;
  }, [profile]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const hasChanges = useMemo(
    () =>
      JSON.stringify(profile) !== JSON.stringify(savedProfile) ||
      JSON.stringify(notifications) !== JSON.stringify(savedNotifications) ||
      JSON.stringify(privacy) !== JSON.stringify(savedPrivacy),
    [notifications, privacy, profile, savedNotifications, savedPrivacy, savedProfile],
  );

  const sidebarItems: { id: SectionId; label: string; icon: React.ReactNode }[] = useMemo(
    () => [
      { id: 'profile', label: 'Профіль', icon: <User className="h-4 w-4" /> },
      { id: 'notifications', label: 'Сповіщення', icon: <Bell className="h-4 w-4" /> },
      { id: 'privacy', label: 'Конфіденційність', icon: <Shield className="h-4 w-4" /> },
      { id: 'data', label: 'Дані та акаунт', icon: <Download className="h-4 w-4" /> },
    ],
    []
  );

  const handleSave = useCallback(() => {
    void (async () => {
      if (!hasChanges || hasValidationErrors || controlsDisabled) {
        return;
      }

      try {
        setIsSaving(true);

        const { res, unauthorized, temporaryFailure } = await fetchWithRefresh(
          '/auth/me',
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: profile.name,
              phone: profile.phone,
              address: profile.address,
              bio: profile.bio,
              emailNotifications: notifications.emailNotifications,
              orderUpdates: notifications.orderUpdates,
              careReminders: notifications.careReminders,
              promotional: notifications.promotional,
              profileVisibility: privacy.profileVisibility,
              dataSharing: privacy.dataSharing,
              personalizedAds: privacy.personalizedAds,
            }),
          },
        );

        if (unauthorized) {
          addNotification({
            type: 'error',
            title: 'Сесію не підтверджено',
            message:
              'Не вдалося зберегти налаштування без активної авторизації.',
            duration: 3500,
          });
          return;
        }

        if (!res) {
          addNotification({
            type: 'error',
            title: 'Не вдалося зберегти налаштування',
            message: 'Спробуйте ще раз пізніше.',
            duration: 3500,
          });
          return;
        }

        let responseBody: { user?: AuthUser; message?: string | string[] } | null = null;
        try {
          responseBody = (await res.json()) as {
            user?: AuthUser;
            message?: string | string[];
          };
        } catch {
          responseBody = null;
        }

        if (!res.ok) {
          const rawMessage = responseBody?.message;
          const message = Array.isArray(rawMessage)
            ? rawMessage[0]
            : rawMessage;

          addNotification({
            type: 'error',
            title: 'Не вдалося зберегти налаштування',
            message:
              message ||
              (temporaryFailure
                ? 'Сервер тимчасово не зміг обробити запит. Спробуйте ще раз.'
                : 'Сервер не підтвердив збереження даних.'),
            duration: 3500,
          });
          return;
        }

        if (!responseBody?.user) {
          addNotification({
            type: 'error',
            title: 'Не вдалося зберегти налаштування',
            message: 'Сервер не підтвердив збереження даних.',
            duration: 3500,
          });
          return;
        }

        setProfile(createProfileState(responseBody.user));
        setNotifications(createNotificationState(responseBody.user));
        setPrivacy(createPrivacyState(responseBody.user));
        await checkAuth();

        addNotification({
          type: 'success',
          title: 'Налаштування збережено',
          message:
            'Профіль, сповіщення та параметри конфіденційності оновлено.',
          duration: 3000,
        });
      } finally {
        setIsSaving(false);
      }
    })();
  }, [
    addNotification,
    checkAuth,
    controlsDisabled,
    hasChanges,
    hasValidationErrors,
    notifications,
    privacy,
    profile,
  ]);

  const handleReset = useCallback(() => {
    setProfile(createProfileState(user));
    setNotifications(createNotificationState(user));
    setPrivacy(createPrivacyState(user));
    addNotification({
      type: 'info',
      title: 'Форму скинуто',
      message: 'Повернули останні збережені значення акаунта.',
      duration: 2500,
    });
  }, [addNotification, user]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          {/* Хедер */}
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад до кабінету
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                  Налаштування профілю
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Керуйте особистими даними, сповіщеннями та параметрами конфіденційності для поточного акаунта.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 ring-1 ring-sky-100 dark:bg-sky-900/20 dark:text-sky-200 dark:ring-sky-800/50">
                Профіль і налаштування акаунта зберігаються на backend
              </span>
              <button
                type="button"
                onClick={handleReset}
                disabled={controlsDisabled || !hasChanges}
                className="rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-900"
              >
                Скинути
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  !accountSettingsBackendConnected ||
                  controlsDisabled ||
                  !hasChanges ||
                  hasValidationErrors
                }
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400/60"
              >
                {isSaving
                  ? 'Збереження...'
                  : isLoading
                    ? 'Завантаження...'
                    : 'Зберегти зміни'}
              </button>
            </div>
          </motion.header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)]">
            {/* Сайдбар */}
            <Card className="p-4 sm:p-6 h-fit">
              <Navigation className="space-y-1.5">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={
                      'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ' +
                      (activeSection === item.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900')
                    }
                  >
                    <span
                      className={
                        'flex h-8 w-8 items-center justify-center rounded-lg ' +
                        (activeSection === item.id
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300')
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm sm:text-base">{item.label}</span>
                  </button>
                ))}
              </Navigation>
            </Card>

            {/* Основной контент */}
            <div className="space-y-6">
              <Card className="p-4 sm:p-5">
                <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
                  {isLoading
                    ? 'Завантажуємо поточні налаштування акаунта...'
                    : hasValidationErrors
                      ? 'Щоб зберегти зміни, спочатку виправте поля з помилками.'
                      : hasChanges
                        ? 'Є незбережені зміни. Після збереження форма синхронізується з поточним акаунтом.'
                        : 'Форма синхронізована з поточними даними акаунта.'}
                </div>
              </Card>

              <AnimatePresence mode="wait">
                {activeSection === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionShell
                      icon={<User className="h-5 w-5" />}
                      title="Особиста інформація"
                      description="Ім’я та контакти будуть використовуватися для оформлення замовлень та сповіщень."
                    >
                      <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200">
                        Ім&apos;я, телефон, адреса та короткий опис зберігаються для поточного акаунта. Email поки лишається доступним лише для перегляду.
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Ім’я"
                          value={profile.name}
                          onChange={(value) =>
                            setProfile((prev) => ({ ...prev, name: value }))
                          }
                          placeholder="Ваше ім’я"
                          disabled={controlsDisabled}
                        />
                        {validationErrors.name && (
                          <p className="sm:col-span-2 -mt-2 text-sm text-red-600 dark:text-red-400">
                            {validationErrors.name}
                          </p>
                        )}
                        <Input
                          label="Email"
                          type="email"
                          value={profile.email}
                          onChange={() => {}}
                          placeholder="Ваш email"
                          disabled
                        />
                        <Input
                          label="Телефон"
                          type="tel"
                          value={profile.phone}
                          onChange={(value) =>
                            setProfile((prev) => ({ ...prev, phone: value }))
                          }
                          placeholder="+380..."
                          disabled={controlsDisabled}
                        />
                        <Input
                          label="Адреса доставки"
                          value={profile.address}
                          onChange={(value) =>
                            setProfile((prev) => ({ ...prev, address: value }))
                          }
                          placeholder="Місто, вулиця, відділення пошти"
                          disabled={controlsDisabled}
                        />
                      </div>
                      {(validationErrors.phone || validationErrors.address) && (
                        <div className="mt-3 space-y-1">
                          {validationErrors.phone && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {validationErrors.phone}
                            </p>
                          )}
                          {validationErrors.address && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {validationErrors.address}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-4">
                        <Textarea
                          label="Коротко про вас і ваші рослини"
                          value={profile.bio}
                          onChange={(value) =>
                            setProfile((prev) => ({ ...prev, bio: value }))
                          }
                          placeholder="Наприклад: люблю монстери та світлі інтер’єри..."
                          disabled={controlsDisabled}
                        />
                        {validationErrors.bio && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {validationErrors.bio}
                          </p>
                        )}
                      </div>
                    </SectionShell>
                  </motion.div>
                )}

                {activeSection === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionShell
                      icon={<Bell className="h-5 w-5" />}
                      title="Сповіщення"
                      description="Оберіть, які повідомлення ви хочете отримувати від PlantShop."
                    >
                      <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200">
                        Ці налаштування зберігаються для поточного акаунта й застосовуються як налаштування сповіщень.
                      </div>
                      <div className="space-y-3">
                        <ToggleRow
                          label="Email-сповіщення"
                          description="Основні оновлення по акаунту та замовленнях."
                          checked={notifications.emailNotifications}
                          onChange={(value) =>
                            setNotifications((prev) => ({
                              ...prev,
                              emailNotifications: value,
                            }))
                          }
                          disabled={controlsDisabled}
                        />
                        <ToggleRow
                          label="Оновлення замовлень"
                          description="Статус замовлення, відправлення, доставка."
                          checked={notifications.orderUpdates}
                          onChange={(value) =>
                            setNotifications((prev) => ({
                              ...prev,
                              orderUpdates: value,
                            }))
                          }
                          disabled={controlsDisabled}
                        />
                        <ToggleRow
                          label="Нагадування по догляду"
                          description="Полив, підживлення та інші корисні поради."
                          checked={notifications.careReminders}
                          onChange={(value) =>
                            setNotifications((prev) => ({
                              ...prev,
                              careReminders: value,
                            }))
                          }
                          disabled={controlsDisabled}
                        />
                        <ToggleRow
                          label="Акції та спецпропозиції"
                          checked={notifications.promotional}
                          onChange={(value) =>
                            setNotifications((prev) => ({
                              ...prev,
                              promotional: value,
                            }))
                          }
                          disabled={controlsDisabled}
                        />
                      </div>
                    </SectionShell>
                  </motion.div>
                )}

                {activeSection === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionShell
                      icon={<Shield className="h-5 w-5" />}
                      title="Конфіденційність та безпека"
                      description="Керуйте тим, хто бачить інформацію про вас, та налаштуйте безпеку входу."
                    >
                      <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200">
                        Параметри конфіденційності нижче зберігаються для поточного акаунта. Зміна пароля ще лишається недоступною.
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                            Видимість профілю
                          </p>
                          <div className="grid gap-2 sm:grid-cols-3">
                            {([
                              {
                                id: 'public',
                                label: 'Публічний',
                                desc: 'Профіль можуть бачити всі.',
                              },
                              {
                                id: 'friends',
                                label: 'Тільки клієнти',
                                desc: 'Рекомендовано для більшості користувачів.',
                              },
                              {
                                id: 'private',
                                label: 'Приватний',
                                desc: 'Профіль бачите лише ви.',
                              },
                            ] as const).map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  setPrivacy((prev) => ({
                                    ...prev,
                                    profileVisibility: opt.id,
                                  }))
                                }
                                disabled={controlsDisabled}
                                className={
                                  'flex flex-col items-start rounded-xl border px-3 py-2.5 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-70 ' +
                                  (privacy.profileVisibility === opt.id
                                    ? 'border-emerald-500 bg-emerald-50/80 text-gray-900 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-gray-50'
                                    : 'border-gray-200 bg-white/70 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-200 dark:hover:border-emerald-600')
                                }
                              >
                                <span className="text-sm font-semibold">{opt.label}</span>
                                <span className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  {opt.desc}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                            Дані та персоналізація
                          </p>
                          <ToggleRow
                            label="Анонімна аналітика"
                            description="Допомагає нам покращувати PlantShop. Без персональних даних."
                            checked={privacy.dataSharing}
                            onChange={(value) =>
                              setPrivacy((prev) => ({
                                ...prev,
                                dataSharing: value,
                              }))
                            }
                            disabled={controlsDisabled}
                          />
                          <ToggleRow
                            label="Персоналізовані рекомендації"
                            description="Підбір рослин з урахуванням ваших замовлень та переглядів."
                            checked={privacy.personalizedAds}
                            onChange={(value) =>
                              setPrivacy((prev) => ({
                                ...prev,
                                personalizedAds: value,
                              }))
                            }
                            disabled={controlsDisabled}
                          />
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                            Пароль
                          </p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <Input
                              label="Поточний пароль"
                              type="password"
                              value=""
                              onChange={() => {}}
                              placeholder="********"
                              disabled
                            />
                            <Input
                              label="Новий пароль"
                              type="password"
                              value=""
                              onChange={() => {}}
                              placeholder="********"
                              disabled
                            />
                            <Input
                              label="Підтвердження"
                              type="password"
                              value=""
                              onChange={() => {}}
                              placeholder="********"
                              disabled
                            />
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Зміна пароля буде доступна після підключення відповідного розділу на бекенді.
                          </p>
                        </div>
                      </div>
                    </SectionShell>
                  </motion.div>
                )}

                {activeSection === 'data' && (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionShell
                      icon={<Download className="h-5 w-5" />}
                      title="Дані та акаунт"
                      description="Експортуйте свої дані або керуйте акаунтом."
                    >
                      <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200">
                        Експорт даних і видалення акаунта ще не підключені до backend, тому ці дії лишаються недоступними.
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                            Дані акаунта
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-xs font-medium text-gray-800 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100"
                            >
                              <Download className="h-4 w-4" />
                              Експорт недоступний
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red-600 dark:text-red-300">
                            Небезпечна зона
                          </p>
                          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                            <p className="font-semibold mb-1">
                              Видалення акаунта
                            </p>
                            <p className="mb-3 text-xs">
                              Після видалення акаунта всі ваші замовлення, історія
                              та збережені дані будуть безповоротно видалені.
                            </p>
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <Trash2 className="h-4 w-4" />
                              Видалення недоступне
                            </button>
                          </div>
                        </div>
                      </div>
                    </SectionShell>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </LazyMotion>
  );
}
