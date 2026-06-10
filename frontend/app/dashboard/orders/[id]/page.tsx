'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

function parseOrderId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default function DashboardOrderDetailRedirectPage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const orderId = parseOrderId(params?.id);

  useEffect(() => {
    if (!orderId) {
      router.replace('/dashboard/orders');
      return;
    }

    router.replace(`/dashboard/orders?orderId=${orderId}`);
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 px-4 pt-28 text-center text-sm text-gray-500 dark:from-gray-950 dark:to-gray-900 dark:text-gray-400">
      Відкриваємо деталі замовлення...
    </div>
  );
}
