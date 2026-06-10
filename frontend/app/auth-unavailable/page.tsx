import Link from 'next/link';

type SearchParamsValue = string | string[] | undefined;

function normalizeNextPath(value: SearchParamsValue): string {
  const nextPath = Array.isArray(value) ? value[0] : value;

  if (!nextPath || !nextPath.startsWith('/')) {
    return '/';
  }

  if (nextPath.startsWith('//')) {
    return '/';
  }

  return nextPath;
}

export default async function AuthUnavailablePage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: SearchParamsValue }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const retryPath = normalizeNextPath(resolvedSearchParams?.next);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 px-4 py-24 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-gray-200/70 bg-white/90 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900/90">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            Авторизація тимчасово недоступна
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Не вдалося перевірити сесію
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Захищений розділ зараз недоступний, бо сервер тимчасово не зміг
            підтвердити вашу сесію. Це не означає, що ви точно вийшли з
            акаунта.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          Спробуйте повторити запит через кілька секунд. Якщо проблема не
          зникає, поверніться на головну сторінку й повторіть вхід пізніше.
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={retryPath}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Спробувати ще раз
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
          >
            На головну
          </Link>
        </div>
      </div>
    </main>
  );
}
