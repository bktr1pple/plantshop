"use client";

import {
  LazyMotion,
  m,
  AnimatePresence,
  domAnimation,
  cubicBezier,
  useMotionValue,
  useSpring,
  MotionValue,
  Variants,
} from "framer-motion";
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  Sparkles,
  Sprout,
  Trees,
  ArrowRight,
  Play,
  Star,
  Shield,
  Truck,
  Clock,
  Users,
  Award,
  Home,
  Building2,
  Gift,
} from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// Types
interface HeroImage {
  desktop: string;
  mobile: string;
  alt: string;
}

interface StatItem {
  value: number;
  label: string;
  suffix: string;
  icon: ReactNode;
}

interface DirectionItem {
  title: string;
  description: string;
  tag: string;
  icon: ReactNode;
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

// Optimized motion components
const MotionDiv = m.div;

// Animation constants
const ANIMATION = {
  ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 0.8,
  },
} as const;

// Variants
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
      staggerChildren: 0.12,
    },
  },
};

// Data
const directions: DirectionItem[] = [
  {
    title: "Для дому",
    description:
      "Створюємо затишні зелені куточки, які підкреслюють стиль інтерʼєру й покращують самопочуття.",
    tag: "Квартири • будинки • тераси",
    icon: <Home className="w-6 h-6" />,
  },
  {
    title: "Для офісу",
    description:
      "Озеленення робочих просторів, reception-зон та переговорних для сучасного бізнесу.",
    tag: "Офіси • коворкінги • HoReCa",
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    title: "Для подарунків",
    description:
      "Преміальні рослини та композиції, які хочеться дарувати й отримувати.",
    tag: "Подарункові сети • композиції",
    icon: <Gift className="w-6 h-6" />,
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
      "Підтримка 24/7 онлайн",
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
      "Після проєктний супровід",
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

export default function HomePage() {
  // Hero images
  const heroImages: HeroImage[] = useMemo(
    () => [
      {
        desktop: "/images/block.jpg",
        mobile: "/images/block.jpg",
        alt: "Premium plants collection",
      },
      {
        desktop: "/images/placeholder.jpg",
        mobile: "/images/placeholder.jpg",
        alt: "Professional plant design",
      },
      {
        desktop: "/images/placeholder2.jpg",
        mobile: "/images/placeholder2.jpg",
        alt: "Modern green spaces",
      },
      {
        desktop: "/images/block.jpg",
        mobile: "/images/block.jpg",
        alt: "Luxury plant arrangements",
      },
    ],
    []
  );

  // State
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Mouse move
  useEffect(() => {
    if (isMobile) return;

    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth - 0.5) * 20;
          const y = (e.clientY / window.innerHeight - 0.5) * 20;

          mouseX.set(x);
          mouseY.set(y);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  // Auto-rotate carousel
  useEffect(() => {
    if (isMobile) return;

    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrent((prev) => (prev + 1) % heroImages.length);
        setTimeout(() => setIsAnimating(false), 600);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnimating, heroImages.length, isMobile]);

  // Stats counter
  const [stats, setStats] = useState({
    plants: 0,
    customers: 0,
    years: 0,
    projects: 0,
  });

  const targetStats = useMemo(
    () => ({
      plants: 2500,
      customers: 12000,
      years: 8,
      projects: 3500,
    }),
    []
  );

  useEffect(() => {
    const duration = 2000;
    const steps = 30;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setStats({
        plants: Math.floor(targetStats.plants * easeOut),
        customers: Math.floor(targetStats.customers * easeOut),
        years: Math.floor(targetStats.years * easeOut),
        projects: Math.floor(targetStats.projects * easeOut),
      });

      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetStats]);

  const statsData: StatItem[] = useMemo(
    () => [
      {
        value: stats.plants,
        label: "Видів рослин",
        suffix: "+",
        icon: <Sprout className="w-4 h-4 sm:w-4 sm:h-4" />,
      },
      {
        value: stats.customers,
        label: "Задоволених клієнтів",
        suffix: "+",
        icon: <Users className="w-4 h-4 sm:w-4 sm:h-4" />,
      },
      {
        value: stats.years,
        label: "Років досвіду",
        suffix: "",
        icon: <Award className="w-4 h-4 sm:w-4 sm:h-4" />,
      },
      {
        value: stats.projects,
        label: "Реалізованих проєктів",
        suffix: "+",
        icon: <Trees className="w-4 h-4 sm:w-4 sm:h-4" />,
      },
    ],
    [stats]
  );

  const handleDotClick = useCallback(
    (index: number) => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrent(index);
        setTimeout(() => setIsAnimating(false), 600);
      }
    },
    [isAnimating]
  );

  return (
    <LazyMotion features={domAnimation} strict>
      {/* 🎨 ЄДИНИЙ ГЛОБАЛЬНИЙ ФОН З КРАСИВИМИ ГРАДІЄНТАМИ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20">
        {/* Статичні світлові плями (абсолютне позиціонування тільки в межах контенту) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Верхня ліва пляма */}
          <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-emerald-400/30 via-green-300/20 to-transparent rounded-full blur-3xl" />

          {/* Центральна пляма */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-tr from-green-400/25 via-emerald-300/15 to-transparent rounded-full blur-3xl" />

          {/* Права нижня пляма */}
          <div className="absolute top-2/3 -right-1/4 w-[900px] h-[900px] bg-gradient-to-tl from-emerald-500/35 via-green-400/20 to-transparent rounded-full blur-3xl" />

          {/* Додаткова акцентна пляма */}
          <div className="absolute top-2/3 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-green-300/20 to-transparent rounded-full blur-3xl" />

          {/* Маленькі світлові акценти тільки для desktop */}
          {!isMobile && (
            <>
              <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-emerald-400/15 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-green-300/12 rounded-full blur-3xl" />
            </>
          )}
        </div>

        {/* Контент */}
        <div className="relative">
          <main>
            <HeroSection
              current={current}
              isMobile={isMobile}
              heroImages={heroImages}
              mouseX={springMouseX}
              mouseY={springMouseY}
              statsData={statsData}
              onDotClick={handleDotClick}
            />

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

interface HeroSectionProps {
  current: number;
  isMobile: boolean;
  heroImages: HeroImage[];
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  statsData: StatItem[];
  onDotClick: (index: number) => void;
}

const HeroSection = ({
  current,
  isMobile,
  heroImages,
  mouseX,
  mouseY,
  statsData,
  onDotClick,
}: HeroSectionProps) => {
  const { settings } = useSiteSettings();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero background з картинкою */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              x: mouseX,
              y: mouseY,
              scale: 1.02,
            }}
          >
            <Image
              src={
                isMobile
                  ? heroImages[current].mobile
                  : heroImages[current].desktop
              }
              alt={heroImages[current].alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 100vw"
              className="object-cover"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMkX0RbNPoLbqoWrC90iW6nP/2Q=="
            />
          </MotionDiv>
        </AnimatePresence>

        {/* Градієнти поверх зображення */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-8 lg:py-12">
          {/* Heading */}
          <div className="text-center space-y-4 lg:space-y-6 mb-6 lg:mb-8">
            <MotionDiv
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: ANIMATION.ease }}
              className="space-y-3 lg:space-y-4"
            >
              <h1 className="pt-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-black leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-emerald-200 via-green-300 to-emerald-400 bg-clip-text text-transparent block">
                  {settings.heroTitleLine1}
                </span>
                <span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl block mt-1 lg:mt-2">
                  {settings.heroTitleLine2}
                </span>
                <span className="bg-gradient-to-r from-green-200 via-emerald-300 to-green-400 bg-clip-text text-transparent block mt-1 lg:mt-2">
                  {settings.heroTitleLine3}
                </span>
              </h1>
            </MotionDiv>

            <m.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-lg sm:text-xl md:text-2xl text-green-50/90 max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-light px-2 sm:px-4"
            >
              {settings.heroSubtitle}
            </m.p>
          </div>

          {/* CTA Buttons */}
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 lg:mb-10"
          >
            <Link
              href={settings.heroPrimaryCtaHref}
              className="group relative inline-flex items-center justify-center gap-2 bg-white text-green-800 font-bold py-3 sm:py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden min-w-[160px] sm:min-w-[180px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <Leaf className="w-4 h-4" />
              <span className="text-sm sm:text-base whitespace-nowrap">
                {settings.heroPrimaryCtaLabel}
              </span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <button className="group inline-flex items-center justify-center gap-2 bg-transparent border border-white/40 text-white font-semibold py-3 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl backdrop-blur-md hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:-translate-y-1 min-w-[140px] sm:min-w-[150px]">
              <Play className="w-3 h-3" />
              <span className="text-sm sm:text-base whitespace-nowrap">
                Відео тур
              </span>
            </button>
          </MotionDiv>

          {/* Stats */}
          <MotionDiv
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            className="w-full max-w-2xl lg:max-w-4xl mx-auto mb-4"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-0">
              {statsData.map((stat, index) => (
                <m.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="group text-center p-3 sm:p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center p-2 bg-emerald-500/20 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-emerald-300">{stat.icon}</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {stat.value}
                    {stat.suffix}
                  </div>
                  <div className="text-green-200/90 text-xs font-medium leading-tight">
                    {stat.label}
                  </div>
                </m.div>
              ))}
            </div>
          </MotionDiv>

          <div className="h-6 sm:h-8 lg:h-12" />
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            className={`relative h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              current === i
                ? "w-6 sm:w-8 bg-emerald-400"
                : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/70"
            }`}
          >
            {current === i && (
              <MotionDiv
                layoutId="activeDot"
                className="absolute inset-0 bg-emerald-400 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {!isMobile && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 flex items-center gap-2 text-white/60 text-sm font-medium"
        >
          <MotionDiv
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-3 h-4 border border-white/30 rounded-full flex justify-center"
          >
            <div className="w-px h-1.5 bg-white/50 rounded-full mt-1" />
          </MotionDiv>
          Прокрутіть
        </MotionDiv>
      )}
    </section>
  );
};

// ================= Section Header Component =================

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = "center",
}) => {
  const alignment =
    align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <m.div variants={fadeInUp} className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-300">
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
};

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
              className="group relative flex flex-col gap-5 rounded-3xl border border-gray-100/50 bg-white/60 backdrop-blur-sm p-7 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/40"
            >
              {/* Світловий ефект при ховері */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/0 to-green-400/0 opacity-0 transition-opacity duration-300 group-hover:from-emerald-400/5 group-hover:to-green-400/5 group-hover:opacity-100" />

              <div className="relative flex items-center gap-4">
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

              <p className="relative text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {item.description}
              </p>

              <div className="relative mt-auto flex items-center gap-2 text-sm font-medium text-emerald-700 transition-colors group-hover:text-emerald-600 dark:text-emerald-400 dark:group-hover:text-emerald-300">
                <span>Дізнатись більше</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
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
              className="group relative flex flex-col gap-5 rounded-3xl border border-gray-100/50 bg-white/60 backdrop-blur-sm p-7 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/40"
            >
              {/* Світловий ефект */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/0 to-green-400/0 opacity-0 transition-opacity duration-300 group-hover:from-emerald-400/5 group-hover:to-green-400/5 group-hover:opacity-100" />

              <div className="relative flex items-start gap-4">
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

              <ul className="relative space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
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
              className="relative flex flex-col gap-4 rounded-3xl border border-gray-100/50 bg-white/60 backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/40"
            >
              {/* З'єднувальна лінія між кроками */}
              {index < steps.length - 1 && (
                <div className="absolute left-full top-14 hidden h-0.5 w-6 bg-gradient-to-r from-emerald-400 to-transparent lg:block" />
              )}

              {/* Світловий ефект */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/0 to-green-400/0 opacity-0 transition-opacity duration-300 hover:from-emerald-400/5 hover:to-green-400/5 hover:opacity-100" />

              <div className="relative flex items-center justify-between">
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

              <div className="relative">
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
          className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-200/60 bg-emerald-50/40 backdrop-blur-sm p-6 text-center shadow-lg dark:border-emerald-800/60 dark:bg-emerald-950/20 sm:flex-row sm:text-left"
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
  <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
    {/* Темний оверлей для контрасту з текстом */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/80 dark:via-black/70 dark:to-black/90" />

    {/* Додаткові світлові акценти без анімації */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/15 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col items-center gap-10"
      >
        <m.div variants={fadeInUp} className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-500/10 backdrop-blur-sm px-5 py-2 text-xs font-bold uppercase tracking-widest text-emerald-200">
            <Star className="w-4 h-4" />
            Професійне озеленення без зайвих турбот
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white">
            Готові до{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent">
              живого
            </span>{" "}
            простору,
            <br />в який хочеться повертатися?
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-200 leading-relaxed">
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
            href="/landscape-design"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-300/40 bg-white/5 backdrop-blur-md px-7 py-4 text-base font-semibold text-emerald-50 transition-all duration-300 hover:border-emerald-300/60 hover:bg-white/10"
          >
            <span>Переглянути проєкти</span>
          </Link>
        </m.div>

        <m.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>30 днів гарантії</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Безкоштовна доставка</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>8+ років досвіду</span>
          </div>
        </m.div>
      </m.div>
    </div>
  </section>
);
