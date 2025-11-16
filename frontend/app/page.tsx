"use client";

import {
  LazyMotion,
  m,
  AnimatePresence,
  domAnimation,
  cubicBezier,
  useMotionValue,
  useSpring,
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
import Particles from "./components/Particles";
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
const MotionH2 = m.h2;
const MotionP = m.p;

// Animation constants for consistency
const ANIMATION = {
  ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 0.8,
  },
} as const;

// Simple variants for new sections
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

// Data for new sections
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
      "Ви заповнюєте коротку форму або зв’язуєтесь з нами. Ми уточнюємо ваші побажання та бюджет.",
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
  // Hero images with proper typing
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

  // State management
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Optimized mouse position with motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  // Mobile detection with debounce
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

  // Optimized mouse move with throttling and motion values
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

  // Optimized auto-rotate carousel
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
      {/* Background */}
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/10 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-hidden">
        <main className="flex-grow">
          {/* 🔥 ТВОЙ HERO-БЛОК — БЕЗ ИЗМЕНЕНИЙ */}
          <HeroSection
            current={current}
            isAnimating={isAnimating}
            isMobile={isMobile}
            heroImages={heroImages}
            mouseX={springMouseX}
            mouseY={springMouseY}
            statsData={statsData}
            onDotClick={handleDotClick}
          />

          {/* ⬇️ НОВЫЙ НИЗ ГЛАВНОЙ */}
          <DirectionsSection />
          <BenefitsSection />
          <ProcessSection />
          <FinalCTASection />
        </main>
      </div>
    </LazyMotion>
  );
}

// ================= Hero Section =================

interface HeroSectionProps {
  current: number;
  isAnimating: boolean;
  isMobile: boolean;
  heroImages: HeroImage[];
  mouseX: any;
  mouseY: any;
  statsData: StatItem[];
  onDotClick: (index: number) => void;
}

const HeroSection = ({
  current,
  isAnimating, // оставляю в пропсах, если захочешь ещё что-то добавить
  isMobile,
  heroImages,
  mouseX,
  mouseY,
  statsData,
  onDotClick,
}: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black dark:bg-gray-900">
      {/* Dynamic background */}
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

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/85 dark:from-gray-900/90 via-green-900/40 dark:via-gray-800/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 dark:from-gray-900/30 to-transparent" />

        {/* Light spots */}
        {!isMobile && (
          <>
            <MotionDiv
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-500/5 blur-[80px] rounded-full"
            />
            <MotionDiv
              animate={{
                scale: [1.1, 1, 1.1],
                opacity: [0.15, 0.2, 0.15],
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-green-300/15 dark:bg-green-400/10 blur-[70px] rounded-full"
            />
          </>
        )}
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
                  Природа
                </span>
                <span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl block mt-1 lg:mt-2">
                  у сучасному
                </span>
                <span className="bg-gradient-to-r from-green-200 via-emerald-300 to-green-400 bg-clip-text text-transparent block mt-1 lg:mt-2">
                  дизайні
                </span>
              </h1>
            </MotionDiv>

            {/* Description */}
            <MotionP
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-lg sm:text-xl md:text-2xl text-green-50/90 dark:text-green-100/80 max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-light px-2 sm:px-4"
            >
              Ексклюзивні рослини, професійний догляд та авторські рішення
              <br className="hidden sm:block" />
              для створення ідеального простору
            </MotionP>
          </div>

          {/* CTA Buttons */}
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 lg:mb-10"
          >
            <PrimaryButton
              href="/plants"
              icon={<Leaf className="w-4 h-4" />}
              text="До каталогу"
            />
            <SecondaryButton icon={<Play className="w-3 h-3" />} text="Відео тур" />
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
                <StatCard key={index} stat={stat} index={index} />
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
                : "w-1.5 sm:w-2 bg-white/50 dark:bg-gray-400/50 hover:bg-white/70 dark:hover:bg-gray-300/70"
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

      {!isMobile && <ScrollIndicator />}
    </section>
  );
};

// Buttons
const PrimaryButton = ({
  href,
  icon,
  text,
}: {
  href: string;
  icon: ReactNode;
  text: string;
}) => (
  <Link
    href={href}
    className="group relative inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-green-800 dark:text-green-200 font-bold py-3 sm:py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden min-w-[160px] sm:min-w-[180px]"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -inset-full top-0 transform skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine transition-all duration-1000" />
    </div>
    {icon}
    <span className="text-sm sm:text-base whitespace-nowrap">{text}</span>
    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
  </Link>
);

const SecondaryButton = ({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) => (
  <button className="group relative inline-flex items-center justify-center gap-2 bg-transparent border border-white/40 dark:border-gray-400/40 text-white dark:text-gray-200 font-semibold py-3 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl backdrop-blur-md hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/60 dark:hover:border-gray-300/60 transition-all duration-300 hover:-translate-y-1 min-w-[140px] sm:min-w-[150px]">
    {icon}
    <span className="text-sm sm:text-base whitespace-nowrap">{text}</span>
  </button>
);

// Stat Card
const StatCard = ({
  stat,
  index,
}: {
  stat: StatItem;
  index: number;
}) => (
  <m.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
    className="group text-center p-3 sm:p-3 bg-white/5 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-600/30 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300 hover:-translate-y-1"
  >
    <div className="inline-flex items-center justify-center p-2 bg-emerald-500/20 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
      <div className="text-emerald-300">{stat.icon}</div>
    </div>
    <div className="text-xl sm:text-2xl font-bold text-white mb-1">
      {stat.value}
      {stat.suffix}
    </div>
    <div className="text-green-200/90 dark:text-green-300/90 text-xs font-medium leading-tight">
      {stat.label}
    </div>
  </m.div>
);

// Scroll Indicator
const ScrollIndicator = () => (
  <MotionDiv
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.2, duration: 0.8 }}
    className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 flex items-center gap-2 text-white/60 dark:text-gray-300/60 text-sm font-medium"
  >
    <MotionDiv
      animate={{ y: [0, 6, 0] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="w-3 h-4 border border-white/30 dark:border-gray-400/30 rounded-full flex justify-center"
    >
      <div className="w-px h-1.5 bg-white/50 dark:bg-gray-400/50 rounded-full mt-1" />
    </MotionDiv>
    Прокрутіть
  </MotionDiv>
);

// ================= New lower sections =================

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
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          <Sparkles className="w-3 h-3" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-sm sm:text-base text-gray-600 dark:text-gray-300">
          {description}
        </p>
      )}
    </m.div>
  );
};

