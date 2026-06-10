'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m as motion, LazyMotion, domAnimation } from 'framer-motion';
import {
  Settings,
  LogOut,
  ShoppingBag,
  Sprout,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

import { useNotification } from '@/app/components/NotificationSystem';
import { useAuth } from '@/contexts/AuthContext';
import {
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  listCurrentUserOrders,
  type OrderSummary,
} from '@/lib/orders';
import { formatPrice } from '@/lib/format-price';

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className={
      'rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100/70 dark:border-gray-800/80 shadow-sm backdrop-blur-lg ' +
      className
    }
  >
    {children}
  </motion.div>
);

export default function DashboardPage() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const { user, logout, isLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  const displayName = isLoading ? 'Кабінет' : user?.name || user?.email || 'Гість';
  const latestOrder = orders[0] ?? null;

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      if (isLoading) {
        return;
      }

      if (!user) {
        setOrders([]);
        setOrdersError(null);
        setIsOrdersLoading(false);
        return;
      }

      setIsOrdersLoading(true);
      setOrdersError(null);

      try {
        const nextOrders = await listCurrentUserOrders();
        if (cancelled) {
          return;
        }

        setOrders(nextOrders);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setOrders([]);
        setOrdersError(
          error instanceof Error
            ? error.message
            : 'Не вдалося завантажити історію замовлень.',
        );
      } finally {
        if (!cancelled) {
          setIsOrdersLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isLoading, user]);

  const handleGoToOrders = useCallback(() => {
    router.push('/dashboard/orders');
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/dashboard/settings');
  }, [router]);

  const handleLatestOrder = useCallback(() => {
    if (!latestOrder) {
      router.push('/dashboard/orders');
      return;
    }

    router.push(`/dashboard/orders?orderId=${latestOrder.id}`);
  }, [latestOrder, router]);

  const handleLogout = useCallback(async () => {
    const loggedOut = await logout();
    if (!loggedOut) {
      return;
    }

    addNotification({
      type: 'success',
      title: 'Вихід з акаунта',
      message: 'Ви успішно вийшли з акаунта.',
      duration: 3000,
    });
    router.push('/');
  }, [logout, router, addNotification]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
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
                Тут показано тільки те, що реально підключено. Налаштування
                профілю вже зберігаються на backend, а розділ замовлень тепер
                показує реальну історію покупок поточного акаунта без моків.
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

          <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Статус кабінету
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Частково підключено до backend
                </span>
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">Профіль і замовлення працюють через backend</p>
                    <p className="text-sky-700/90 dark:text-sky-100/90">
                      Профіль, сповіщення та історія замовлень уже підключені
                      до реальних current-user backend endpoints. На overview ми
                      все ще не показуємо фейкові метрики або вигадані списки.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleGoToOrders}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Розділ замовлень
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push('/plants')}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                  До каталогу
                </button>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Sprout className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                    Що доступно зараз
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Можна оновлювати профіль, переглядати історію замовлень,
                    відкривати каталог і виходити з акаунта.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSettings}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                <MessageCircle className="h-4 w-4" />
                Переглянути налаштування
              </button>
            </Card>
          </section>

          <section className="grid gap-6">
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Останнє замовлення
                </h2>
                <button
                  onClick={handleGoToOrders}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Переглянути розділ
                </button>
              </div>

              {isOrdersLoading ? (
                <p className="py-4 text-base text-gray-500 dark:text-gray-400">
                  Завантажуємо реальну історію замовлень...
                </p>
              ) : ordersError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-base text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-amber-200">
                  <p className="font-semibold">Історію замовлень зараз не вдалося завантажити</p>
                  <p className="mt-1 text-sm">
                    Перейдіть до розділу замовлень або спробуйте ще раз трохи пізніше.
                  </p>
                  <button
                    type="button"
                    onClick={handleGoToOrders}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    До замовлень
                  </button>
                </div>
              ) : latestOrder ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Замовлення #{latestOrder.id}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Оформлено {new Intl.DateTimeFormat('uk-UA', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(latestOrder.createdAt))}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getOrderStatusBadgeClass(
                        latestOrder.status,
                      )}`}
                    >
                      {getOrderStatusLabel(latestOrder.status)}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-950/30">
                      <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                        Позицій
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
                        {latestOrder.itemCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-950/30">
                      <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                        Сума
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
                        {formatPrice(latestOrder.totalAmount)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-950/30">
                      <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                        Статус
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
                        {getOrderStatusLabel(latestOrder.status)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLatestOrder}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Відкрити деталі
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-base text-gray-600 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-gray-50">
                    У вас ще немає замовлень
                  </p>
                  <p className="mt-1">
                    Перше реальне замовлення з кошика з&apos;явиться тут після оформлення.
                  </p>
                </div>
              )}
            </Card>
          </section>

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
