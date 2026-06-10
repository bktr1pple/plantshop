'use client';

import { useEffect, useMemo, useState } from 'react';
import { Package, RefreshCw, Truck } from 'lucide-react';
import { useNotification } from '@/app/components/NotificationSystem';
import { SafeImage } from '@/components/SafeImage';
import {
  type OrderDetail,
  type OrderStatus,
  type OrderSummary,
  getAdminOrder,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  listAdminOrders,
  updateAdminOrderStatus,
} from '@/lib/orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/format-price';

const orderStatuses: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function OrdersAdminManager() {
  const { addNotification } = useNotification();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadOrderDetail = async (orderId: number) => {
    try {
      setIsLoadingDetail(true);
      const order = await getAdminOrder(orderId);
      setSelectedOrder(order);
      setSelectedOrderId(order.id);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Не вдалося завантажити деталі замовлення',
        message:
          error instanceof Error
            ? error.message
            : 'Спробуйте ще раз пізніше.',
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const nextOrders = await listAdminOrders();
      setOrders(nextOrders);

      if (nextOrders.length === 0) {
        setSelectedOrder(null);
        setSelectedOrderId(null);
        return;
      }

      const nextSelectedId = selectedOrderId ?? nextOrders[0]?.id ?? null;
      if (nextSelectedId) {
        await loadOrderDetail(nextSelectedId);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Не вдалося завантажити замовлення',
        message:
          error instanceof Error
            ? error.message
            : 'Спробуйте ще раз пізніше.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'PENDING').length,
    [orders],
  );

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrderId) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const updatedOrder = await updateAdminOrderStatus(selectedOrderId, status);
      setSelectedOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id
            ? {
                ...order,
                status: updatedOrder.status,
                updatedAt: updatedOrder.updatedAt,
              }
            : order,
        ),
      );
      addNotification({
        type: 'success',
        title: 'Статус замовлення оновлено',
        message: `Замовлення #${updatedOrder.id} переведено в статус "${getOrderStatusLabel(updatedOrder.status)}".`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Не вдалося оновити статус',
        message:
          error instanceof Error
            ? error.message
            : 'Спробуйте ще раз пізніше.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Усього замовлень</CardDescription>
            <CardTitle className="text-3xl">{orders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Нові замовлення</CardDescription>
            <CardTitle className="text-3xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardDescription>Керування</CardDescription>
              <CardTitle className="text-lg">Оновити список</CardTitle>
            </div>
            <Button variant="outline" onClick={() => void loadOrders()}>
              <RefreshCw className="h-4 w-4" />
              Оновити
            </Button>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Замовлення</CardTitle>
            <CardDescription>
              Реальний backend-backed список усіх замовлень у системі.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Завантаження замовлень...
              </div>
            ) : orders.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-950/50">
                <Package className="mb-4 h-10 w-10 text-emerald-500" />
                <h3 className="text-lg font-semibold">Замовлень поки що немає</h3>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Коли користувачі почнуть оформлювати покупки, вони з’являться тут.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => void loadOrderDetail(order.id)}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selectedOrderId === order.id
                        ? 'border-emerald-500 bg-emerald-50/80 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">Замовлення #{order.id}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {order.customerName} • {order.customerEmail}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getOrderStatusBadgeClass(order.status)}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>{order.itemCount} товар(ів)</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Деталі замовлення</CardTitle>
            <CardDescription>
              Контакти, доставка, склад замовлення та керування статусом.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingDetail ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Завантаження деталей замовлення...
              </div>
            ) : selectedOrder ? (
              <>
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Замовлення #{selectedOrder.id}
                    </p>
                    <p className="text-sm text-slate-500">
                      Створено: {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Оновлено: {formatDate(selectedOrder.updatedAt)}
                    </p>
                    <p className="pt-2 font-medium text-slate-900 dark:text-white">
                      {selectedOrder.customerName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedOrder.customerEmail}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedOrder.customerPhone}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedOrder.deliveryAddress}
                    </p>
                    {selectedOrder.note && (
                      <p className="text-sm text-slate-500">
                        Коментар: {selectedOrder.note}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <Truck className="h-3.5 w-3.5" />
                      Керування статусом
                    </div>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) =>
                        void handleStatusChange(value as OrderStatus)
                      }
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getOrderStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        <SafeImage
                          src={item.plantImage ?? '/images/placeholder.jpg'}
                          alt={item.plantName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {item.plantName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right font-semibold text-slate-900 dark:text-white">
                        {formatPrice(item.lineTotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Підсумок замовлення
                  </span>
                  <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-sm text-slate-500">
                Оберіть замовлення у списку, щоб побачити деталі.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
