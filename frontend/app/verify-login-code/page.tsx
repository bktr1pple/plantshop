'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getSecurityErrorMessage,
  verifyLoginChallenge,
} from '@/lib/auth-security';

export default function VerifyLoginCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = Number(searchParams.get('challengeId') || 0);
  const email = searchParams.get('email')?.trim() || '';
  const waitSeconds = Number(searchParams.get('waitSeconds') || 0);

  const [code, setCode] = useState('');
  const [message, setMessage] = useState(
    waitSeconds > 0
      ? `Ми вже надсилали код раніше. Якщо лист не прийшов, зачекайте приблизно ${waitSeconds} с перед повторною спробою входу.`
      : 'Введіть 6-значний код із листа, щоб завершити вхід.',
  );
  const [status, setStatus] = useState<'idle' | 'error' | 'loading'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!challengeId || code.trim().length !== 6) {
      setStatus('error');
      setMessage(
        'Потрібен валідний challengeId і 6-значний код із листа підтвердження.',
      );
      return;
    }

    setStatus('loading');
    const result = await verifyLoginChallenge({
      challengeId,
      code: code.trim(),
    });

    if (result.success) {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    setStatus('error');
    setMessage(
      getSecurityErrorMessage(
        result.errorCode,
        result.message || 'Не вдалося підтвердити вхід.',
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
          Підтвердження входу
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
          {email
            ? `Ми надіслали код підтвердження на ${email}.`
            : 'Ми надіслали код підтвердження на ваш email.'}
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Код підтвердження
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-lg tracking-[0.3em] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:focus:ring-emerald-900/40"
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? 'Перевіряємо...' : 'Підтвердити вхід'}
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/?auth=login"
            className="inline-flex rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-100 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
          >
            Повернутися до входу
          </Link>
        </div>
      </div>
    </main>
  );
}
