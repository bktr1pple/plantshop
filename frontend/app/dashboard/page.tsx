'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { m as motion, LazyMotion, domAnimation } from 'framer-motion';
import {
  User,
  Settings,
  LogOut,
  ShoppingBag,
  Heart,
  Calendar,
  Sprout,
  Truck,
  CheckCircle,
  Clock,
} from 'lucide-react';

import { useNotification } from '@/app/components/NotificationSystem';
import { useAuth } from '@/contexts/AuthContext';

// ---- Типы (на будущее, когда подключишь реальные данные) ----

interface Order {
  id: string;
  plantName: string;
  orderDate: string;
  status: 'preparing' | 'shipped' | 'delivered';
  price: number;
}

// Небольшой мок — чтобы страница не была пустой
const mockOrders: Order[] = [
  {
    id: '1',
    plantName: 'Монстера деліціоза',
    orderDate: '10.11.2025',
    status: 'delivered',
    price: 1450,
  },
  {
    id: '2',
    plantName: 'Фікус ліровидний',
    orderDate: '05.11.2025',
    status: 'shipped',
    price: 1890,
  },
  {
    id: '3',
    plantName: 'Сансевієрія',
    orderDate: '01.11.2025',
    status: 'preparing',
    price: 780,
  },
];

// ---- Вспомогательные компоненты ----

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className={
      'rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100/70 dark:border-gray-800/80 shadow-sm ' +
      'backdrop-blur-lg ' +
      className
    }
  >
    {children}
  </motion.div>
);

const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}> = ({ icon, label, value, hint }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-base font-semibold text-gray-900 dark:text-gray-50">
        {value}
      </span>
      {hint && (
        <span className="text-sm text-gray-500 dark:text-gray-400">{hint}</span>
      )}
    </div>
  </div>
);

const StatusPill: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const config: Record<Order['status'], { label: string; className: string; Icon: typeof Clock }> =
    {
      preparing: {
        label: 'Готується',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        Icon: Clock,
      },
      shipped: {
        label: 'В дорозі',
        className: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        Icon: Truck,
      },
      delivered: {
        label: 'Доставлено',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        Icon: CheckCircle,
      },
    };

  const { label, className, Icon } = config[status];

  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ' +
        className
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

// ---- Основная страница ----

export default function DashboardPage() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const { user, logout, isLoading } = useAuth();

  const displayName = useMemo(
    () => user?.name || user?.email || 'Гість',
    [user]
  );

  // В будущем сюда можно подставить реальные значения из API
  const stats = useMemo(
    () => [
      {
        label: 'Активні замовлення',
        value: '3',
        hint: 'є рослини в дорозі',
        icon: <ShoppingBag className="h-4 w-4" />,
      },
      {
        label: 'Список бажаного',
        value: '8',
        hint: 'рослин у «Обраному»',
        icon: <Heart className="h-4 w-4" />,
      },
      {
        label: 'Останнє замовлення',
        value: '10.11.2025',
        hint: 'доставка завершена',
        icon: <Calendar className="h-4 w-4" />,
      },
    ],
    []
  );

  const handleEditProfile = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Редагування профілю',
      message: 'Форма редагування профілю ще в розробці.',
      duration: 3500,
    });
  }, [addNotification]);

  const handleGoToOrders = useCallback(() => {
      router.push('/dashboard/orders');
    }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/dashboard/settings');
  }, [router]);

  const handleLogout = useCallback(async () => {
    addNotification({
      type: 'success',
      title: 'Вихід з акаунта',
      message: 'Ви успішно вийшли з акаунта.',
      action: {
        label: 'Ви успішно вийшли з акаунта.',
        onClick: () => console.log('test'),
      },
      duration: 3000,
    });
    router.push('/');
    await logout();
  }, [logout, router, addNotification]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          {/* Верхний блок: приветствие + основные действия */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Особистий кабінет
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                Вітаємо, {displayName}
              </h1>
              <p className="max-w-xl text-base text-gray-600 dark:text-gray-400">
                Тут ви можете відстежувати свої замовлення, переглядати улюблені
                рослини та керувати профілем. Усе, що стосується вашого зеленого
                простору — в одному місці.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSettings}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-gray-900 px-4 py-2.5 text-base font-medium text-white shadow-sm transition hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <Settings className="h-4 w-4" />
                Налаштування
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-red-50 px-4 py-2.5 text-base font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
              >
                <LogOut className="h-4 w-4" />
                Вийти
              </button>
            </div>
          </motion.section>

          {/* Статистика + короткий блок про «ваш зелений простір» */}
          <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Ваші показники
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Оновлюється автоматично після нових замовлень
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <StatItem
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    hint={stat.hint}
                    icon={stat.icon}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Sprout className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                    Ваш зелений простір
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Збирайте колекцію декоративних рослин, створюйте затишні
                    куточки вдома та в саду. Ми збережемо історію ваших покупок і
                    допоможемо підібрати догляд.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGoToOrders}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                <ShoppingBag className="h-4 w-4" />
                Перейти до замовлень
              </button>
            </Card>
          </section>

          {/* Останні замовлення + права колонка (короткий огляд догляду / майбутній функціонал) */}
          <section className="grid gap-6">
            {/* Останні замовлення */}
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Останні замовлення
                </h2>
                <button
                  onClick={handleGoToOrders}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Переглянути всі
                </button>
              </div>

              {mockOrders.length === 0 ? (
                <p className="py-4 text-base text-gray-500 dark:text-gray-400">
                  Ви ще не робили замовлень. Оберіть першу рослину у каталозі —
                  ми допоможемо з доглядом 🌿
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center gap-4 py-3.5 text-base"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <Sprout className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-gray-900 dark:text-gray-50">
                          {order.plantName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.orderDate}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-50">
                          {order.price.toLocaleString('uk-UA')} ₴
                        </span>
                        <StatusPill status={order.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          {/* Лоадер при первой инициализации (опционально, но аккуратно для UX) */}
          {isLoading && (
            <div className="fixed inset-x-0 top-16 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-gray-500 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900/90 dark:text-gray-300 dark:ring-gray-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Оновлення даних профілю…
              </div>
            </div>
          )}
        </main>
      </div>
    </LazyMotion>
  );
}
