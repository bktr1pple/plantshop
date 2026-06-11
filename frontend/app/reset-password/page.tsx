'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getSecurityErrorMessage,
  resetPassword,
} from '@/lib/auth-security';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState(
    token
      ? 'Введіть новий пароль для свого акаунта.'
      : 'Посилання для скидання пароля недійсне або неповне.',
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setStatus('error');
      setMessage(
        getSecurityErrorMessage(
          'TOKEN_INVALID',
          'Посилання для скидання пароля недійсне.',
        ),
      );
      return;
    }

    setStatus('loading');
    const result = await resetPassword({ token, newPassword, confirmPassword });

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      return;
    }

    setStatus('error');
    setMessage(
      getSecurityErrorMessage(
        result.errorCode,
        result.message || 'Не вдалося скинути пароль.',
      ),
    );
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
        PlantShop
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-50">
        Скидання пароля
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

      {status !== 'success' && (
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Новий пароль
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:focus:ring-emerald-900/40"
            placeholder="Новий пароль"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Підтвердження пароля
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:focus:ring-emerald-900/40"
            placeholder="Повторіть новий пароль"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'loading' ? 'Оновлюємо...' : 'Оновити пароль'}
        </button>
      </form>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/?auth=login"
          className="inline-flex rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-100 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
        >
          До входу
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 px-4 py-24 dark:from-gray-950 dark:to-gray-900">
      <Suspense
        fallback={
          <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <p className="text-gray-500">Завантаження...</p>
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
