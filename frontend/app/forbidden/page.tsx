import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/40 px-4 py-24 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-gray-200/70 bg-white/90 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900/90">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            Доступ обмежено
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            У вас немає прав для перегляду цього розділу
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Ця сторінка доступна лише користувачам з адміністративною роллю. Якщо
            доступ потрібен для роботи з каталогом або замовленнями, зверніться
            до адміністратора системи.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            До кабінету
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
