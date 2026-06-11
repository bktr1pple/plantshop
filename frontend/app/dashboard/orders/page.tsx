'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  RefreshCw,
  Clock3,
} from 'lucide-react';
import {
  type OrderDetail,
  type OrderSummary,
  getCurrentUserOrder,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  listCurrentUserOrders,
} from '@/lib/orders';
import { formatPrice } from '@/lib/format-price';

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 ${className}`}
    >
      {children}
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function parseSelectedOrder(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryOrderId = parseSelectedOrder(searchParams.get('orderId'));

  const loadDetail = async (orderId: number): Promise<boolean> => {
    try {
      setIsLoadingDetail(true);
      setErrorMessage(null);
      setSelectedOrderId(orderId);
      setSelectedOrder(null);

      const detail = await getCurrentUserOrder(orderId);
      setSelectedOrder(detail);
      setErrorMessage(null);
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не вдалося завантажити деталі замовлення.',
      );
      setSelectedOrder(null);
      return false;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const nextOrders = await listCurrentUserOrders();
      setOrders(nextOrders);

      if (!nextOrders.length) {
        setSelectedOrder(null);
        setSelectedOrderId(null);
        return;
      }

      const nextSelectedId = queryOrderId ?? selectedOrderId ?? nextOrders[0].id;
      const loaded = await loadDetail(nextSelectedId);

      if (!loaded && nextSelectedId !== nextOrders[0].id) {
        await loadDetail(nextOrders[0].id);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не вдалося завантажити історію замовлень.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!queryOrderId || !orders.length) {
      return;
    }

    const nextOrderId = orders.some((order) => order.id === queryOrderId)
      ? queryOrderId
      : orders[0]?.id;

    if (!nextOrderId || nextOrderId === selectedOrderId) {
      return;
    }

    void (async () => {
      const loaded = await loadDetail(nextOrderId);

      if (!loaded && orders[0] && nextOrderId !== orders[0].id) {
        await loadDetail(orders[0].id);
      }
    })();
  }, [orders, queryOrderId, selectedOrderId]);

  const activeOrder = selectedOrder;

  const handleSelectOrder = async (orderId: number) => {
    router.push(`/dashboard/orders?orderId=${orderId}`);
    await loadDetail(orderId);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                Мої замовлення
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base dark:text-gray-300">
                Історія покупок вашого акаунта з деталями кожного замовлення.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Card className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md sm:px-5 sm:py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                    Усього замовлень
                  </p>
                  <p className="text-xl font-semibold">{orders.length}</p>
                </div>
              </Card>

              <button
                type="button"
                onClick={() => void loadOrders()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Оновити
              </button>
            </div>
          </motion.header>

          {errorMessage && (
            <Card className="border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
              <p className="text-sm">{errorMessage}</p>
            </Card>
          )}

          {isLoading ? (
            <Card className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Завантаження замовлень...
            </Card>
          ) : orders.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                У вас ще немає замовлень
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Коли ви оформите перше замовлення з кошика, воно зʼявиться тут.
              </p>
              <Link
                href="/plants"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
              >
                До каталогу
              </Link>
            </Card>
          ) : (
            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
              <Card className="p-0 overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Історія
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => void handleSelectOrder(order.id)}
                      className={`w-full px-5 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-900/60 ${
                        selectedOrderId === order.id
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Замовлення #{order.id}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getOrderStatusBadgeClass(order.status)}`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          {order.itemCount} позицій
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                {isLoadingDetail ? (
                  <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Завантаження деталей замовлення...
                  </div>
                ) : activeOrder ? (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Замовлення #{activeOrder.id}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4" />
                            {formatDate(activeOrder.createdAt)}
                          </span>
                          <span>{activeOrder.customerEmail}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${getOrderStatusBadgeClass(activeOrder.status)}`}
                      >
                        {getOrderStatusLabel(activeOrder.status)}
                      </span>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/60">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                          Отримувач
                        </p>
                        <p className="mt-3 font-medium text-gray-900 dark:text-white">
                          {activeOrder.customerName}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {activeOrder.customerPhone}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {activeOrder.deliveryAddress}
                        </p>
                        {activeOrder.note && (
                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Коментар:
                            </span>{' '}
                            {activeOrder.note}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/60">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                          Підсумок
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
                          {formatPrice(activeOrder.totalAmount)}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {activeOrder.itemCount} позицій у замовленні
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Позиції замовлення
                      </h3>
                      <div className="mt-3 space-y-3">
                        {activeOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white/80 p-4 dark:border-gray-800 dark:bg-gray-950/40"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.plantName}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {item.quantity} × {formatPrice(item.unitPrice)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                                {formatPrice(item.lineTotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Оберіть замовлення у списку, щоб побачити деталі.
                  </div>
                )}
              </Card>
            </section>
          )}
        </main>
      </div>
    </LazyMotion>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
          <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-200 bg-white/90 p-10 text-center text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-400">
              Завантаження замовлень...
            </div>
          </main>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
