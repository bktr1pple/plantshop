'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getSecurityErrorMessage,
  resendVerificationEmail,
  verifyEmail,
} from '@/lib/auth-security';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';
  const initialEmail = searchParams.get('email')?.trim() || '';
  const initialWaitSeconds = Number(searchParams.get('waitSeconds') || 0);
  const hasAutoVerified = useRef(false);

  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    token ? 'loading' : 'idle',
  );
  const [message, setMessage] = useState(
    token
      ? 'Перевіряємо токен підтвердження...'
      : initialEmail
        ? 'Ми вже підготували для вас лист підтвердження. Відкрийте його або запросіть нову відправку.'
        : 'Введіть email, щоб повторно надіслати лист підтвердження.',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(
    Number.isFinite(initialWaitSeconds) ? initialWaitSeconds : 0,
  );

  useEffect(() => {
    if (!token || hasAutoVerified.current) {
      return;
    }

    hasAutoVerified.current = true;

    void (async () => {
      const result = await verifyEmail(token);

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        return;
      }

      setStatus('error');
      setMessage(
        getSecurityErrorMessage(
          result.errorCode,
          result.message || 'Не вдалося підтвердити email.',
        ),
      );
    })();
  }, [token]);

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Введіть email, щоб повторно надіслати лист підтвердження.');
      return;
    }

    setIsSubmitting(true);
    const result = await resendVerificationEmail(email.trim());
    setIsSubmitting(false);
    setWaitSeconds(result.waitSeconds ?? 0);

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      return;
    }

    setStatus('error');
    setMessage(
      getSecurityErrorMessage(
        result.errorCode,
        result.message || 'Не вдалося повторно надіслати лист.',
      ),
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 px-4 py-24 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          PlantShop
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-50">
          Підтвердження email
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

        {waitSeconds > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            Новий лист можна запитати приблизно через {waitSeconds} с.
          </div>
        )}

        {!token && (
          <form onSubmit={handleResend} className="mt-6 space-y-4">
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
              {isSubmitting ? 'Надсилаємо...' : 'Надіслати лист повторно'}
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/?auth=login"
            className="inline-flex rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-100 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
          >
            Перейти до входу
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-transparent px-5 py-3 text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            На головну
          </Link>
        </div>
      </div>
    </main>
  );
}