const DirectionsSection: React.FC = () => (
  <section className="relative py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent dark:via-emerald-800/60" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col gap-10"
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
              className="group flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-emerald-900/60 dark:bg-gray-900/80"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {item.title}
                  </h3>
                  <span className="text-xs text-emerald-700/80 dark:text-emerald-200/90">
                    {item.tag}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-auto pt-3 text-xs text-emerald-700/80 dark:text-emerald-200/90">
                Індивідуальний підбір під ваш простір та освітлення.
              </div>
            </m.article>
          ))}
        </m.div>
      </m.div>
    </div>
  </section>
);

const BenefitsSection: React.FC = () => (
  <section className="relative py-14 sm:py-18 lg:py-20 bg-gradient-to-br from-emerald-50/70 via-white to-green-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/30">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-emerald-100/60 blur-3xl dark:bg-emerald-900/60" />
      <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-green-100/60 blur-3xl dark:bg-emerald-900/40" />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col gap-10"
      >
        <SectionHeader
          eyebrow="Наш підхід"
          title="Чому клієнти повертаються до нас знову"
          description="Ми будуємо довготривалі стосунки — з людьми та їхніми рослинами. У кожному проєкті поєднуємо естетику, практичність та реалістні умови догляду."
        />

        <m.div
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-2"
        >
          {benefits.map((item) => (
            <m.article
              key={item.title}
              variants={fadeInUp}
              className="group relative flex flex-col gap-4 rounded-2xl border border-emerald-100/80 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-emerald-900/60 dark:bg-gray-900/85"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/40">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <ul className="mt-1 space-y-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {item.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
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

const ProcessSection: React.FC = () => (
  <section className="relative py-14 sm:py-18 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col gap-10"
      >
        <SectionHeader
          eyebrow="Як це відбувається"
          title="Простий та прозорий процес співпраці"
          description="Ми цінуємо ваш час. Тому зробили процес таким, щоб з перших кроків було зрозуміло, що буде далі."
        />

        <m.ol
          variants={staggerContainer}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step) => (
            <m.li
              key={step.step}
              variants={fadeInUp}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white/80 p-4 text-sm shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/85"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white">
                    {step.step}
                  </span>
                  <span>крок</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  {step.icon}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </m.li>
          ))}
        </m.ol>

        <m.div
          variants={fadeInUp}
          className="flex flex-col gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-4 text-xs sm:text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100 md:flex-row md:items-center md:justify-between"
        >
          <p>
            Щоб розпочати, достатньо надіслати кілька фото простору та коротко
            описати ваші очікування. Решту — ми візьмемо на себе.
          </p>
          <Link
            href="/consultation"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400 bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-400"
          >
            <Sparkles className="w-3 h-3" />
            Заповнити форму консультації
          </Link>
        </m.div>
      </m.div>
    </div>
  </section>
);

const FinalCTASection: React.FC = () => (
  <section className="relative py-20 sm:py-24 px-4 sm:px-6 overflow-hidden">
    {/* Фон-картинка + ефекти */}
    <div className="absolute inset-0">
      <Image
        src="/images/plants-bg.jpg"
        alt="Декоративні рослини на фоні"
        fill
        priority={false}
        sizes="100vw"
        className="object-cover"
      />
      {/* Напівпрозорий градієнт, щоб текст був читабельний */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/75 to-gray-900/40 dark:from-gray-950/95 dark:via-gray-900/85 dark:to-gray-900/60" />
      <Particles />
    </div>

    <div className="relative max-w-6xl mx-auto text-center text-white">
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="flex flex-col items-center gap-8"
      >
        <m.div variants={fadeInUp} className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-emerald-100">
            <Star className="w-3 h-3" />
            Професійне озеленення без зайвих турбот
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
            Готові до{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              живого
            </span>{" "}
            простору, в який хочеться повертатися?
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-gray-200">
            Обговорімо ваш простір, стиль і бюджет — запропонуємо кілька
            варіантів рішень та допоможемо обрати ідеальний формат.
          </p>
        </m.div>

        <m.div
          variants={fadeInUp}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
        >
          <Link
            href="/consultation"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm sm:text-base font-semibold text-emerald-900 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Sparkles className="w-4 h-4" />
            <span>Запланувати консультацію</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200/70 bg-black/10 px-5 py-3 text-xs sm:text-sm font-medium text-emerald-50 backdrop-blur-sm transition-all duration-200 hover:bg-emerald-500/15"
          >
            <span>Переглянути реалізовані проєкти</span>
          </Link>
        </m.div>

        <m.div
          variants={fadeInUp}
          className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-200/90"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-emerald-300" />
            <span>30 днів гарантії на всі рослини</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-3 h-3 text-emerald-300" />
            <span>Акуратна доставка по місту та області</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-3 h-3 text-emerald-300" />
            <span>Проєкти для дому, бізнесу та івентів</span>
          </div>
        </m.div>
      </m.div>
    </div>
  </section>
);
