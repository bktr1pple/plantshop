import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { API_URL } from '@/lib/site-settings';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderSummary {
  id: number;
  userId: number;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  note: string | null;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  plantId: number | null;
  plantName: string;
  plantImage: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  note?: string;
  items: Array<{
    plantId: number;
    quantity: number;
  }>;
}

type ApiErrorCode =
  | 'unauthorized'
  | 'unavailable'
  | 'forbidden'
  | 'not-found'
  | 'validation'
  | 'unknown';

export class OrdersApiError extends Error {
  code: ApiErrorCode;

  constructor(message: string, code: ApiErrorCode) {
    super(message);
    this.name = 'OrdersApiError';
    this.code = code;
  }
}

type ApiMessageBody = {
  message?: string | string[];
};

async function parseErrorResponse(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await res.json()) as ApiMessageBody;

    if (typeof data.message === 'string') {
      return data.message;
    }

    if (Array.isArray(data.message)) {
      return data.message.filter(Boolean).join(', ') || fallback;
    }
  } catch {
    // ignore
  }

  return fallback;
}

function statusFromResponse(res: Response): ApiErrorCode {
  if (res.status === 401) return 'unauthorized';
  if (res.status === 403) return 'forbidden';
  if (res.status === 404) return 'not-found';
  if (res.status === 400 || res.status === 422) return 'validation';
  if (res.status >= 500) return 'unavailable';
  return 'unknown';
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Нове';
    case 'PROCESSING':
      return 'В обробці';
    case 'SHIPPED':
      return 'Відправлено';
    case 'DELIVERED':
      return 'Доставлено';
    case 'CANCELLED':
      return 'Скасовано';
    default:
      return status;
  }
}

export function getOrderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900/60';
    case 'PROCESSING':
      return 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/30 dark:text-sky-200 dark:ring-sky-900/60';
    case 'SHIPPED':
      return 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/30 dark:text-violet-200 dark:ring-violet-900/60';
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:ring-emerald-900/60';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:ring-rose-900/60';
    default:
      return 'bg-gray-50 text-gray-700 ring-gray-200 dark:bg-gray-900/50 dark:text-gray-200 dark:ring-gray-800';
  }
}

export async function createCurrentUserOrder(
  payload: CreateOrderPayload,
): Promise<OrderDetail> {
  const { res, unauthorized } = await fetchWithRefresh('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (unauthorized) {
    throw new OrdersApiError(
      'Для оформлення замовлення потрібно увійти в акаунт.',
      'unauthorized',
    );
  }

  if (!res) {
    throw new OrdersApiError(
      'Сервер замовлень тимчасово недоступний. Спробуйте ще раз.',
      'unavailable',
    );
  }

  if (!res.ok) {
    throw new OrdersApiError(
      await parseErrorResponse(res, 'Не вдалося створити замовлення.'),
      statusFromResponse(res),
    );
  }

  return (await res.json()) as OrderDetail;
}

export async function listCurrentUserOrders(): Promise<OrderSummary[]> {
  const { res, unauthorized } = await fetchWithRefresh('/orders/me');

  if (unauthorized) {
    throw new OrdersApiError(
      'Сесію не підтверджено. Увійдіть повторно.',
      'unauthorized',
    );
  }

  if (!res) {
    throw new OrdersApiError(
      'Не вдалося завантажити замовлення через тимчасову помилку.',
      'unavailable',
    );
  }

  if (!res.ok) {
    throw new OrdersApiError(
      await parseErrorResponse(res, 'Не вдалося завантажити замовлення.'),
      statusFromResponse(res),
    );
  }

  return (await res.json()) as OrderSummary[];
}

export async function getCurrentUserOrder(id: number): Promise<OrderDetail> {
  const { res, unauthorized, temporaryFailure } = await fetchWithRefresh(
    `/orders/me/${id}`,
  );

  if (unauthorized) {
    throw new OrdersApiError(
      'Сесію не підтверджено. Увійдіть повторно.',
      'unauthorized',
    );
  }

  if (!res) {
    throw new OrdersApiError(
      'Не вдалося завантажити деталі замовлення.',
      'unavailable',
    );
  }

  if (!res.ok && temporaryFailure) {
    throw new OrdersApiError(
      await parseErrorResponse(res, 'Не вдалося завантажити замовлення.'),
      statusFromResponse(res),
    );
  }

  if (!res.ok) {
    throw new OrdersApiError(
      await parseErrorResponse(res, 'Не вдалося завантажити замовлення.'),
      statusFromResponse(res),
    );
  }

  return (await res.json()) as OrderDetail;
}

export async function listAdminOrders(): Promise<OrderSummary[]> {
  const res = await fetch(`${API_URL}/orders/admin`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new OrdersApiError(
      await parseErrorResponse(res, 'Не вдалося завантажити замовлення.'),
      statusFromResponse(res),
    );
  }

  return (await res.json()) as OrderSummary[];
}

export async function getAdminOrder(id: number): Promise<OrderDetail> {
  const res = await fetch(`${API_URL}/orders/admin/${id}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new OrdersApiError(
      await parseErrorResponse(
        res,
        'Не вдалося завантажити деталі замовлення.',
      ),
      statusFromResponse(res),
    );
  }

  return (await res.json()) as OrderDetail;
}

export async function updateAdminOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<OrderDetail> {
  const res = await fetch(`${API_URL}/orders/admin/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new OrdersApiError(
      await parseErrorResponse(
        res,
        'Не вдалося оновити статус замовлення.',
      ),
      statusFromResponse(res),
    );
  }

  return (await res.json()) as OrderDetail;
}
