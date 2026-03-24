import Link from 'next/link';
import { ArrowLeft, Home, SearchX, Sprout } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white px-4 py-12 dark:from-slate-950 dark:to-slate-900 md:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950">
          <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <aside className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-14 text-white md:px-10">
              <div className="text-center">
                <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/14 ring-1 ring-white/20">
                  <SearchX className="h-9 w-9" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-50/85">
                  Помилка 404
                </p>
                <p className="mt-4 text-6xl font-semibold leading-none md:text-7xl">
                  404
                </p>
                <p className="mt-4 max-w-xs text-sm leading-6 text-emerald-50/90 md:text-base">
                  Цієї сторінки немає або посилання вже застаріло.
                </p>
              </div>
            </aside>

            <div className="px-6 py-8 md:px-10 md:py-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Sprout className="h-4 w-4" />
                Plant Shop
              </div>

              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-white">
                Сторінку не знайдено
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg dark:text-slate-300">
                Перевірте адресу в рядку браузера або скористайтеся швидкими
                переходами нижче. Найчастіше користувачі повертаються на
                головну або відкривають каталог рослин.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <Home className="h-4 w-4" />
                  На головну
                </Link>
                <Link
                  href="/plants"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                  До каталогу
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl px-1 py-3 text-sm font-medium text-slate-500 transition hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Зв&apos;язатися з нами
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <Link
                  href="/plants"
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50/60 dark:border-slate-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Популярний розділ
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Перейти до всіх рослин
                  </p>
                </Link>
                <Link
                  href="/care"
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50/60 dark:border-slate-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Потрібна допомога
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Подивитися поради з догляду
                  </p>
                </Link>
                <Link
                  href="/contact"
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50/60 dark:border-slate-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Не знайшли потрібне
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Напишіть нам через контакти
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
