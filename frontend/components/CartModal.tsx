// components/CartModal.tsx
'use client';

import { m, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth, type User as AuthUser } from '@/contexts/AuthContext';
import { useNotification } from '@/app/components/NotificationSystem';
import { OrdersApiError, createCurrentUserOrder } from '@/lib/orders';
import Image, { type ImageLoader } from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/format-price';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CheckoutFormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  note: string;
}

const remoteImageLoader: ImageLoader = ({ src }) => src;

function isRemoteImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function createCheckoutState(user: AuthUser | null): CheckoutFormState {
  return {
    customerName: user?.name ?? '',
    customerEmail: user?.email ?? '',
    customerPhone: user?.phone ?? '',
    deliveryAddress: user?.address ?? '',
    note: '',
  };
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
    clearCart,
  } = useCart();
  const { user, isLoading, ensureAuthAndGo } = useAuth();
  const { addNotification } = useNotification();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [checkout, setCheckout] = useState<CheckoutFormState>(() =>
    createCheckoutState(user),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheckout(createCheckoutState(user));
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const updateField = (field: keyof CheckoutFormState, value: string) => {
    setCheckout((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const trimmedPhone = checkout.customerPhone.trim();
  const phoneIsValid = /^[+0-9\s\-()]{7,20}$/.test(trimmedPhone);
  const formIsValid =
    checkout.customerName.trim() &&
    trimmedPhone &&
    phoneIsValid &&
    checkout.deliveryAddress.trim();

  const handleCheckout = async () => {
    if (!user) {
      addNotification({
        type: 'info',
        title: 'Потрібен акаунт',
        message:
          'Щоб оформити реальне замовлення, спершу увійдіть у свій акаунт.',
      });
      onClose();
      await ensureAuthAndGo('/dashboard/orders');
      return;
    }

    if (!formIsValid) {
      addNotification({
        type: 'error',
        title: 'Заповніть форму замовлення',
        message:
          trimmedPhone && !phoneIsValid
            ? 'Вкажіть коректний номер телефону (7–20 символів: цифри, +, дужки, дефіси).'
            : 'Для створення замовлення потрібні ім’я, телефон і адреса доставки.',
      });
      return;
    }

    const orderItems = cartItems.map((item) => ({
      plantId: Number(item.id),
      quantity: item.quantity,
    }));

    if (
      orderItems.some(
        (item) =>
          !Number.isInteger(item.plantId) ||
          item.plantId <= 0 ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 1000,
      )
    ) {
      addNotification({
        type: 'error',
        title: 'Некоректний товар у кошику',
        message:
          'Не вдалося визначити один із товарів для створення замовлення. Оновіть кошик і спробуйте ще раз.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createCurrentUserOrder({
        customerName: checkout.customerName.trim(),
        customerPhone: checkout.customerPhone.trim(),
        deliveryAddress: checkout.deliveryAddress.trim(),
        note: checkout.note.trim() || undefined,
        items: orderItems,
      });

      clearCart();
      addNotification({
        type: 'success',
        title: 'Замовлення створено',
        message: `Замовлення #${order.id} успішно збережено.`,
      });
      onClose();
      router.push(`/dashboard/orders/${order.id}`);
    } catch (error) {
      if (
        error instanceof OrdersApiError &&
        error.code === 'unauthorized'
      ) {
        addNotification({
          type: 'error',
          title: 'Сесію не підтверджено',
          message:
            'Потрібно повторно підтвердити вхід перед оформленням замовлення.',
        });
        onClose();
        await ensureAuthAndGo('/dashboard/orders');
        return;
      }

      addNotification({
        type: 'error',
        title: 'Не вдалося створити замовлення',
        message:
          error instanceof Error
            ? error.message
            : 'Спробуйте ще раз пізніше.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <m.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <m.div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Кошик ({totalItems})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid max-h-[calc(85vh-73px)] md:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-y-auto border-b border-gray-200 dark:border-gray-700 md:border-b-0 md:border-r">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Кошик порожній</p>
                  <p className="text-sm">Додайте товари до кошика</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {(() => {
                          const isRemoteSrc = isRemoteImageUrl(item.image);

                          return (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              loader={isRemoteSrc ? remoteImageLoader : undefined}
                              unoptimized={isRemoteSrc}
                              className="object-cover rounded-lg"
                            />
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isSubmitting}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isSubmitting}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            disabled={isSubmitting}
                            className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                      Оформлення
                    </p>
                    <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-100">
                      {user
                        ? 'Замовлення буде збережено у вашому акаунті після підтвердження.'
                        : 'Щоб оформити замовлення, увійдіть у свій акаунт.'}
                    </p>
                  </div>
                  {user ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  ) : (
                    <Lock className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Всього:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="grid gap-3">
                  <input
                    value={checkout.customerName}
                    onChange={(event) => updateField('customerName', event.target.value)}
                    disabled={isSubmitting || isLoading || !user}
                    placeholder="Ім’я отримувача"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50"
                  />
                  <input
                    value={checkout.customerEmail}
                    disabled
                    placeholder="Email акаунта"
                    type="email"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50"
                  />
                  <input
                    value={checkout.customerPhone}
                    onChange={(event) => updateField('customerPhone', event.target.value)}
                    disabled={isSubmitting || isLoading || !user}
                    placeholder="Телефон"
                    type="tel"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50"
                  />
                  <textarea
                    value={checkout.deliveryAddress}
                    onChange={(event) =>
                      updateField('deliveryAddress', event.target.value)
                    }
                    disabled={isSubmitting || isLoading || !user}
                    placeholder="Адреса доставки"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50"
                  />
                  <textarea
                    value={checkout.note}
                    onChange={(event) => updateField('note', event.target.value)}
                    disabled={isSubmitting || isLoading || !user}
                    placeholder="Коментар до замовлення (необов’язково)"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-50"
                  />
                </div>
              </div>

              <button
                onClick={() => void handleCheckout()}
                disabled={
                  cartItems.length === 0 ||
                  isSubmitting ||
                  isLoading ||
                  (Boolean(user) && !formIsValid)
                }
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Створення замовлення...'
                  : user
                    ? 'Підтвердити замовлення'
                    : 'Увійти для оформлення'}
              </button>
            </div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}
