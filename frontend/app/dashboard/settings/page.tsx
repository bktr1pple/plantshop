'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LazyMotion, m as motion, domAnimation, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Shield,
  Download,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/app/components/NotificationSystem';

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
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50 dark:focus:ring-emerald-900/40"
    />
  </div>
);

const Textarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50 dark:focus:ring-emerald-900/40"
    />
  </div>
);

const ToggleRow: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5 text-left text-sm transition hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-gray-800 dark:bg-gray-900/70 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"
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
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // Профиль
  const [profile, setProfile] = useState<ProfileState>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    bio: '',
  });

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.name ?? prev.name,
      email: user?.email ?? prev.email,
    }));
  }, [user]);

  // Настройки
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    orderUpdates: true,
    careReminders: true,
    promotional: false,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    dataSharing: false,
    personalizedAds: false,
  });

  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [hasChanges, setHasChanges] = useState(false);

  const sidebarItems: { id: SectionId; label: string; icon: React.ReactNode }[] = useMemo(
    () => [
      { id: 'profile', label: 'Профіль', icon: <User className="h-4 w-4" /> },
      { id: 'notifications', label: 'Сповіщення', icon: <Bell className="h-4 w-4" /> },
      { id: 'privacy', label: 'Конфіденційність', icon: <Shield className="h-4 w-4" /> },
      { id: 'data', label: 'Дані та акаунт', icon: <Download className="h-4 w-4" /> },
    ],
    []
  );

  const markChanged = useCallback(() => setHasChanges(true), []);

  const handleProfileChange = useCallback(
    (field: keyof ProfileState, value: string) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
      markChanged();
    },
    [markChanged]
  );

  const handleNotificationChange = useCallback(
    (field: keyof NotificationSettings, value: boolean) => {
      setNotifications((prev) => ({ ...prev, [field]: value }));
      markChanged();
    },
    [markChanged]
  );

  const handlePrivacyChange = useCallback(
    (field: keyof PrivacySettings, value: PrivacySettings[typeof field]) => {
      setPrivacy((prev) => ({ ...prev, [field]: value }));
      markChanged();
    },
    [markChanged]
  );

  const handleSave = useCallback(() => {
    // Здесь в будущем можно вызвать API (PATCH /me, /settings и т.п.)
    addNotification({
      type: 'success',
      title: 'Налаштування збережено',
      message: 'Ваші зміни профілю та налаштувань будуть застосовані.',
      duration: 3000,
    });
    setHasChanges(false);
  }, [addNotification]);

  const handleReset = useCallback(() => {
    setProfile({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: '',
      address: '',
      bio: '',
    });
    setNotifications({
      emailNotifications: true,
      orderUpdates: true,
      careReminders: true,
      promotional: false,
    });
    setPrivacy({
      profileVisibility: 'friends',
      dataSharing: false,
      personalizedAds: false,
    });
    setHasChanges(false);
    addNotification({
      type: 'info',
      title: 'Скидання налаштувань',
      message: 'Налаштування повернено до стандартних значень.',
      duration: 2500,
    });
  }, [user, addNotification]);

  const handleDeleteAccount = useCallback(() => {
    addNotification({
      type: 'error',
      title: 'Видалення акаунта',
      message: 'Функція видалення акаунта буде доступна пізніше.',
      duration: 3500,
    });
  }, [addNotification]);

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
                  Керуйте особистими даними, сповіщеннями та конфіденційністю.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-800/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Є незбережені зміни
                </span>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-900"
              >
                Скинути
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400/60"
              >
                Зберегти зміни
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
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Ім’я"
                          value={profile.name}
                          onChange={(v) => handleProfileChange('name', v)}
                          placeholder="Ваше ім’я"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={profile.email}
                          onChange={(v) => handleProfileChange('email', v)}
                          placeholder="Ваш email"
                        />
                        <Input
                          label="Телефон"
                          type="tel"
                          value={profile.phone}
                          onChange={(v) => handleProfileChange('phone', v)}
                          placeholder="+380..."
                        />
                        <Input
                          label="Адреса доставки"
                          value={profile.address}
                          onChange={(v) => handleProfileChange('address', v)}
                          placeholder="Місто, вулиця, відділення пошти"
                        />
                      </div>

                      <div className="mt-4">
                        <Textarea
                          label="Коротко про вас і ваші рослини"
                          value={profile.bio}
                          onChange={(v) => handleProfileChange('bio', v)}
                          placeholder="Наприклад: люблю монстери та світлі інтер’єри..."
                        />
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
                      <div className="space-y-3">
                        <ToggleRow
                          label="Email-сповіщення"
                          description="Основні оновлення по акаунту та замовленнях."
                          checked={notifications.emailNotifications}
                          onChange={(v) =>
                            handleNotificationChange('emailNotifications', v)
                          }
                        />
                        <ToggleRow
                          label="Оновлення замовлень"
                          description="Статус замовлення, відправлення, доставка."
                          checked={notifications.orderUpdates}
                          onChange={(v) =>
                            handleNotificationChange('orderUpdates', v)
                          }
                        />
                        <ToggleRow
                          label="Нагадування по догляду"
                          description="Полив, підживлення та інші корисні поради."
                          checked={notifications.careReminders}
                          onChange={(v) =>
                            handleNotificationChange('careReminders', v)
                          }
                        />
                        <ToggleRow
                          label="Акції та спецпропозиції"
                          checked={notifications.promotional}
                          onChange={(v) =>
                            handleNotificationChange('promotional', v)
                          }
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
                                  handlePrivacyChange('profileVisibility', opt.id)
                                }
                                className={
                                  'flex flex-col items-start rounded-xl border px-3 py-2.5 text-left text-xs transition ' +
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
                            onChange={(v) =>
                              handlePrivacyChange('dataSharing', v)
                            }
                          />
                          <ToggleRow
                            label="Персоналізовані рекомендації"
                            description="Підбір рослин з урахуванням ваших замовлень та переглядів."
                            checked={privacy.personalizedAds}
                            onChange={(v) =>
                              handlePrivacyChange('personalizedAds', v)
                            }
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
                            />
                            <Input
                              label="Новий пароль"
                              type="password"
                              value=""
                              onChange={() => {}}
                              placeholder="********"
                            />
                            <Input
                              label="Підтвердження"
                              type="password"
                              value=""
                              onChange={() => {}}
                              placeholder="********"
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
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                            Дані акаунта
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                addNotification({
                                  type: 'info',
                                  title: 'Експорт даних',
                                  message:
                                    'Функція експорту даних буде реалізована пізніше.',
                                  duration: 3000,
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-xs font-medium text-gray-800 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100 dark:hover:border-emerald-500"
                            >
                              <Download className="h-4 w-4" />
                              Завантажити копію даних
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
                              onClick={handleDeleteAccount}
                              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Видалити акаунт
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
