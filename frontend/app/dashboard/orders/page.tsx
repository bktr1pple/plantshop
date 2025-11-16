'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  X,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';

/**
 * Типы
 */
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  variant?: string;
  image?: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  number: string;
  date: string; // ISO или YYYY-MM-DD
  status: OrderStatus;
  total: number;
  itemsCount: number;
  items: OrderItem[];
  deliveryMethod: string;
  paymentMethod: string;
  address: string;
  city: string;
  trackingNumber?: string;
}

/**
 * Мок-данные заказов
 */
const mockOrders: Order[] = [
  {
    id: '1',
    number: 'PS-2024-0001',
    date: '2024-11-02',
    status: 'processing',
    total: 1890,
    itemsCount: 3,
    deliveryMethod: 'Нова Пошта — відділення',
    paymentMethod: 'Карткою онлайн',
    address: 'Відділення №5, вул. Незалежності, 10',
    city: 'Луцьк',
    trackingNumber: '20400012345678',
    items: [
      {
        id: 'i1',
        name: 'Монстера деліціоза',
        variant: 'Діаметр горщика 21 см',
        qty: 1,
        price: 950,
      },
      {
        id: 'i2',
        name: 'Фікус ліровидний',
        variant: 'Висота 120 см',
        qty: 1,
        price: 690,
      },
      {
        id: 'i3',
        name: 'Керамічний горщик “Forest”',
        variant: 'Колір: білий, 18 см',
        qty: 1,
        price: 250,
      },
    ],
  },
  {
    id: '2',
    number: 'PS-2024-0002',
    date: '2024-10-19',
    status: 'shipped',
    total: 720,
    itemsCount: 2,
    deliveryMethod: 'Курʼєрська доставка',
    paymentMethod: 'Післяплата',
    address: 'вул. Шевченка, 25, кв. 17',
    city: 'Львів',
    trackingNumber: '59000098765432',
    items: [
      {
        id: 'i4',
        name: 'Сукулент мікс',
        variant: '3 шт у наборі',
        qty: 1,
        price: 420,
      },
      {
        id: 'i5',
        name: 'Добриво для сукулентів',
        qty: 1,
        price: 300,
      },
    ],
  },
  {
    id: '3',
    number: 'PS-2024-0003',
    date: '2024-09-03',
    status: 'delivered',
    total: 1450,
    itemsCount: 1,
    deliveryMethod: 'Нова Пошта — двері',
    paymentMethod: 'Карткою онлайн',
    address: 'вул. Київська, 44',
    city: 'Рівне',
    trackingNumber: '20400055566677',
    items: [
      {
        id: 'i6',
        name: 'Олива європейська в кадці',
        variant: 'Висота 90 см',
        qty: 1,
        price: 1450,
      },
    ],
  },
  {
    id: '4',
    number: 'PS-2024-0004',
    date: '2024-08-14',
    status: 'cancelled',
    total: 560,
    itemsCount: 1,
    deliveryMethod: 'Самовивіз з шоуруму',
    paymentMethod: 'Не оплачено',
    address: 'вул. Зелена, 12',
    city: 'Луцьк',
    items: [
      {
        id: 'i7',
        name: 'Папороть нефролепіс',
        variant: 'Підвісний кашпо',
        qty: 1,
        price: 560,
      },
    ],
  },
];

/**
 * Вспомогательные компоненты
 */
