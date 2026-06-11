"use client";

import { LazyMotion, m, domAnimation, Variants } from "framer-motion";
import React, { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  Sparkles,
  Sprout,
  Trees,
  ArrowRight,
  Star,
  Shield,
  Truck,
  Clock,
  Users,
  Award,
  Home,
  Building2,
  Gift,
  HeartHandshake,
} from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// Types
interface HeroImage {
  src: string;
  alt: string;
}

interface HeroFeature {
  label: string;
  icon: ReactNode;
}

interface DirectionItem {
  title: string;
  description: string;
  tag: string;
  icon: ReactNode;
  href: string;
}

interface BenefitItem {
  title: string;
  description: string;
  points: string[];
  icon: ReactNode;
}

interface StepItem {
  step: number;
  title: string;
  description: string;
  icon: ReactNode;
}

const MotionDiv = m.div;

// Variants — лише transform/opacity (анімуються на композиторі)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Data
const heroImages: HeroImage[] = [
  {
    src: "/images/block.jpg",
    alt: "Колекція преміум рослин PlantShop",
  },
  {
    src: "/images/placeholder.jpg",
    alt: "Професійне оформлення простору рослинами",
  },
  {
    src: "/images/placeholder2.jpg",
    alt: "Сучасні зелені простори в інтер'єрі",
  },
];

const heroFeatures: HeroFeature[] = [
  { label: "Доставка по Україні", icon: <Truck className="h-4 w-4" /> },
  { label: "Гарантія якості", icon: <Shield className="h-4 w-4" /> },
  { label: "Підбір під ваш простір", icon: <Sprout className="h-4 w-4" /> },
  { label: "Супровід після покупки", icon: <HeartHandshake className="h-4 w-4" /> },
];

const directions: DirectionItem[] = [
  {
    title: "Для дому",
    description:
      "Створюємо затишні зелені куточки, які підкреслюють стиль інтерʼєру й покращують самопочуття.",
    tag: "Квартири • будинки • тераси",
    icon: <Home className="w-6 h-6" />,
    href: "/landscape-design",
  },
  {
    title: "Для офісу",
    description:
      "Озеленення робочих просторів, reception-зон та переговорних для сучасного бізнесу.",
    tag: "Офіси • коворкінги • HoReCa",
    icon: <Building2 className="w-6 h-6" />,
    href: "/landscape-design",
  },
  {
    title: "Для подарунків",
    description:
      "Преміальні рослини та композиції, які хочеться дарувати й отримувати.",
    tag: "Подарункові сети • композиції",
    icon: <Gift className="w-6 h-6" />,
    href: "/plants",
  },
];

const benefits: BenefitItem[] = [
  {
    title: "Преміальні рослини",
    description:
      "Ми працюємо лише з перевіреними розплідниками та відбираємо рослини вручну.",
    points: [
      "Сертифіковані постачальники",
      "Відбір перед відправкою",
      "Гарантія якості",
    ],
    icon: <Award className="w-6 h-6" />,
  },
  {
    title: "Комплексний підхід",
    description:
      "Від першої консультації до догляду — усе в одній команді без зайвої метушні.",
    points: [
      "Аналіз простору",
      "Дизайн-концепція",
      "Реалізація та супровід",
    ],
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    title: "Догляд без стресу",
    description:
      "Навчаємо догляду або беремо його на себе: регулярні візити, діагностика та лікування.",
    points: [
      "Індивідуальні плани догляду",
      "Професійна команда",
      "Підтримка онлайн",
    ],
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: "Прозорі умови",
    description:
      "Чіткі етапи, строки та вартість — без прихованих платежів та «плюс ще ось це».",
    points: [
      "Фіксований кошторис",
      "Реалістичні строки",
      "Післяпроєктний супровід",
    ],
    icon: <Users className="w-6 h-6" />,
  },
];

const steps: StepItem[] = [
  {
    step: 1,
    title: "Знайомство та запит",
    description:
      "Ви заповнюєте коротку форму або зв'язуєтесь з нами. Ми уточнюємо ваші побажання та бюджет.",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    step: 2,
    title: "Підбір рішень",
    description:
      "Готуємо пропозицію: рослини, композиції, варіанти розташування та орієнтовний кошторис.",
    icon: <Sprout className="w-5 h-5" />,
  },
  {
    step: 3,
    title: "Реалізація проєкту",
    description:
      "Доставляємо, розміщуємо та, за потреби, монтуємо системи поливу. Ви одразу бачите результат.",
    icon: <Trees className="w-5 h-5" />,
  },
  {
    step: 4,
    title: "Догляд та супровід",
    description:
      "Навчаємо базовому догляду або беремо його повністю на себе — з регулярними візитами.",
    icon: <Clock className="w-5 h-5" />,
  },
];

