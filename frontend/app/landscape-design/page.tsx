import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Leaf, Map, MessageCircle, Sprout } from "lucide-react";
import { buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Ландшафтний дизайн і озеленення просторів",
  description:
    "Послуги озеленення від PlantShop: консультація, план озеленення, добір рослин з каталогу та супровід після висадки — для квартир, офісів і ділянок.",
  alternates: {
    canonical: "/landscape-design",
  },
  openGraph: buildOpenGraph({
    url: "/landscape-design",
    title: "Ландшафтний дизайн і озеленення просторів | PlantShop",
    description:
      "Консультація, план озеленення, добір рослин і супровід після висадки — для квартир, офісів і ділянок.",
    images: ["/images/plants-bg.jpg"],
  }),
};

const services = [
  {
    icon: ClipboardList,
    title: "Консультація",
    description:
      "Обговорення умов ділянки або приміщення, побажань замовника та базового набору рослин.",
  },
  {
    icon: Map,
    title: "План озеленення",
    description:
      "Підготовка логіки розміщення рослин з урахуванням освітлення, догляду та маршруту руху.",
  },
  {
    icon: Sprout,
    title: "Добір рослин",
    description:
      "Підбір рослин із каталогу PlantShop відповідно до простору, бюджету та умов догляду.",
  },
  {
    icon: Leaf,
    title: "Супровід після висадки",
    description:
      "Рекомендації щодо поливу, адаптації рослин і підтримання зеленого простору після запуску.",
  },
];

const steps = [
  "Заявка через контактну форму або телефон.",
  "Уточнення простору, освітлення, площі та бажаного стилю.",
  "Підбір рослин і формування пропозиції.",
  "Узгодження рішення та подальший супровід.",
];

export default function LandscapeDesignPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-white pt-24 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="inline-flex w-fit rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            Послуги PlantShop
          </p>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Ландшафтний дизайн і озеленення просторів
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            PlantShop допомагає підібрати рослини для квартири, офісу, тераси або ділянки. Сторінка описує послуги без вигаданого портфоліо, рейтингів чи статистики: усі деталі узгоджуються індивідуально після звернення.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              Залишити заявку
            </Link>
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Переглянути каталог
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-100 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <Image
            src="/images/plants-bg.jpg"
            alt="Зелені рослини в інтер’єрі"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 text-sm text-slate-700 shadow-sm backdrop-blur dark:bg-slate-950/85 dark:text-slate-200">
            Рішення з озеленення базуються на реальних рослинах із каталогу та погоджуються після консультації.
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <service.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{service.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {service.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Процес роботи
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Як формується запит на озеленення
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Послуга не є автоматичною покупкою. Для кожного простору потрібно уточнити умови, тому основною дією є звернення до PlantShop через контакти.
          </p>
        </div>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <span className="pt-1 text-sm text-slate-700 dark:text-slate-200">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-emerald-600 p-6 text-white shadow-sm sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-50">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Готові обговорити простір</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold">Опишіть задачу, а ми підкажемо наступний крок</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">
                У зверненні можна вказати тип простору, приблизну площу, умови освітлення та бажаний результат.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Перейти до контактів
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
