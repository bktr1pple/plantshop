"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
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

// Enhanced motion component that fixes the loading issues
function AnimatedSection({ 
  children, 
  delay = 0,
  className = "" 
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [hasAnimated]);

  // Fallback: if element is already in viewport on load, animate it
  useEffect(() => {
    const checkIfVisible = () => {
      if (ref.current && !hasAnimated) {
        const element = ref.current as HTMLElement;
        const rect = element.getBoundingClientRect();
        const isVisible = (
          rect.top <= window.innerHeight * 0.9 &&
          rect.bottom >= window.innerHeight * 0.1
        );
        
        if (isVisible) {
          setHasAnimated(true);
        }
      }
    };

    checkIfVisible();
    const timer = setTimeout(checkIfVisible, 300);

    return () => clearTimeout(timer);
  }, [hasAnimated]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ 
        duration: 0.7, 
        delay: hasAnimated ? delay : 0,
        ease: "easeOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function PlantCarePage() {
  const [activeTab, setActiveTab] = useState("watering");
  const [activeSeason, setActiveSeason] = useState<Season>('spring');
  const pathname = usePathname();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Force re-check of animations when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  const careCategories = [
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
  ];
    type Season = 'spring' | 'summer' | 'autumn' | 'winter';

    // Типізація об’єкта seasonalCare
    const seasonalCare: Record<Season, { title: string; tasks: string[] }> = {
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
  };

  const plantTypes = [
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
  ];

  const commonProblems = [
    {
      symptom: "Жовтіюче листя",
      causes: ["Надлишковий полив", "Нестача поживних речовин", "Стрес"],
      solution: "Перевірте вологість грунту, змініть режим поливу"
    },
    {
      symptom: "Коричневі краї листя",
      causes: ["Низька вологість", "Надлишок добрив", "Пряме сонце"],
      solution: "Підвищте вологість, переставте в тінь"
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
  ];

  return (
    <div className="content-with-navbar flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 🌿 Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20"
      >
        {/* Background Elements */}
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 overflow-hidden"
        >
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-20 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl"></div>
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">Майстерня</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
                догляду
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Професійні поради, покрокові інструкції та секрети досвідчених флористів 
              для здорового та красивого росту ваших рослин
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#care-guides"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" />
                Почати навчання
              </a>
              <Link
                href="/plants"
                className="inline-flex items-center gap-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 px-8 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
              >
                Обрати рослини
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 📚 Quick Care Guides */}
      <section id="care-guides" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Основи <span className="text-emerald-600 dark:text-emerald-400">догляду</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Все, що вам потрібно знати для успішного догляду за комнатними рослинами
            </p>
          </AnimatedSection>

          {/* Care Categories Navigation */}
          <AnimatedSection delay={0.1} className="mb-12">
            <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
              {careCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeTab === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.icon}
                  {category.title}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Active Category Content */}
          <AnimatedSection key={activeTab} delay={0.2}>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {careCategories.find(c => c.id === activeTab)?.title}
                  </h3>
                  <div className="space-y-4">
                    {careCategories.find(c => c.id === activeTab)?.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Корисні поради
                  </h4>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
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
          </AnimatedSection>
        </div>
      </section>

      {/* 🌸 Seasonal Care */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Сезонний <span className="text-emerald-600 dark:text-emerald-400">догляд</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Адаптуйте догляд за рослинами відповідно до пори року
            </p>
          </AnimatedSection>

          {/* Season Selector */}
          <AnimatedSection delay={0.1} className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(seasonalCare).map(([key, season]) => (
                <button
                  key={key}
                  onClick={() => setActiveSeason(key as Season)}
                  className={`p-6 rounded-2xl text-center transition-all duration-300 ${
                    activeSeason === key
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="text-2xl mb-2">{season.title.split(' ')[1]}</div>
                  <div className="font-semibold">{season.title.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Season Content */}
          <AnimatedSection key={activeSeason} delay={0.2}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {seasonalCare[activeSeason].title} - Основні завдання
                  </h3>
                  <div className="space-y-4">
                    {seasonalCare[activeSeason].tasks.map((task, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white">
                  <h4 className="text-xl font-bold mb-4">Сезонні особливості</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5" />
                      <span>Тривалість світлового дня змінюється</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5" />
                      <span>Температура в приміщенні може коливатися</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Droplets className="w-5 h-5" />
                      <span>Вологість повітря залежить від сезону</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5" />
                      <span>Період активного росту або спокою</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 🌿 Plant Type Guides */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Догляд за типами <span className="text-emerald-600 dark:text-emerald-400">рослин</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Кожен тип рослин має свої особливості догляду
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantTypes.map((plant, index) => (
              <AnimatedSection 
                key={index}
                delay={index * 0.1}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{plant.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
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
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plant.care}
                </p>
                
                <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300">
                  Детальний гід
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 🩺 Problem Solver */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Діагностика <span className="text-emerald-600 dark:text-emerald-400">проблем</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Знайдіть рішення для поширених проблем з рослинами
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Common Problems */}
            <AnimatedSection className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Поширені симптоми
              </h3>
              
              {commonProblems.map((problem, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {problem.symptom}
                  </h4>
                  
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Можливі причини:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {problem.causes.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      💡 Рішення: {problem.solution}
                    </p>
                  </div>
                </div>
              ))}
            </AnimatedSection>

            {/* Expert Help */}
            <AnimatedSection delay={0.2} className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Потрібна допомога експерта?
                </h3>
                <p className="mb-6 opacity-90">
                  Наші фахівці готові допомогти діагностувати проблему 
                  та запропонувати ефективне рішення
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5" />
                    <span>Онлайн-консультації</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>Запис на прийом</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span>Гарантія результату</span>
                  </div>
                </div>

                <button className="w-full bg-white text-emerald-600 font-bold py-3 px-6 rounded-xl mt-6 hover:bg-gray-100 transition-colors duration-300">
                  Замовити консультацію
                </button>
              </div>

              {/* Care Schedule */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📅 Графік догляду
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span>Щодня</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Перевірка стану
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span>Щотижня</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Полив, обприскування
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span>Щомісяця</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Підживлення, обрізка
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Щороку</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Пересадка, омолодження
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 🎯 Final CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Станьте експертом з догляду за рослинами!
            </h2>
            
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Приєднуйтесь до нашої спільноти та отримуйте персональні поради, 
              ексклюзивні матеріали та підтримку професіоналів
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/consultation"
                className="inline-flex items-center gap-3 bg-white text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Sprout className="w-5 h-5" />
                Отримати консультацію
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-3 border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white hover:text-emerald-600 transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" />
                Всі курси
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Експертні поради</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Персональний підхід</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Практичні майстер-класи</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}