function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 ${className}`}
    >
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map = {
    processing: {
      label: 'Обробка',
      className:
        'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300',
      icon: Clock,
    },
    shipped: {
      label: 'В дорозі',
      className:
        'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/20 dark:text-sky-300',
      icon: Truck,
    },
    delivered: {
      label: 'Доставлено',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Скасовано',
      className:
        'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300',
      icon: XCircle,
    },
  } as const;

  const cfg = map[status];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatPrice(amount: number) {
  const formatted = amount.toLocaleString('uk-UA', {
    maximumFractionDigits: 0,
  });

  return `${formatted} грн`;
}

/**
 * Модалка деталей замовлення (центр экрана)
 */
interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!order) return;
    if (typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768;

    // ESC для закрытия
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Фокус на кнопку закрытия
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Сохраняем прежние значения
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    // Блокируем скролл и на body, и на html
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    let touchMoveHandler: ((e: TouchEvent) => void) | null = null;

    if (isMobile) {
      // На мобилках дополнительно рубим touchmove по фону
      touchMoveHandler = (e: TouchEvent) => {
        if (
          modalContentRef.current &&
          !modalContentRef.current.contains(e.target as Node)
        ) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchmove", touchMoveHandler, {
        passive: false,
      });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (touchMoveHandler) {
        document.removeEventListener("touchmove", touchMoveHandler);
      }

      // Восстанавливаем overflow без всяких scrollTo — так не будет "вспышки"
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [order, onClose]);

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={modalContentRef}
            className="relative w-full max-w-xl px-4"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="max-h-[80vh] overflow-y-auto rounded-3xl border-gray-200/80 bg-white/95 p-0 shadow-2xl dark:border-gray-800/80 dark:bg-gray-950/95">
              {/* Кнопка закрытия */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Закрити"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Заголовок */}
              <div className="px-4 pb-2 pt-4 pr-12 sm:px-6 sm:pb-3 sm:pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  <Package className="h-3.5 w-3.5" />
                  Деталі замовлення
                </div>
                <h2 className="mt-1 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
                  № {order.number}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Оформлено: {formatDate(order.date)}
                </p>
              </div>

              {/* Контент */}
              <div className="space-y-4 px-4 pb-4 text-sm sm:space-y-5 sm:px-6 sm:pb-5">
                {/* Статус + ТТН */}
                <Card className="border-gray-100 bg-gray-50/80 px-3 py-3 dark:border-gray-800 dark:bg-gray-900/80">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Статус доставки
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    {order.trackingNumber && (
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          ТТН
                        </p>
                        <p className="font-mono text-xs text-gray-800 dark:text-gray-100">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Товари */}
                <Card className="px-3 py-3 sm:px-4 sm:py-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Товари в замовленні
                  </h3>
                  <ul className="space-y-3">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-sm dark:bg-gray-900/70"
                      >
                        <div className="flex flex-1 flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          {item.variant && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.variant}
                            </span>
                          )}
                          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Кількість: {item.qty}
                          </span>
                        </div>
                        <div className="text-right text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.qty)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Доставка / Оплата */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="px-3 py-3 sm:px-4 sm:py-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                      Доставка
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Метод
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {order.deliveryMethod}
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Адреса
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {order.address}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.city}
                    </p>
                  </Card>

                  <Card className="px-3 py-3 sm:px-4 sm:py-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                      Оплата
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Спосіб оплати
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {order.paymentMethod}
                    </p>
                    <div className="mt-3 border-t border-dashed border-gray-200 pt-2 text-sm dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Сума замовлення
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Нижняя панель действий */}
              <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                  >
                    <Truck className="h-4 w-4" />
                    Відстежити відправлення
                  </button>
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <Download className="h-4 w-4" />
                    Експорт PDF
                  </button>
                </div>

                <div className="flex justify-between gap-2 pt-1 sm:justify-end sm:pt-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    Закрити
                  </button>
                  <button
                    type="button"
                    className="text-xs text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    Повторити замовлення (скоро)
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Основна сторінка замовлень
 */
export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [periodFilter, setPeriodFilter] = useState<'30d' | '3m' | '6m' | 'all'>(
    '3m',
  );
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<
    'date_desc' | 'date_asc' | 'total_desc' | 'total_asc'
  >('date_desc');
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let minDate: Date | null = null;

    if (periodFilter === '30d') {
      minDate = new Date(now);
      minDate.setDate(now.getDate() - 30);
    } else if (periodFilter === '3m') {
      minDate = new Date(now);
      minDate.setMonth(now.getMonth() - 3);
    } else if (periodFilter === '6m') {
      minDate = new Date(now);
      minDate.setMonth(now.getMonth() - 6);
    }

    return mockOrders
      .filter((o) => {
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;

        if (minDate) {
          const od = new Date(o.date);
          if (od < minDate) return false;
        }

        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const matchNumber = o.number.toLowerCase().includes(q);
          const matchCity = o.city.toLowerCase().includes(q);
          const matchItem = o.items.some((it) =>
            it.name.toLowerCase().includes(q),
          );
          if (!matchNumber && !matchCity && !matchItem) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sort === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sort === 'total_desc') {
          return b.total - a.total;
        }
        if (sort === 'total_asc') {
          return a.total - b.total;
        }
        return 0;
      });
  }, [statusFilter, periodFilter, search, sort]);

  const totalCount = mockOrders.length;
  const activeCount = mockOrders.filter((o) =>
    ['processing', 'shipped'].includes(o.status),
  ).length;
  const deliveredCount = mockOrders.filter((o) => o.status === 'delivered')
    .length;
  const cancelledCount = mockOrders.filter((o) => o.status === 'cancelled')
    .length;

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <button
                type="button"
                onClick={() => history.back()}
                className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                Мої замовлення
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base dark:text-gray-300">
                Стежте за статусом доставки, переглядайте деталі та історію покупок у
                вашому PlantShop акаунті.
              </p>
            </div>

            <Card className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md sm:px-5 sm:py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                  Загалом замовлень
                </p>
                <p className="text-xl font-semibold">{totalCount}</p>
              </div>
            </Card>
          </motion.header>

          {/* Статистика */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Активні
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {activeCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Замовлення в обробці або в дорозі.
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Доставлено
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {deliveredCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Успішно завершені замовлення.
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Скасовано
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {cancelledCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Замовлення, які не були завершені.
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Сума покупок
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatPrice(
                      mockOrders.reduce((acc, o) => acc + o.total, 0),
                    )}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
                  <span className="text-lg font-bold">₴</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Загальна сума всіх оформлених замовлень.
              </p>
            </Card>
          </section>

          {/* Фильтры */}
          <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:flex-row sm:items-center sm:justify-between">
            {/* Статусы */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all' as const, label: 'Усі' },
                { id: 'processing' as const, label: 'В обробці' },
                { id: 'shipped' as const, label: 'В дорозі' },
                { id: 'delivered' as const, label: 'Доставлені' },
                { id: 'cancelled' as const, label: 'Скасовані' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    statusFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Поиск + сортировка */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Пошук за номером або рослиною..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/40"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={periodFilter}
                    onChange={(e) =>
                      setPeriodFilter(e.target.value as typeof periodFilter)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm text-gray-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/40"
                  >
                    <option value="30d">Останні 30 днів</option>
                    <option value="3m">Останні 3 місяці</option>
                    <option value="6m">Останні 6 місяців</option>
                    <option value="all">Вся історія</option>
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-xs sm:text-sm text-gray-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/40"
                  >
                    <option value="date_desc">Спочатку нові</option>
                    <option value="date_asc">Спочатку старі</option>
                    <option value="total_desc">Сума: від більшої</option>
                    <option value="total_asc">Сума: від меншої</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </section>

          {/* Список заказів */}
          <section className="space-y-3">
            {/* Desktop table */}
            <div className="hidden rounded-2xl border border-gray-200 bg-white/80 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900/80 md:block">
              <div className="grid grid-cols-12 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <div className="col-span-3">Замовлення</div>
                <div className="col-span-2">Дата</div>
                <div className="col-span-2">Статус</div>
                <div className="col-span-2">Доставка</div>
                <div className="col-span-2 text-right">Сума</div>
                <div className="col-span-1 text-right" />
              </div>

              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                  <Package className="h-10 w-10 text-gray-300 dark:text-gray-700" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Замовлень за обраними фільтрами не знайдено
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Спробуйте змінити фільтри або період пошуку.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredOrders.map((order) => (
                    <li
                      key={order.id}
                      className="grid grid-cols-12 items-center px-4 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-900"
                    >
                      <div className="col-span-3 flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">
                          № {order.number}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Товарів: {order.itemsCount}
                        </span>
                      </div>

                      <div className="col-span-2 text-sm text-gray-700 dark:text-gray-200">
                        {formatDate(order.date)}
                      </div>

                      <div className="col-span-2">
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="col-span-2 text-xs text-gray-600 dark:text-gray-300">
                        <div className="truncate">{order.deliveryMethod}</div>
                        <div className="truncate text-gray-400 dark:text-gray-500">
                          {order.city}
                        </div>
                      </div>

                      <div className="col-span-2 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(order.total)}
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedOrder(order)}
                          className="inline-flex items-center justify-end gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          Деталі
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filteredOrders.length === 0 ? (
                <Card className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <Package className="h-10 w-10 text-gray-300 dark:text-gray-700" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Замовлень за обраними фільтрами не знайдено
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Спробуйте змінити фільтри або період пошуку.
                  </p>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          № {order.number}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(order.date)} • Товарів: {order.itemsCount}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      <p className="line-clamp-1">{order.deliveryMethod}</p>
                      <p className="line-clamp-1 text-gray-400 dark:text-gray-500">
                        {order.city}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(order.total)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedOrder(order)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                      >
                        Деталі
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Модалка деталей */}
          <OrderDetailsModal
            order={expandedOrder}
            onClose={() => setExpandedOrder(null)}
          />
        </main>
      </div>
    </LazyMotion>
  );
}
