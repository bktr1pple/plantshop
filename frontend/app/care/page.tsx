"use client";

import { easeOut, LazyMotion, m, useScroll, useTransform, domAnimation } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { 
  Sprout, 
  Droplets, 
  Sun, 
  Thermometer, 
  Shield, 
  Bug, 
  Scissors,
  Clock,
  Calendar,
  BookOpen,
  Video,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Leaf,
  Zap,
  Heart
} from "lucide-react";

// Optimized motion component with LazyMotion
const MotionDiv = m.div;

// Enhanced intersection observer with better performance
function useIntersectionObserver(
  threshold = 0.1,
  rootMargin = '50px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold, rootMargin]);

  return [ref, isIntersecting] as const;
}

// Optimized animated section with GPU-friendly properties
function OptimizedSection({ 
  children, 
  delay = 0,
  className = "",
  stagger = false
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
  stagger?: boolean;
}) {
  const [ref, isIntersecting] = useIntersectionObserver();

  return (
    <MotionDiv
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: 0.6,
        delay: isIntersecting ? delay : 0,
        ease: "easeOut"
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </MotionDiv>
  );
}

// Stagger container for child animations
function StaggerContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: { 
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const [ref, isIntersecting] = useIntersectionObserver();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  };

  return (
    <MotionDiv
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isIntersecting ? "visible" : "hidden"}
      className={className}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <MotionDiv 
              key={index}
              variants={childVariants}
              style={{ willChange: 'transform, opacity' }}>
              {child}
            </MotionDiv>
          ))
        : children
      }
    </MotionDiv>
  );
}