export default function HomeContent({
  featuredPlants,
}: {
  featuredPlants?: ReactNode;
}) {
  return (
    <LazyMotion features={domAnimation} strict>
      {/*
        Фонові плями — статичні radial-gradient без filter: blur.
        Великі blur-шари растеризуються GPU на кожен кадр і були однією
        з головних причин гальмування на слабких пристроях.
      */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_65%)]" />
          <div className="absolute top-1/3 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_65%)]" />
          <div className="absolute top-2/3 -right-1/4 h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_65%)]" />
        </div>

        <div className="relative">
          <main>
            <HeroSection />
            {featuredPlants}
            <DirectionsSection />
            <BenefitsSection />
            <ProcessSection />
            <FinalCTASection />
          </main>
        </div>
      </div>
    </LazyMotion>
  );
}

// ================= Hero Section =================

const HeroSection = () => {
  const { settings } = useSiteSettings();
  const [current, setCurrent] = useState(0);

  // Карусель: усі зображення в стеку, перемикання — лише CSS opacity
  // (композиторна анімація). Інтервал ставиться на паузу в фоновій вкладці.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % heroImages.length);
      }, 6000);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Hero background: стек зображень із CSS crossfade */}
      <div className="absolute inset-0 overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={image.src}
            className="absolute inset-0 transition-opacity duration-1000 ease-out"
            style={{ opacity: index === current ? 1 : 0 }}
          >
            <Image
              src={image.src}
              alt={index === current ? image.alt : ""}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              quality={85}
            />
          </div>
        ))}

        {/* Градієнти поверх зображення */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen flex-col items-center justify-center py-8 lg:py-12">
          <div className="mb-8 space-y-4 text-center lg:mb-10 lg:space-y-6">
            <MotionDiv
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
            >
              <h1 className="pt-10 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block bg-gradient-to-r from-emerald-200 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                  {settings.heroTitleLine1}
                </span>
                <span className="mt-1 block text-3xl text-white sm:text-4xl md:text-5xl lg:mt-2 lg:text-6xl">
                  {settings.heroTitleLine2}
                </span>
                <span className="mt-1 block bg-gradient-to-r from-green-200 via-emerald-300 to-green-400 bg-clip-text text-transparent lg:mt-2">
                  {settings.heroTitleLine3}
                </span>
              </h1>
            </MotionDiv>

            <m.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="mx-auto max-w-3xl px-2 text-lg font-light leading-relaxed text-green-50/90 sm:px-4 sm:text-xl md:text-2xl lg:max-w-4xl"
            >
              {settings.heroSubtitle}
            </m.p>
          </div>

          {/* CTA Buttons */}
          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href={settings.heroPrimaryCtaHref}
              className="group relative inline-flex min-w-[180px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-7 py-3.5 font-bold text-green-800 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:rounded-2xl"
            >
              <Leaf className="h-4 w-4" />
              <span className="whitespace-nowrap text-sm sm:text-base">
                {settings.heroPrimaryCtaLabel}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/landscape-design"
              className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl border border-white/40 bg-transparent px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/60 hover:bg-white/10 sm:rounded-2xl"
            >
              <span className="whitespace-nowrap text-sm sm:text-base">
                Наші послуги
              </span>
            </Link>
          </MotionDiv>

          {/* Чесні цінності замість вигаданих лічильників */}
          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
            className="mx-auto w-full max-w-3xl"
          >
            <ul className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {heroFeatures.map((feature) => (
                <li
                  key={feature.label}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-green-50 sm:text-sm"
                >
                  <span className="text-emerald-300">{feature.icon}</span>
                  {feature.label}
                </li>
              ))}
            </ul>
          </MotionDiv>

          <div className="h-6 sm:h-8 lg:h-12" />
        </div>
      </div>

      {/* Перемикачі слайдів */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6 sm:gap-3">
        {heroImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Слайд ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
              current === index
                ? "w-6 bg-emerald-400 sm:w-8"
                : "w-1.5 bg-white/50 hover:bg-white/70 sm:w-2"
            }`}
          />
        ))}
      </div>

      {/* Прокрутка вниз — дешева CSS-анімація */}
      <div className="absolute bottom-6 right-6 hidden flex-col items-center gap-1.5 text-white/60 md:flex lg:right-8">
        <span className="text-xs font-medium tracking-wide">Прокрутіть</span>
        <span className="block h-5 w-3 rounded-full border border-white/30">
          <span className="mx-auto mt-1 block h-1.5 w-px animate-bounce rounded-full bg-white/60" />
        </span>
      </div>
    </section>
  );
};

// ================= Section Header Component =================

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
}) => (
  <m.div variants={fadeInUp} className="flex flex-col items-center gap-3 text-center">
    {eyebrow && (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <Sparkles className="w-3.5 h-3.5" />
        {eyebrow}
      </span>
    )}
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
      {title}
    </h2>
    {description && (
      <p className="max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    )}
  </m.div>
);

// ================= Directions Section =================

const DirectionsSection: React.FC = () => (
  <section className="relative py-20 sm:py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col gap-12 lg:gap-16"
      >
        <SectionHeader
          eyebrow="Напрямки роботи"
          title="Де найкраще розкриваються декоративні рослини"
          description="Ми працюємо як з приватними просторами, так і з бізнесом — адаптуючи підхід під ваш стиль, освітлення та режим життя."
        />

        <m.div
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {directions.map((item) => (
            <m.article
              key={item.title}
              variants={fadeInUp}
              className="group relative flex flex-col gap-5 rounded-3xl border border-gray-100/50 bg-white/80 p-7 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/60"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {item.tag}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {item.description}
              </p>

              <Link
                href={item.href}
                className="mt-auto flex items-center gap-2 text-sm font-medium text-emerald-700 transition-colors group-hover:text-emerald-600 dark:text-emerald-400 dark:group-hover:text-emerald-300"
              >
                <span>Дізнатись більше</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </m.article>
          ))}
        </m.div>
      </m.div>
    </div>
  </section>
);

// ================= Benefits Section =================

const BenefitsSection: React.FC = () => (
  <section className="relative py-20 sm:py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col gap-12 lg:gap-16"
      >
        <SectionHeader
          eyebrow="Наш підхід"
          title="Чому клієнти повертаються до нас знову"
          description="Ми будуємо довготривалі стосунки — з людьми та їхніми рослинами. У кожному проєкті поєднуємо естетику, практичність та реалістичні умови догляду."
        />

        <m.div
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-2"
        >
          {benefits.map((item) => (
            <m.article
              key={item.title}
              variants={fadeInUp}
              className="group relative flex flex-col gap-5 rounded-3xl border border-gray-100/50 bg-white/80 p-7 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/60"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
                {item.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </m.article>
          ))}
        </m.div>
      </m.div>
    </div>
  </section>
);

// ================= Process Section =================

const ProcessSection: React.FC = () => (
  <section className="relative py-20 sm:py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col gap-12 lg:gap-16"
      >
        <SectionHeader
          eyebrow="Як це відбувається"
          title="Простий та прозорий процес співпраці"
          description="Ми цінуємо ваш час. Тому зробили процес таким, щоб з перших кроків було зрозуміло, що буде далі."
        />

        <m.ol
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <m.li
              key={step.step}
              variants={fadeInUp}
              className="relative flex flex-col gap-4 rounded-3xl border border-gray-100/50 bg-white/80 p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/60"
            >
              {index < steps.length - 1 && (
                <div className="absolute left-full top-14 hidden h-0.5 w-6 bg-gradient-to-r from-emerald-400 to-transparent lg:block" />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
                    {step.step}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Крок
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100/60 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {step.icon}
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            </m.li>
          ))}
        </m.ol>

        <m.div
          variants={fadeInUp}
          className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-200/60 bg-emerald-50/60 p-6 text-center shadow-lg dark:border-emerald-800/60 dark:bg-emerald-950/20 sm:flex-row sm:text-left"
        >
          <p className="flex-1 text-sm text-emerald-900 dark:text-emerald-100">
            Щоб розпочати, достатньо надіслати кілька фото простору та коротко
            описати ваші очікування. Решту — ми візьмемо на себе.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Sparkles className="w-4 h-4" />
            Заповнити форму консультації
          </Link>
        </m.div>
      </m.div>
    </div>
  </section>
);

// ================= Final CTA Section =================

const FinalCTASection: React.FC = () => (
  <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
    {/* Темний оверлей для контрасту з текстом */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/80 dark:via-black/70 dark:to-black/90" />

    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2),transparent_65%)]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_65%)]" />
    </div>

    <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col items-center gap-10"
      >
        <m.div variants={fadeInUp} className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-500/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-emerald-200">
            <Star className="w-4 h-4" />
            Професійне озеленення без зайвих турбот
          </span>
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Готові до{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent">
              живого
            </span>{" "}
            простору,
            <br />в який хочеться повертатися?
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
            Обговорімо ваш простір, стиль і бюджет — запропонуємо кілька
            варіантів рішень та допоможемо обрати ідеальний формат.
          </p>
        </m.div>

        <m.div
          variants={fadeInUp}
          className="flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-bold text-emerald-900 shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/40"
          >
            <Sparkles className="w-5 h-5" />
            <span>Запланувати консультацію</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/plants"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-300/40 bg-white/5 px-7 py-4 text-base font-semibold text-emerald-50 transition-all duration-300 hover:border-emerald-300/60 hover:bg-white/10"
          >
            <span>Перейти до каталогу</span>
          </Link>
        </m.div>

        <m.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Гарантія якості</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Доставка по Україні</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Супровід після покупки</span>
          </div>
        </m.div>
      </m.div>
    </div>
  </section>
);
