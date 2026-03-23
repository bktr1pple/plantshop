'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import { ArrowLeft, Package, ShoppingBag, Info } from 'lucide-react';

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

export default function OrdersPage() {
  const router = useRouter();

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
                Розділ замовлень ще не підключено до backend, тому тут немає
                фейкової історії покупок, статусів або трекінгу.
              </p>
            </div>

            <Card className="flex items-center gap-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md sm:px-5 sm:py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                  Статус розділу
                </p>
                <p className="text-xl font-semibold">Недоступно</p>
              </div>
            </Card>
          </motion.header>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Історія замовлень ще не доступна
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Тут не показуються мок-замовлення, вигадані статуси або
                    псевдотрекінг. Коли для акаунта з&apos;явиться реальний backend
                    contract, цей розділ можна буде підключити без зміни
                    auth/session архітектури.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
                Наразі доступні лише реальні розділи кабінету:
                авторизований профіль, налаштування та вихід.
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 ring-1 ring-sky-100 dark:bg-sky-900/20 dark:text-sky-200 dark:ring-sky-800/50">
                  <Info className="h-3.5 w-3.5" />
                  Без фейкових дій
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Що буде тут після підключення
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Реальна історія покупок</li>
                  <li>Статуси доставки та трекінг</li>
                  <li>Деталі складу замовлення</li>
                </ul>
              </div>

              <Link
                href="/plants"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                <ShoppingBag className="h-4 w-4" />
                Перейти до каталогу
              </Link>
            </Card>
          </section>
        </main>
      </div>
    </LazyMotion>
  );
}
