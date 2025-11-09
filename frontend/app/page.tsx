"use client";

import { LazyMotion, m, useScroll, useTransform, AnimatePresence, domAnimation, cubicBezier } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Leaf, Sparkles, Sprout, Trees, ArrowRight, Play, Star, Shield, Truck, Clock, Users, Award } from "lucide-react";
import Particles from "./components/Particles";

// Optimized motion components with LazyMotion
const MotionDiv = m.div;
const MotionSpan = m.span;
const MotionH1 = m.h1;
const MotionP = m.p;
const MotionH2 = m.h2;
const MotionImg = m.img;

export default function HomePage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);

  // 🌿 Optimized hero images with mobile sizes
  const heroImages = useMemo(() => [
    {
      desktop: "/images/block.jpg",
      mobile: "/images/block.jpg",
      alt: "Premium plants collection"
    },
    {
      desktop: "/images/placeholder.jpg",
      mobile: "/images/placeholder.jpg",
      alt: "Professional plant design"
    },
    {
      desktop: "/images/placeholder2.jpg", 
      mobile: "/images/placeholder2.jpg",
      alt: "Modern green spaces"
    },
    {
      desktop: "/images/block.jpg",
      mobile: "/images/block.jpg",
      alt: "Luxury plant arrangements"
    }
  ], []);

  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized mouse move with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setMousePosition({
            x: (e.clientX / window.innerWidth - 0.5) * (isMobile ? 10 : 20),
            y: (e.clientY / window.innerHeight - 0.5) * (isMobile ? 5 : 20)
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isMobile]);

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

  // 🌱 Optimized parallax backgrounds
  const natureRef = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: natureRef, 
    offset: ["start end", "end start"] 
  });
  
  const moveY1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const moveY2 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const moveY3 = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Optimized stats counter animation
  const [stats, setStats] = useState({ plants: 0, customers: 0, years: 0, projects: 0 });
  const targetStats = useMemo(() => ({ 
    plants: 2500, 
    customers: 12000, 
    years: 8, 
    projects: 3500 
  }), []);

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
        projects: Math.floor(targetStats.projects * easeOut)
      });

      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetStats]);

  // Animation variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
      }
    }
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
      }
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      {/* ОСНОВНОЕ ИЗМЕНЕНИЕ: Добавлены классы для темной темы */}
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
        <main className="flex-grow">

          {/* 🌿 Optimized Hero Section */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black dark:bg-gray-900">
            {/* Dynamic background with optimized mouse parallax */}
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
                    transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px) scale(1.02)`
                  }}
                >
                  <Image
                    src={isMobile ? heroImages[current].mobile : heroImages[current].desktop}
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
              
              {/* Optimized gradient overlays */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-green-950/85 dark:from-gray-900/90 via-green-900/40 dark:via-gray-800/50 to-transparent"
                style={{ willChange: 'opacity' }}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-r from-black/20 dark:from-gray-900/30 to-transparent"
                style={{ willChange: 'opacity' }}
              />
              
              {/* Optimized light spots - reduced on mobile */}
              {!isMobile && (
                <>
                  <MotionDiv
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-500/5 blur-[80px] rounded-full"
                    style={{ willChange: 'transform, opacity' }}
                  />
                  <MotionDiv
                    animate={{ 
                      scale: [1.1, 1, 1.1],
                      opacity: [0.15, 0.2, 0.15],
                    }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-green-300/15 dark:bg-green-400/10 blur-[70px] rounded-full"
                    style={{ willChange: 'transform, opacity' }}
                  />
                </>
              )}
            </div>

            {/* Premium Content with optimized animations */}
            <div className="relative z-10 text-center max-w-6xl px-4 sm:px-8">
              <MotionDiv
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-6 sm:mb-8"
                style={{ willChange: 'transform, opacity' }}
              >
                <MotionSpan
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/20 dark:border-gray-600/30 text-green-100 dark:text-green-200 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  Преміум рослини з 2016 року
                </MotionSpan>
              </MotionDiv>

              <MotionH1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight"
                style={{ willChange: 'transform, opacity' }}
              >
                <span className="bg-gradient-to-r from-emerald-200 via-green-300 to-emerald-200 bg-clip-text text-transparent">
                  Природа
                </span>
                <br />
                <span className="text-white text-3xl sm:text-5xl lg:text-7xl">у сучасному</span>
                <br />
                <span className="bg-gradient-to-r from-green-200 to-emerald-300 bg-clip-text text-transparent">
                  дизайні
                </span>
              </MotionH1>

              <MotionP
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="mt-6 sm:mt-8 text-lg sm:text-xl lg:text-2xl text-green-50/90 dark:text-green-100/80 max-w-4xl mx-auto leading-relaxed font-light tracking-wide px-4"
                style={{ willChange: 'transform, opacity' }}
              >
                Ексклюзивні рослини, професійний догляд та авторські рішення 
                для створення ідеального простору
              </MotionP>

              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
                style={{ willChange: 'transform, opacity' }}
              >
                <Link
                  href="/plants"
                  className="group relative inline-flex items-center gap-3 bg-white dark:bg-gray-800 text-green-800 dark:text-green-200 font-bold py-4 px-8 sm:py-5 sm:px-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-base sm:text-lg">До каталогу</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>

                <button className="group inline-flex items-center gap-2 bg-transparent border-2 border-white/30 dark:border-gray-400/30 text-white dark:text-gray-200 font-semibold py-4 px-6 sm:py-5 sm:px-8 rounded-2xl backdrop-blur-md hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/50 dark:hover:border-gray-300/50 transition-all duration-300">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Відео тур</span>
                </button>
              </MotionDiv>

              {/* Optimized Stats Bar */}
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="mt-12 sm:mt-16 grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-4 max-w-2xl sm:max-w-4xl mx-auto px-4"
                style={{ willChange: 'transform, opacity' }}
              >
                {useMemo(() => [
                  { value: stats.plants, label: "Видів рослин", suffix: "+" },
                  { value: stats.customers, label: "Задоволених клієнтів", suffix: "+" },
                  { value: stats.years, label: "Років досвіду", suffix: "" },
                  { value: stats.projects, label: "Реалізованих проектів", suffix: "+" }
                ], [stats]).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-green-200/80 dark:text-green-300/80 text-xs sm:text-sm font-medium leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </MotionDiv>
            </div>

            {/* Enhanced Progress Dots */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setCurrent(i);
                      setTimeout(() => setIsAnimating(false), 600);
                    }
                  }}
                  className={`relative h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    current === i ? "w-6 sm:w-8 bg-emerald-400" : "w-1.5 sm:w-2 bg-white/50 dark:bg-gray-400/50 hover:bg-white/70 dark:hover:bg-gray-300/70"
                  }`}
                >
                  {current === i && (
                    <MotionDiv
                      layoutId="activeDot"
                      className="absolute inset-0 bg-emerald-400 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ willChange: 'transform' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Scroll Indicator - hidden on mobile */}
            {!isMobile && (
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-8 right-8 flex items-center gap-2 text-white/60 dark:text-gray-300/60 text-sm font-medium"
                style={{ willChange: 'opacity' }}
              >
                <MotionDiv
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-4 border border-white/30 dark:border-gray-400/30 rounded-full flex justify-center"
                  style={{ willChange: 'transform' }}
                >
                  <div className="w-px h-1.5 bg-white/50 dark:bg-gray-400/50 rounded-full mt-1" />
                </MotionDiv>
                Прокрутіть
              </MotionDiv>
            )}
          </section>

          {/* 🏆 Optimized Features Section */}
          <section className="relative py-20 sm:py-32 bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <MotionDiv
                style={{ y: moveY1, willChange: 'transform' }}
                className="absolute top-[-10rem] left-[-10rem] w-[30rem] h-[30rem] sm:w-[40rem] sm:h-[40rem] bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-[120px] sm:blur-[160px]"
              />
              <MotionDiv
                style={{ y: moveY2, willChange: 'transform' }}
                className="absolute top-1/3 right-[-10rem] w-[35rem] h-[35rem] sm:w-[45rem] sm:h-[45rem] bg-green-50 dark:bg-green-900/10 rounded-full blur-[140px] sm:blur-[180px]"
              />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
              {/* Section Header */}
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-50px" }}
                className="text-center mb-12 sm:mb-20"
                style={{ willChange: 'transform, opacity' }}
              >
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Чому обирають{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-green-700 dark:from-emerald-400 dark:to-green-500 bg-clip-text text-transparent">
                    нас
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
                  Ми поєднуємо красу природи з інноваційними технологіями
                </p>
              </MotionDiv>

              {/* Optimized Features Grid with stagger */}
              <MotionDiv
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
                style={{ willChange: 'transform, opacity' }}
              >
                {useMemo(() => [
                  {
                    icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
                    title: "Преміум якість",
                    description: "Всі рослини проходять 5-ступінчастий контроль якості та походять з сертифікованих розплідників",
                    features: ["Сертифіковані розплідники", "Експертний контроль", "Гарантія якості"]
                  },
                  {
                    icon: <Truck className="w-6 h-6 sm:w-8 sm:h-8" />,
                    title: "Безпечна доставка",
                    description: "Спеціальна упаковка та швидка доставка гарантують, що рослини прибудуть до вас у ідеальному стані",
                    features: ["Спеціальна упаковка", "Експрес-доставка", "Відстеження"]
                  },
                  {
                    icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
                    title: "Гарантія приживання",
                    description: "30-денна гарантія на всі рослини. Якщо щось піде не так - ми замінимо без зайвих питань",
                    features: ["30 днів гарантії", "Безкоштовна заміна", "Підтримка 24/7"]
                  },
                  {
                    icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
                    title: "Персональний консультант",
                    description: "Кожен клієнт отримує персонального фахівця, який супроводжує протягом усього життєвого циклу рослини",
                    features: ["Персональний підбір", "Консультації догляду", "Регулярний супровід"]
                  }
                ], []).map((feature, index) => (
                  <MotionDiv
                    key={index}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -4, 
                      transition: { type: "spring", stiffness: 400, damping: 25 } 
                    }}
                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl p-6 sm:p-8 transition-all duration-300 overflow-hidden"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white dark:from-gray-800 via-emerald-50/50 dark:via-emerald-900/10 to-white dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300">
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">{feature.description}</p>

                      {/* Features List */}
                      <ul className="space-y-2 sm:space-y-3">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                            <span className="font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </MotionDiv>
                ))}
              </MotionDiv>
            </div>
          </section>

          {/* 🌿 Optimized Services Section */}
          <section ref={natureRef} className="relative py-20 sm:py-32 bg-gradient-to-b from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/10 overflow-hidden transition-colors duration-300">
            {/* Parallax Backgrounds */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <MotionDiv
                style={{ y: moveY1, willChange: 'transform' }}
                className="absolute top-[-10rem] left-[-10rem] w-[30rem] h-[30rem] sm:w-[40rem] sm:h-[40rem] bg-emerald-200/40 dark:bg-emerald-800/20 rounded-full blur-[120px] sm:blur-[160px]"
              />
              <MotionDiv
                style={{ y: moveY2, willChange: 'transform' }}
                className="absolute top-1/3 right-[-10rem] w-[35rem] h-[35rem] sm:w-[45rem] sm:h-[45rem] bg-green-300/25 dark:bg-green-800/15 rounded-full blur-[140px] sm:blur-[180px]"
              />
              <MotionDiv
                style={{ y: moveY3, willChange: 'transform' }}
                className="absolute bottom-[-8rem] left-[10%] w-[25rem] h-[25rem] sm:w-[35rem] sm:h-[35rem] bg-emerald-100/40 dark:bg-emerald-800/10 rounded-full blur-[120px] sm:blur-[160px]"
              />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
              {/* Section Header */}
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-50px" }}
                className="mb-12 sm:mb-20"
                style={{ willChange: 'transform, opacity' }}
              >
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Наші{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-green-700 dark:from-emerald-400 dark:to-green-500 bg-clip-text text-transparent">
                    послуги
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
                  Комплексний підхід до створення ідеального зеленого простору
                </p>
              </MotionDiv>

              {/* Optimized Services Grid */}
              <MotionDiv
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                style={{ willChange: 'transform, opacity' }}
              >
                {useMemo(() => [
                  {
                    icon: <Sprout className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
                    title: "Продаж рослин",
                    description: "Ексклюзивні рослини з усього світу, підібрані нашими флористами",
                    image: "/images/placeholder.jpg",
                    features: ["Екзотичні види", "Флористичний підбір", "Консультація догляду"],
                    price: "від 299 ₴"
                  },
                  {
                    icon: <Trees className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
                    title: "Ландшафтний дизайн",
                    description: "Повний цикл створення гармонійних просторів - від концепції до реалізації",
                    image: "/images/placeholder2.jpg",
                    features: ["3D візуалізація", "Підбір матеріалів", "Авторський нагляд"],
                    price: "від 15 000 ₴"
                  },
                  {
                    icon: <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
                    title: "Догляд за рослинами",
                    description: "Професійне обслуговування та супровід ваших зелених композицій",
                    image: "/images/test.jpg",
                    features: ["Регулярний догляд", "Діагностика", "Лечення рослин"],
                    price: "від 999 ₴/міс"
                  }
                ], []).map((service, i) => (
                  <MotionDiv
                    key={i}
                    variants={scaleVariants}
                    whileHover={{
                      y: -6,
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-300"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {/* Service Image */}
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMkX0RbNPoLbqoWrC90iW6nP/2Q=="
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-2">
                        <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">{service.price}</span>
                      </div>
                    </div>

                    {/* Service Content */}
                    <div className="p-4 sm:p-6 lg:p-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300">
                        <div className="text-white">
                          {service.icon}
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{service.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">{service.description}</p>

                      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                        <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                          Детальніше
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </MotionDiv>
                ))}
              </MotionDiv>
            </div>
          </section>

          {/* 🌟 Optimized CTA Section */}
          <section className="relative py-20 sm:py-36 px-4 sm:px-6 text-center text-white overflow-hidden bg-gray-900 dark:bg-gray-800 transition-colors duration-300">
            {/* Enhanced Background */}
            <div className="absolute inset-0">
              <MotionDiv
                initial={{ scale: 1.05, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true }}
                className="absolute inset-0"
                style={{ willChange: 'transform, opacity' }}
              >
                <Image
                  src="/images/plants-bg.jpg"
                  alt="Plants background"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  quality={80}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMkX0RbNPoLbqoWrC90iW6nP/2Q=="
                />
              </MotionDiv>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-gray-900/95 dark:from-gray-800/95 dark:via-gray-800/80 dark:to-gray-800/95" />
              
              {/* Fixed Animated particles - No random values */}
              <Particles />
            </div>

            {/* Optimized glow */}
            {!isMobile && (
              <MotionDiv
                animate={{ 
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ repeat: Infinity, duration: 8 }}
                className="absolute top-1/3 left-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-emerald-500/20 dark:bg-emerald-400/10 blur-[80px] sm:blur-[120px] rounded-full mix-blend-screen"
                style={{ willChange: 'opacity' }}
              />
            )}

            <div className="relative z-10 max-w-4xl mx-auto">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-6 sm:mb-8"
                style={{ willChange: 'transform, opacity' }}
              >
                <span className="inline-flex items-center gap-2 bg-emerald-500/20 dark:bg-emerald-400/10 backdrop-blur-md border border-emerald-400/30 dark:border-emerald-300/20 text-emerald-200 dark:text-emerald-100 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-medium">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  Преміум якість з 2016 року
                </span>
              </MotionDiv>

              <MotionH2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-7xl font-black mb-6 sm:mb-8 leading-tight"
                style={{ willChange: 'transform, opacity' }}
              >
                Готові створити{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                  ідеальний
                </span>
                <br />
                зелений простір?
              </MotionH2>

              <MotionP
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg sm:text-xl lg:text-2xl opacity-90 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed"
                style={{ willChange: 'transform, opacity' }}
              >
                Приєднуйтесь до 12,000+ клієнтів, які вже довірили нам створення 
                своєї ідеальної атмосфери.
              </MotionP>

              <MotionDiv
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
                style={{ willChange: 'transform, opacity' }}
              >
                <Link
                  href="/consultation"
                  className="group relative inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold py-4 px-8 sm:py-5 sm:px-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-base sm:text-lg">Отримати консультацію</span>
                </Link>

                <Link
                  href="/portfolio"
                  className="group inline-flex items-center gap-2 bg-transparent border-2 border-white/30 dark:border-gray-400/30 text-white dark:text-gray-200 font-semibold py-4 px-6 sm:py-5 sm:px-8 rounded-2xl backdrop-blur-md hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/50 dark:hover:border-gray-300/50 transition-all duration-300"
                >
                  <span className="text-sm sm:text-base">Переглянути портфоліо</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </MotionDiv>

              {/* Trust badges */}
              <MotionDiv
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400 dark:text-gray-500"
                style={{ willChange: 'opacity' }}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>Гарантія якості</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>Безпечна доставка</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>Підтримка 24/7</span>
                </div>
              </MotionDiv>
            </div>
          </section>
        </main>
      </div>
    </LazyMotion>
  );
}