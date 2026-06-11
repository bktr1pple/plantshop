import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchServerPublicSiteSettings } from '@/lib/server-api';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Умови використання',
  description:
    'Умови використання сайту PlantShop: правила оформлення замовлень, оплати й доставки рослин, обліковий запис користувача та відповідальність сторін.',
  alternates: {
    canonical: '/terms',
  },
};

export default async function TermsPage() {
  const settings = await fetchServerPublicSiteSettings({ revalidate: 3600 });

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white pt-24 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <article className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Умови використання
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Ці умови регулюють користування сайтом {settings.siteName} та
            оформлення замовлень через нього. Користуючись сайтом, ви
            погоджуєтеся з наведеними нижче правилами.
          </p>
        </header>

        <div className="space-y-8 text-base leading-7 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              1. Загальні положення
            </h2>
            <p>
              Сайт {settings.siteName} — це інтернет-магазин рослин і послуг з
              озеленення. Інформація про рослини, ціни та наявність
              публікується в каталозі й може оновлюватися без попереднього
              повідомлення.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              2. Обліковий запис
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                для оформлення замовлення потрібен обліковий запис із
                підтвердженою адресою електронної пошти;
              </li>
              <li>
                ви відповідаєте за збереження доступу до власного облікового
                запису та достовірність вказаних даних;
              </li>
              <li>
                ми можемо обмежити доступ до облікового запису в разі
                порушення цих умов або підозри на несанкціонований доступ.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              3. Замовлення та оплата
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                замовлення вважається прийнятим після його підтвердження
                нашою командою;
              </li>
              <li>
                ціни на сайті вказані в гривнях; порядок оплати та доставки
                узгоджується під час підтвердження замовлення;
              </li>
              <li>
                якщо позиція виявиться недоступною, ми звʼяжемося з вами для
                заміни або скасування відповідної частини замовлення.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              4. Доставка та якість рослин
            </h2>
            <p>
              Рослини — живий товар: відтінок листя, форма та розмір можуть
              незначно відрізнятися від фотографій у каталозі. Ми перевіряємо
              стан кожної рослини перед відправленням. Умови й строки доставки
              узгоджуються під час підтвердження замовлення.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              5. Послуги з озеленення
            </h2>
            <p>
              Послуги ландшафтного дизайну та озеленення не є автоматичною
              покупкою: обсяг, вартість і строки робіт узгоджуються
              індивідуально після{' '}
              <Link
                href="/contact"
                className="font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400"
              >
                звернення
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              6. Інтелектуальна власність
            </h2>
            <p>
              Вміст сайту (тексти, фотографії, елементи дизайну) належить
              {` ${settings.siteName} `}або використовується на законних
              підставах. Копіювання матеріалів без дозволу заборонене.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              7. Контакти
            </h2>
            <p>
              З питань щодо цих умов звертайтеся на{' '}
              <a
                href={`mailto:${settings.contactEmail}`}
                className="font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400"
              >
                {settings.contactEmail}
              </a>{' '}
              або через{' '}
              <Link
                href="/contact"
                className="font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400"
              >
                контактну сторінку
              </Link>
              . Дивіться також{' '}
              <Link
                href="/privacy-policy"
                className="font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400"
              >
                політику конфіденційності
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