export default function PlantCarePage() {
  const [activeTab, setActiveTab] = useState("watering");
  const [activeSeason, setActiveSeason] = useState<Season>('spring');
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile device for performance optimizations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Optimized transforms - only on desktop
  const y = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : 100]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 0]);

  // Memoized data to prevent recalculations
  const careCategories = useMemo(() => [
    {
      id: "watering",
      icon: <Droplets className="w-6 h-6" />,
      title: "Полив",
      color: "from-blue-500 to-cyan-600",
      tips: [
        "Перевіряйте вологість грунту пальцем перед поливом",
        "Використовуйте воду кімнатної температури",
        "Уникайте застою води в піддоні",
        "Влітку поливайте частіше, взимку - рідше"
      ]
    },
    {
      id: "light",
      icon: <Sun className="w-6 h-6" />,
      title: "Освітлення",
      color: "from-yellow-500 to-orange-600",
      tips: [
        "Більшість рослин люблять яскраве розсіяне світло",
        "Пряме сонце може спалити листя",
        "Тіньолюбиві рослини можуть рости в глибині кімнати",
        "Обертайте рослини для рівномірного росту"
      ]
    },
    {
      id: "temperature",
      icon: <Thermometer className="w-6 h-6" />,
      title: "Температура",
      color: "from-red-500 to-pink-600",
      tips: [
        "Ідеальна температура: 18-24°C",
        "Уникайте різких перепадів температури",
        "Захищайте від сквозняків та обігрівачів",
        "Тропічні рослини потребують вищої вологості"
      ]
    },
    {
      id: "fertilizing",
      icon: <Zap className="w-6 h-6" />,
      title: "Підживлення",
      color: "from-green-500 to-emerald-600",
      tips: [
        "Підживлюйте в період активного росту (весна-літо)",
        "Використовуйте спеціалізовані добрива",
        "Дотримуйтесь дозування на упаковці",
        "Взимку зменшіть підживлення"
      ]
    },
    {
      id: "pruning",
      icon: <Scissors className="w-6 h-6" />,
      title: "Обрізка",
      color: "from-purple-500 to-indigo-600",
      tips: [
        "Обрізайте сухі та пошкоджені листя",
        "Формуйте крону навесні",
        "Використовуйте чисті інструменти",
        "Збирайте живці для розмноження"
      ]
    },
    {
      id: "pests",
      icon: <Bug className="w-6 h-6" />,
      title: "Шкідники",
      color: "from-rose-500 to-red-600",
      tips: [
        "Регулярно оглядайте рослини",
        "Ізолюйте уражені рослини",
        "Використовуйте натуральні засоби боротьби",
        "Профілактика - найкращий захист"
      ]
    }
  ], []);

  type Season = 'spring' | 'summer' | 'autumn' | 'winter';

  const seasonalCare = useMemo(() => ({
    spring: {
      title: "Весна 🌸",
      tasks: [
        "Поступово збільшуйте полив",
        "Розпочніть регулярне підживлення",
        "Пересаджіть рослини за потреби",
        "Обріжьте сухі гілки"
      ]
    },
    summer: {
      title: "Літо ☀️",
      tasks: [
        "Регулярний полив та підживлення",
        "Захищайте від прямого сонця",
        "Підвищуйте вологість повітря",
        "Контролюйте шкідників"
      ]
    },
    autumn: {
      title: "Осінь 🍂",
      tasks: [
        "Зменшіть полив та підживлення",
        "Підготуйте рослини до зими",
        "Обріжьте відцвілі квіти",
        "Переставте від холодних вікон"
      ]
    },
    winter: {
      title: "Зима ❄️",
      tasks: [
        "Мінімальний полив",
        "Припиніть підживлення",
        "Захищайте від холодних сквозняків",
        "Підтримуйте вологість повітря"
      ]
    }
  }), []);

  const plantTypes = useMemo(() => [
    {
      name: "Сукуленти",
      icon: "🌵",
      care: "Мінімальний полив, яскраве освітлення",
      difficulty: "Легко"
    },
    {
      name: "Тропічні рослини",
      icon: "🌴",
      care: "Висока вологість, регулярний полив",
      difficulty: "Середньо"
    },
    {
      name: "Кактуси",
      icon: "🎍",
      care: "Рідкісний полив, багато світла",
      difficulty: "Легко"
    },
    {
      name: "Папороті",
      icon: "🍃",
      care: "Висока вологість, непряме світло",
      difficulty: "Складно"
    },
    {
      name: "Цвітучі рослини",
      icon: "🌺",
      care: "Яскраве світло, регулярне підживлення",
      difficulty: "Середньо"
    },
    {
      name: "Листяні декоративні",
      icon: "🌿",
      care: "Непряме світло, помірний полив",
      difficulty: "Легко"
    }
  ], []);

  const commonProblems = useMemo(() => [
    {
      symptom: "Жовтіюче листя",
      causes: ["Надлишковий полив", "Нестача поживних речовин", "Стрес"],
      solution: "Перевірте вологість грунту, змініть режим поливу"
    },
    {
      symptom: "Коричневі краї листя",
      causes: ["Низька вологість", "Надлишок добрив", "Пряме сонце"],
      solution: "Підвищіть вологість, переставте в тінь"
    },
    {
      symptom: "Повільний ріст",
      causes: ["Нестача світла", "Низька температура", "Потребує пересадки"],
      solution: "Переставте у яскравіше місце, пересадіть"
    },
    {
      symptom: "В'яле листя",
      causes: ["Нестача води", "Надлишковий полив", "Коренева гниль"],
      solution: "Перевірте кореневу систему, відрегулюйте полив"
    }
  ], []);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="content-with-navbar flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* 🌿 Hero Section - Optimized */}
        <section 
          ref={heroRef}
          className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20"
        >
          {/* Simplified background elements for mobile */}
          <MotionDiv 
            style={{ y, opacity }}
            className="absolute inset-0 overflow-hidden"
          >
            {!isMobile && (
              <>
                <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-20 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl"></div>
              </>
            )}
          </MotionDiv>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <OptimizedSection>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
                <span className="text-gray-900 dark:text-white">Майстерня</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
                  догляду
                </span>
              </h1>
            </OptimizedSection>

            <OptimizedSection delay={0.1}>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
                Професійні поради, покрокові інструкції та секрети досвідчених флористів 
                для здорового та красивого росту ваших рослин
              </p>
            </OptimizedSection>

            <OptimizedSection delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <a
                  href="#care-guides"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  Почати навчання
                </a>
                <Link
                  href="/plants"
                  className="inline-flex items-center gap-2 sm:gap-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 text-sm sm:text-base"
                >
                  Обрати рослини
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </OptimizedSection>
          </div>
        </section>

        {/* 📚 Quick Care Guides - Optimized */}
        <section id="care-guides" className="py-16 sm:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <OptimizedSection className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Основи <span className="text-emerald-600 dark:text-emerald-400">догляду</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
                Все, що вам потрібно знати для успішного догляду за комнатними рослинами
              </p>
            </OptimizedSection>

            {/* Care Categories Navigation */}
            <OptimizedSection delay={0.1} className="mb-8 sm:mb-12">
              <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide px-1">
                {careCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                      activeTab === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {category.icon}
                    <span className="text-sm sm:text-base">{category.title}</span>
                  </button>
                ))}
              </div>
            </OptimizedSection>

            {/* Active Category Content */}
            <OptimizedSection key={activeTab} delay={0.2}>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-12 sm:mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                      {careCategories.find(c => c.id === activeTab)?.title}
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {careCategories.find(c => c.id === activeTab)?.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                      Корисні поради
                    </h4>
                    <div className="space-y-2 sm:space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span>Регулярність - ключ до успіху</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <span>Спостерігайте за реакцією рослини</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-emerald-500" />
                        <span>Кожна рослина - індивідуальна</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </OptimizedSection>
          </div>
        </section>

        {/* 🌸 Seasonal Care - Optimized with stagger */}
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <OptimizedSection className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Сезонний <span className="text-emerald-600 dark:text-emerald-400">догляд</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
                Адаптуйте догляд за рослинами відповідно до пори року
              </p>
            </OptimizedSection>

            {/* Season Selector */}
            <OptimizedSection delay={0.1} className="mb-8 sm:mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {Object.entries(seasonalCare).map(([key, season]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSeason(key as Season)}
                    className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center transition-all duration-300 ${
                      activeSeason === key
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{season.title.split(' ')[1]}</div>
                    <div className="font-semibold text-sm sm:text-base">{season.title.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </OptimizedSection>

            {/* Season Content */}
            <OptimizedSection key={activeSeason} delay={0.2}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                      {seasonalCare[activeSeason].title} - Основні завдання
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {seasonalCare[activeSeason].tasks.map((task, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 sm:p-8 text-white">
                    <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Сезонні особливості</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Тривалість світлового дня змінюється</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Температура в приміщенні може коливатися</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Вологість повітря залежить від сезону</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Період активного росту або спокою</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </OptimizedSection>
          </div>
        </section>

        {/* 🌿 Plant Type Guides - Optimized with stagger */}
        <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <OptimizedSection className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Догляд за типами <span className="text-emerald-600 dark:text-emerald-400">рослин</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
                Кожен тип рослин має свої особливості догляду
              </p>
            </OptimizedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" staggerDelay={0.08}>
              {plantTypes.map((plant, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl">{plant.icon}</span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {plant.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        plant.difficulty === "Легко" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : plant.difficulty === "Середньо"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}>
                        {plant.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                    {plant.care}
                  </p>
                  
                  <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg sm:rounded-xl font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 text-sm sm:text-base">
                    Детальний гід
                  </button>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* 🩺 Problem Solver - Optimized */}
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <OptimizedSection className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Діагностика <span className="text-emerald-600 dark:text-emerald-400">проблем</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
                Знайдіть рішення для поширених проблем з рослинами
              </p>
            </OptimizedSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Common Problems */}
            <StaggerContainer
              staggerDelay={0.1}
              className="flex flex-col space-y-6"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Поширені симптоми
              </h3>

              <div className="flex flex-col gap-6">
                {commonProblems.map((problem, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {problem.symptom}
                    </h4>

                    <div className="space-y-3 mb-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Можливі причини:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {problem.causes.map((cause, idx) => (
                          <li key={idx}>{cause}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                        💡 Рішення: {problem.solution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </StaggerContainer>

            {/* Expert Help + Schedule */}
            <OptimizedSection delay={0.2} className="flex flex-col gap-6">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-lg">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">
                  Потрібна допомога експерта?
                </h3>
                <p className="mb-6 opacity-90 text-sm sm:text-base">
                  Наші фахівці готові допомогти діагностувати проблему 
                  та запропонувати ефективне рішення
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Онлайн-консультації</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Запис на прийом</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Гарантія результату</span>
                  </div>
                </div>

                <button className="w-full bg-white text-emerald-600 font-bold py-3 px-6 rounded-xl mt-6 hover:bg-gray-100 transition-colors duration-300 text-sm sm:text-base">
                  Замовити консультацію
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📅 Графік догляду
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    ["Щодня", "Перевірка стану"],
                    ["Щотижня", "Полив, обприскування"],
                    ["Щомісяця", "Підживлення, обрізка"],
                    ["Щороку", "Пересадка, омолодження"],
                  ].map(([period, task], i, arr) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center py-2 ${
                        i !== arr.length - 1
                          ? "border-b border-gray-100 dark:border-gray-700"
                          : ""
                      }`}
                    >
                      <span>{period}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </OptimizedSection>
          </div>

          </div>
        </section>

        {/* 🎯 Final CTA - Optimized */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <OptimizedSection className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                Станьте експертом з догляду за рослинами!
              </h2>
              
              <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
                Приєднуйтесь до нашої спільноти та отримуйте персональні поради, 
                ексклюзивні матеріали та підтримку професіоналів
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-white text-emerald-600 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                  Отримати консультацію
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 sm:gap-3 border-2 border-white text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl hover:bg-white hover:text-emerald-600 transition-all duration-300 text-sm sm:text-base"
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  Всі курси
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm opacity-80">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Експертні поради</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Персональний підхід</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Практичні майстер-класи</span>
                </div>
              </div>
            </OptimizedSection>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}