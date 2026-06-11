'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LazyMotion, m as motion, domAnimation, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

import { useAuth, type User as AuthUser } from '@/contexts/AuthContext';
import { useNotification } from '@/app/components/NotificationSystem';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { changePassword, getSecurityErrorMessage } from '@/lib/auth-security';

// ---- Типи ----

type SectionId = 'profile' | 'notifications' | 'security';

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

interface SettingsValidationErrors {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function createPasswordState(): PasswordFormState {
  return {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
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

// ---- Базові компоненти / UI ----

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
  hint?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, disabled = false, hint }) => {
  const inputId = React.useId();

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50 dark:focus:ring-emerald-900/40"
      />
      {hint && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
};

const Textarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, disabled = false }) => {
  const textareaId = React.useId();

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={textareaId}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50 dark:focus:ring-emerald-900/40"
      />
    </div>
  );
};

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
    role="switch"
    aria-checked={checked}
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
        'flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition ' +
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

// ---- Основна сторінка ----

export default function SettingsPage() {
  const { user, checkAuth, isLoading } = useAuth();
  const { addNotification } = useNotification();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileState>(() =>
    createProfileState(user),
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(() =>
    createNotificationState(user),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(() =>
    createPasswordState(),
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Синхронізуємо форму з оновленим user (повторний /auth/me, збереження),
  // але НЕ перетираємо незбережені редагування користувача: порівнюємо
  // поточні значення форми з останнім синхронізованим знімком.
  const lastSyncedUserRef = React.useRef<AuthUser | null>(user);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const previousProfile = createProfileState(lastSyncedUserRef.current);
      const previousNotifications = createNotificationState(
        lastSyncedUserRef.current,
      );

      setProfile((prev) =>
        JSON.stringify(prev) === JSON.stringify(previousProfile)
          ? createProfileState(user)
          : prev,
      );
      setNotifications((prev) =>
        JSON.stringify(prev) === JSON.stringify(previousNotifications)
          ? createNotificationState(user)
          : prev,
      );
      lastSyncedUserRef.current = user;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [user]);

  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const controlsDisabled = isLoading || isSaving;
  const passwordControlsDisabled = controlsDisabled || isChangingPassword;

  const savedProfile = useMemo(() => createProfileState(user), [user]);
  const savedNotifications = useMemo(() => createNotificationState(user), [user]);

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
  const passwordValidationMessage = useMemo(() => {
    if (
      !passwordForm.currentPassword &&
      !passwordForm.newPassword &&
      !passwordForm.confirmPassword
    ) {
      return null;
    }

    if (passwordForm.currentPassword.length < 6) {
      return 'Поточний пароль має містити щонайменше 6 символів.';
    }

    if (passwordForm.newPassword.length < 8) {
      return 'Новий пароль має містити щонайменше 8 символів.';
    }

    if (!/^(?=\S+$)(?=.*\p{L})(?=.*\d).+$/u.test(passwordForm.newPassword)) {
      return 'Новий пароль має містити щонайменше одну літеру, одну цифру і не містити пробілів.';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return 'Новий пароль і підтвердження не співпадають.';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      return 'Новий пароль має відрізнятися від поточного.';
    }

    return null;
  }, [passwordForm]);
  const canSubmitPasswordChange =
    !passwordControlsDisabled &&
    !passwordValidationMessage &&
    !!passwordForm.currentPassword &&
    !!passwordForm.newPassword &&
    !!passwordForm.confirmPassword;
  const hasChanges = useMemo(
    () =>
      JSON.stringify(profile) !== JSON.stringify(savedProfile) ||
      JSON.stringify(notifications) !== JSON.stringify(savedNotifications),
    [notifications, profile, savedNotifications, savedProfile],
  );

  const sidebarItems: { id: SectionId; label: string; icon: React.ReactNode }[] = useMemo(
    () => [
      { id: 'profile', label: 'Профіль', icon: <User className="h-4 w-4" /> },
      { id: 'notifications', label: 'Сповіщення', icon: <Bell className="h-4 w-4" /> },
      { id: 'security', label: 'Безпека', icon: <Shield className="h-4 w-4" /> },
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

        const authConfirmed = await checkAuth();
        if (!authConfirmed) {
          addNotification({
            type: 'warning',
            title: 'Налаштування збережено',
            message:
              'Дані оновлено, але не вдалося повторно підтвердити сесію. Оновіть сторінку, якщо зміни не відображаються.',
            duration: 4000,
          });
          return;
        }

        addNotification({
          type: 'success',
          title: 'Налаштування збережено',
          message: 'Профіль і налаштування сповіщень оновлено.',
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
    profile,
  ]);

  const handleReset = useCallback(() => {
    setProfile(createProfileState(user));
    setNotifications(createNotificationState(user));
    addNotification({
      type: 'info',
      title: 'Форму скинуто',
      message: 'Повернули останні збережені значення.',
      duration: 2500,
    });
  }, [addNotification, user]);

  const handleChangePassword = useCallback(() => {
    void (async () => {
      if (!canSubmitPasswordChange) {
        return;
      }

      try {
        setIsChangingPassword(true);

        const result = await changePassword(passwordForm);

        if (!result.success) {
          addNotification({
            type:
              result.errorCode === 'TEMPORARILY_UNAVAILABLE'
                ? 'warning'
                : 'error',
            title:
              result.errorCode === 'TEMPORARILY_UNAVAILABLE'
                ? 'Сервіс безпеки тимчасово недоступний'
                : 'Не вдалося змінити пароль',
            message: getSecurityErrorMessage(
              result.errorCode,
              result.message || 'Не вдалося змінити пароль.',
            ),
            duration: 4000,
          });
          return;
        }

        setPasswordForm(createPasswordState());
        await checkAuth();
        addNotification({
          type: 'success',
          title: 'Пароль змінено',
          message:
            'Для безпеки ми завершили поточну сесію. Увійдіть знову з новим паролем.',
          duration: 3500,
        });
        router.push('/');
        router.refresh();
      } finally {
        setIsChangingPassword(false);
      }
    })();
  }, [
    addNotification,
    canSubmitPasswordChange,
    checkAuth,
    passwordForm,
    router,
  ]);

  const handleRetryLoad = useCallback(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          {/* Хедер */}
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад до кабінету
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                  Налаштування профілю
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Особисті дані, сповіщення та безпека вашого акаунта.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                disabled={controlsDisabled || !hasChanges || hasValidationErrors}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400/60"
              >
                {isSaving ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </motion.header>

          {isLoading && !user ? (
            <Card className="p-6">
              <div className="space-y-4" aria-label="Завантаження налаштувань">
                <div className="h-5 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
              </div>
            </Card>
          ) : !user ? (
            <Card className="p-8 text-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Не вдалося завантажити дані акаунта
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
                Сервер тимчасово не відповідає. Спробуйте оновити дані за
                кілька секунд.
              </p>
              <button
                type="button"
                onClick={handleRetryLoad}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
              >
                <RefreshCw className="h-4 w-4" />
                Спробувати ще раз
              </button>
            </Card>
          ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)]">
            {/* Сайдбар */}
            <Card className="p-4 sm:p-6 h-fit">
              <nav className="space-y-1.5" aria-label="Розділи налаштувань">
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
              </nav>
            </Card>

            {/* Основний контент */}
            <div className="space-y-6">
              {(hasChanges || hasValidationErrors) && (
                <Card className="p-4 sm:p-5">
                  <div
                    className={
                      'rounded-xl border px-4 py-3 text-sm ' +
                      (hasValidationErrors
                        ? 'border-red-200 bg-red-50/80 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200'
                        : 'border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200')
                    }
                  >
                    {hasValidationErrors
                      ? 'Щоб зберегти зміни, спочатку виправте поля з помилками.'
                      : 'Є незбережені зміни — не забудьте натиснути «Зберегти зміни».'}
                  </div>
                </Card>
              )}

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
                      description="Ці дані ми використовуємо для оформлення замовлень і звʼязку з вами."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Імʼя"
                          value={profile.name}
                          onChange={(value) =>
                            setProfile((prev) => ({ ...prev, name: value }))
                          }
                          placeholder="Ваше імʼя"
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
                          hint="Email використовується для входу, тому змінити його не можна."
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
                          placeholder="Наприклад: люблю монстери та світлі інтерʼєри..."
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
                      description="Оберіть, які листи ви хочете отримувати від PlantShop."
                    >
                      <div className="space-y-3">
                        <ToggleRow
                          label="Email-сповіщення"
                          description="Основні листи про ваш акаунт."
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
                          description="Зміни статусу замовлення та доставки."
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
                          label="Поради з догляду"
                          description="Сезонні поради про полив, підживлення та пересадку."
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
                          description="Знижки, новинки каталогу та сезонні пропозиції."
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

                {activeSection === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionShell
                      icon={<Shield className="h-5 w-5" />}
                      title="Безпека акаунта"
                      description="Змініть пароль для входу у ваш акаунт."
                    >
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <Input
                              label="Поточний пароль"
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(value) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  currentPassword: value,
                                }))
                              }
                              placeholder="********"
                              disabled={passwordControlsDisabled}
                            />
                            <Input
                              label="Новий пароль"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(value) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  newPassword: value,
                                }))
                              }
                              placeholder="********"
                              disabled={passwordControlsDisabled}
                            />
                            <Input
                              label="Підтвердження"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(value) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  confirmPassword: value,
                                }))
                              }
                              placeholder="********"
                              disabled={passwordControlsDisabled}
                            />
                          </div>
                          {passwordValidationMessage ? (
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                              {passwordValidationMessage}
                            </p>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              Новий пароль: щонайменше 8 символів, з літерою та
                              цифрою. Після зміни пароля потрібно буде увійти
                              знову на всіх пристроях.
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={handleChangePassword}
                              disabled={!canSubmitPasswordChange}
                              className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400/60"
                            >
                              {isChangingPassword
                                ? 'Оновлюємо пароль...'
                                : 'Змінити пароль'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPasswordForm(createPasswordState())}
                              disabled={passwordControlsDisabled}
                              className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200"
                            >
                              Очистити поля
                            </button>
                          </div>
                        </div>

                        <p className="border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:text-sm">
                          Щоб отримати копію своїх даних або видалити акаунт,{' '}
                          <Link
                            href="/contact"
                            className="font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400"
                          >
                            напишіть нам
                          </Link>{' '}
                          — ми обробимо запит вручну.
                        </p>
                      </div>
                    </SectionShell>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          )}
        </main>
      </div>
    </LazyMotion>
  );
}
