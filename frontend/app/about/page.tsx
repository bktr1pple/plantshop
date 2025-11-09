"use client";

import React from "react";
import { LazyMotion, m, domAnimation, Variants } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Leaf, 
  Sparkles, 
  Users, 
  Target, 
  Award, 
  Heart, 
  Globe, 
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Calendar,
  Sprout,
  Trees
} from "lucide-react";

// Optimized animated section with GPU-accelerated properties
function AnimatedSection({ 
  children, 
  delay = 0,
  className = "",
  stagger = 0
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
  stagger?: number;
}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "50px"
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: 0.5,
        delay: isInView ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </m.div>
  );
}

// Stagger animation for multiple children
function StaggerContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}: { 
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
  };

  return (
    <m.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <m.div key={index} variants={childVariants} style={{ willChange: 'transform, opacity' }}>
          {child}
        </m.div>
      ))}
    </m.div>
  );
}

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized data to prevent unnecessary recalculations
  const statsData = useMemo(() => [
    { number: "8+", label: "Років досвіду", icon: <Calendar className="w-6 h-6" /> },
    { number: "12,000+", label: "Задоволених клієнтів", icon: <Users className="w-6 h-6" /> },
    { number: "2,500+", label: "Видів рослин", icon: <Sprout className="w-6 h-6" /> },
    { number: "3,500+", label: "Успішних проектів", icon: <Award className="w-6 h-6" /> }
  ], []);

  const featuresData = useMemo(() => [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Гарантія якості",
      description: "Всі рослини проходять ретельний відбір та мають гарантію приживання"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Експертний підбір",
      description: "Наші флористи допоможуть підібрати рослини під ваш простір та умови"
    },
    {
      icon: <Trees className="w-8 h-8" />,
      title: "Власні теплиці",
      description: "Вирощуємо рослини в ідеальних умовах з дотриманням всіх стандартів"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Турбота про клієнтів",
      description: "Персональний супровід та підтримка на всіх етапах"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Екологічність",
      description: "Використовуємо екологічно чисті матеріали та методи вирощування"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Професійна команда",
      description: "Досвідчені фахівці з ботаніки, дизайну та догляду за рослинами"
    }
  ], []);

  const missionItems = useMemo(() => [
    "Покращення якості повітря в приміщеннях",
    "Створення гармонійного середовища",
    "Екологічно відповідальний підхід",
    "Навчання клієнтів правильному догляду"
  ], []);

  const valuesData = useMemo(() => [
    { icon: "🌱", label: "Сталий розвиток" },
    { icon: "💚", label: "Любов до природи" },
    { icon: "🏆", label: "Якість" },
    { icon: "🤝", label: "Партнерство" }
  ], []);

  const achievementsData = useMemo(() => [
    "🏆 Найкращий онлайн-магазин рослин 2023",
    "🌿 Понад 12,000 задоволених клієнтів",
    "💚 Екологічно відповідальний бізнес",
    "⭐ 4.9/5 рейтинг на основі 2,500+ відгуків"
  ], []);

  if (!isClient) {
    return (
      <div className="content-with-navbar flex flex-col min-h-screen bg-white dark:bg-gray-900">
        {/* Simple static fallback */}
        <div className="min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20" />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="content-with-navbar flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* 🌿 Hero Section - Optimized with reduced blur */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
          {/* Optimized background elements with reduced blur */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-20 w-96 h-96 bg-green-300/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-100/40 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <AnimatedSection>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
                  PlantShop
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">Ваш провідник у світ</span>
                <br />
                <span className="text-gray-900 dark:text-white">природи</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Ми створюємо гармонійний зв'язок між людиною та природою, 
                перетворюючи простір на оазу спокою та краси
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/plants"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  style={{ willChange: 'transform' }}
                >
                  <Leaf className="w-5 h-5" />
                  Переглянути колекцію
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 px-8 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
                >
                  Зв'язатися з нами
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* 📊 Stats Section with Stagger */}
        <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8" staggerDelay={0.08}>
              {statsData.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div 
                    className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{ willChange: 'transform' }}
                  >
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* 🎯 Mission & Vision */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Mission */}
              <AnimatedSection className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Наша місія
                  </h2>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ми прагнемо зробити світ зеленішим, починаючи з вашого дому. 
                  Кожна рослина, яку ми доставляємо, - це не просто декор, а живий організм, 
                  що наповнює простір енергією, очищає повітря та створює атмосферу гармонії.
                </p>
                
                <div className="space-y-3">
                  {missionItems.map((item, index) => (
                    <m.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </m.div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Vision */}
              <AnimatedSection delay={0.1} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Наше бачення
                  </h2>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ми уявляємо майбутнє, де кожен будинок, офіс та громадський простір 
                  наповнені зеленими рослинами, де люди живуть у гармонії з природою, 
                  а міста перетворюються на квітучі сади.
                </p>
                
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Наші цінності
                  </h3>
                  <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.05}>
                    {valuesData.map((value, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-2xl">{value.icon}</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {value.label}
                        </span>
                      </div>
                    ))}
                  </StaggerContainer>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* 🌍 Our Story */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Наша <span className="text-emerald-600 dark:text-emerald-400">історія</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Від невеликої мрії до лідера ринку в галузі комнатних рослин
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <AnimatedSection className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Початок шляху
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Все почалося у 2016 році з невеликої теплиці та великої мрії - 
                    зробити якісні комнатні рослини доступними для кожного. 
                    Засновник компанії, Олександр Петренко, розпочав свій шлях 
                    з любові до природи та бажання поділитися цією любов'ю з іншими.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Зростання та розвиток
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    За 8 років ми перетворилися з невеликого магазину на повноцінний 
                    екосистемний проект, що включає продаж рослин, ландшафтний дизайн, 
                    консультації з догляду та освітні майстер-класи.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Сьогодення та майбутнє
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Сьогодні PlantShop - це команда з 50+ професіоналів, 
                    власні теплиці в 3 регіонах України та тисячі щасливих клієнтів. 
                    Ми продовжуємо розвиватися та впроваджувати інновації у світі рослин.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1} className="relative">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-6 md:p-8 text-white">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8" />
                      <h3 className="text-2xl font-bold">Наші досягнення</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {achievementsData.map((achievement, index) => (
                        <m.div 
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center gap-3"
                          style={{ willChange: 'transform, opacity' }}
                        >
                          <Star className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                          <span>{achievement}</span>
                        </m.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Reduced decorative elements for performance */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-green-300/20 rounded-full blur-xl"></div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* 💪 Why Choose Us with Stagger */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Чому обирають <span className="text-emerald-600 dark:text-emerald-400">нас</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Ми пропонуємо не просто рослини, а комплексне рішення для вашого простору
              </p>
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
              {featuresData.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div 
                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ willChange: 'transform' }}
                  >
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* 🎯 Call to Action */}
        <section className="py-16 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <AnimatedSection className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Готові перетворити ваш простір?
              </h2>
              
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Приєднуйтесь до тисячі клієнтів, які вже довірили нам створення 
                своєї ідеальної зеленої оази
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/plants"
                  className="inline-flex items-center gap-3 bg-white text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  style={{ willChange: 'transform' }}
                >
                  <Leaf className="w-5 h-5" />
                  Обрати рослини
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white hover:text-emerald-600 transition-all duration-300"
                >
                  Отримати консультацію
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <StaggerContainer className="flex flex-wrap justify-center items-center gap-6 text-sm opacity-80" staggerDelay={0.05}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Гарантія якості</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Професійна підтримка</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Безкоштовна доставка</span>
                </div>
              </StaggerContainer>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}