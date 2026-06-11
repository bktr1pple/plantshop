import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchServerPublicSiteSettings } from '@/lib/server-api';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Політика конфіденційності',
  description:
    'Політика конфіденційності PlantShop: які персональні дані ми збираємо, як використовуємо й захищаємо їх та які права має користувач сайту.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default async function PrivacyPolicyPage() {
  const settings = await fetchServerPublicSiteSettings({ revalidate: 3600 });

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white pt-24 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <article className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Політика конфіденційності
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Ця політика пояснює, які персональні дані збирає сайт{' '}
            {settings.siteName}, з якою метою вони використовуються та які
            права має користувач.
          </p>
        </header>

        <div className="space-y-8 text-base leading-7 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              1. Які дані ми збираємо
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Обліковий запис:</strong> імʼя та адреса електронної
                пошти, які ви вказуєте під час реєстрації. Обліковий запис
                створюється лише після підтвердження email.
              </li>
              <li>
                <strong>Замовлення:</strong> контактний телефон, адреса
                доставки та склад замовлення, які ви вказуєте під час
                оформлення.
              </li>
              <li>
                <strong>Звернення через контактну форму:</strong> імʼя, email,
                телефон (необовʼязково) і текст повідомлення.
              </li>
              <li>
                <strong>Технічні дані:</strong> службові cookie для роботи
                сесії входу та збереження вибраної теми оформлення.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              2. Як ми використовуємо дані
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>обробка та доставка ваших замовлень;</li>
              <li>робота особистого кабінету й історії замовлень;</li>
              <li>відповіді на звернення через контактну форму;</li>
              <li>
                службові листи безпеки: підтвердження email, відновлення
                пароля, підтвердження входу з нового пристрою.
              </li>
            </ul>
            <p className="mt-3">
              Ми не передаємо персональні дані третім особам для маркетингу і
              не надсилаємо рекламних розсилок без вашої згоди.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              3. Cookie та сесії
            </h2>
            <p>
              Для входу в обліковий запис сайт використовує службові httpOnly
              cookie, які потрібні виключно для безпечної роботи сесії. Вони
              не використовуються для рекламного відстеження. Контактна форма
              захищена сервісом Google reCAPTCHA, який має власні умови
              обробки даних.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              4. Зберігання та захист
            </h2>
            <p>
              Дані зберігаються в захищеній базі даних. Паролі зберігаються
              лише у вигляді криптографічних хешів. Доступ до адміністративних
              функцій мають тільки авторизовані адміністратори.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              5. Ваші права
            </h2>
            <p>
              Ви можете звернутися до нас, щоб отримати, виправити або
              видалити свої персональні дані. Для цього напишіть на{' '}
              <a
                href={`mailto:${settings.contactEmail}`}
                className="font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400"
              >
                {settings.contactEmail}
              </a>{' '}
              або скористайтеся{' '}
              <Link
                href="/contact"
                className="font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400"
              >
                контактною формою
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              6. Зміни до політики
            </h2>
            <p>
              Ми можемо періодично оновлювати цю політику. Актуальна версія
              завжди доступна на цій сторінці.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
