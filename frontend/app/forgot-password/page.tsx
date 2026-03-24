'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/auth-security';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(
    'Введіть email, і ми надішлемо інструкції для скидання пароля, якщо такий акаунт існує.',
  );
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Введіть email, щоб продовжити.');
      return;
    }

    setIsSubmitting(true);
    const result = await forgotPassword(email.trim());
    setIsSubmitting(false);
    setStatus(result.success ? 'success' : 'error');
    setMessage(result.message);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 px-4 py-24 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          PlantShop
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-50">
          Забули пароль?
        </h1>
        <p
          className={
            'mt-3 text-base ' +
            (status === 'error'
              ? 'text-red-600 dark:text-red-400'
              : status === 'success'
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-gray-600 dark:text-gray-400')
          }
        >
          {message}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:focus:ring-emerald-900/40"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Надсилаємо...' : 'Надіслати інструкції'}
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/?auth=login"
            className="inline-flex rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-100 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
          >
            Назад до входу
          </Link>
        </div>
      </div>
    </main>
  );
}
