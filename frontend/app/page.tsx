"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Leaf, Sparkles, Sprout, Trees, ArrowRight, Play, Star, Shield, Truck, Clock, Users, Award } from "lucide-react";

export default function HomePage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);

  // 🌿 Enhanced hero image carousel with professional photos
  const heroImages = [
    "/images/block.jpg",
    "/images/placeholder.jpg", 
    "/images/placeholder2.jpg",
    "/images/block.jpg"
  ];

  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrent((prev) => (prev + 1) % heroImages.length);
        setTimeout(() => setIsAnimating(false), 1000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAnimating, heroImages.length]);

  // 🌱 Parallax backgrounds
  const natureRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: natureRef, offset: ["start end", "end start"] });
  const moveY1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const moveY2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const moveY3 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  // Stats counter animation
  const [stats, setStats] = useState({ plants: 0, customers: 0, years: 0, projects: 0 });
  const targetStats = { plants: 2500, customers: 12000, years: 8, projects: 3500 };

  useEffect(() => {
    const duration = 3000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setStats({
        plants: Math.floor(targetStats.plants * progress),
        customers: Math.floor(targetStats.customers * progress),
        years: Math.floor(targetStats.years * progress),
        projects: Math.floor(targetStats.projects * progress)
      });

      if (step >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-gray-900 overflow-hidden">
      <main className="flex-grow">

        {/* 🌿 Premium Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
          {/* Dynamic background with mouse parallax */}
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${heroImages[current]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px) scale(1.02)`
                }}
              />
            </AnimatePresence>
            
            {/* Enhanced gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-green-950/85 via-green-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            
            {/* Animated light spots */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 blur-[120px] rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.15, 0.25, 0.15],
                x: [0, -40, 0],
                y: [0, 40, 0]
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-300/15 blur-[100px] rounded-full"
            />
          </div>

          {/* Premium Content */}
          <div className="relative z-10 text-center max-w-6xl px-8">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="mb-8"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-green-100 px-6 py-3 rounded-full text-sm font-medium mb-8"
              >
                <Sparkles className="w-4 h-4" />
                Преміум рослини з 2016 року
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="text-6xl sm:text-8xl font-black text-white leading-[1.1] tracking-tight"
            >
              <span className="bg-gradient-to-r from-emerald-200 via-green-300 to-emerald-200 bg-clip-text text-transparent">
                Природа
              </span>
              <br />
              <span className="text-white">у сучасному</span>
              <br />
              <span className="bg-gradient-to-r from-green-200 to-emerald-300 bg-clip-text text-transparent">
                дизайні
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 text-xl sm:text-2xl text-green-50/90 max-w-4xl mx-auto leading-relaxed font-light tracking-wide"
            >
              Ексклюзивні рослини, професійний догляд та авторські рішення 
              для створення ідеального простору, наповненого життям та гармонією
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link
                href="/plants"
                className="group relative inline-flex items-center gap-4 bg-white text-green-800 font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <Leaf className="w-6 h-6 text-green-700 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-lg">До каталогу</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              <button className="group inline-flex items-center gap-3 bg-transparent border-2 border-white/30 text-white font-semibold py-5 px-8 rounded-2xl backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all duration-500">
                <Play className="w-5 h-5" />
                <span>Відео тур</span>
              </button>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {[
                { value: stats.plants, label: "Видів рослин", suffix: "+" },
                { value: stats.customers, label: "Задоволених клієнтів", suffix: "+" },
                { value: stats.years, label: "Років досвіду", suffix: "" },
                { value: stats.projects, label: "Реалізованих проектів", suffix: "+" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-green-200/80 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Enhanced Progress Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setCurrent(i);
                    setTimeout(() => setIsAnimating(false), 1000);
                  }
                }}
                className={`relative h-2 rounded-full transition-all duration-500 ${
                  current === i ? "w-8 bg-emerald-400" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
              >
                {current === i && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute inset-0 bg-emerald-400 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 right-8 flex items-center gap-2 text-white/60 text-sm font-medium"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-4 h-6 border-2 border-white/30 rounded-full flex justify-center"
            >
              <div className="w-0.5 h-2 bg-white/50 rounded-full mt-1" />
            </motion.div>
            Прокрутіть
          </motion.div>
        </section>

        {/* 🏆 Premium Features Section */}
        <section className="relative py-32 bg-white overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              style={{ y: moveY1 }}
              className="absolute top-[-10rem] left-[-10rem] w-[40rem] h-[40rem] bg-emerald-50 rounded-full blur-[160px]"
            />
            <motion.div
              style={{ y: moveY2 }}
              className="absolute top-1/3 right-[-15rem] w-[45rem] h-[45rem] bg-green-50 rounded-full blur-[180px]"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                Чому обирають{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  нас
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Ми поєднуємо красу природи з інноваційними технологіями, 
                щоб подарувати вам неперевершений досвід
              </p>
            </motion.div>

            {/* Premium Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                {
                  icon: <Award className="w-8 h-8" />,
                  title: "Преміум якість",
                  description: "Всі рослини проходять 5-ступінчастий контроль якості та походять з сертифікованих розплідників",
                  features: ["Сертифіковані розплідники", "Експертний контроль", "Гарантія якості"]
                },
                {
                  icon: <Truck className="w-8 h-8" />,
                  title: "Безпечна доставка",
                  description: "Спеціальна упаковка та швидка доставка гарантують, що рослини прибудуть до вас у ідеальному стані",
                  features: ["Спеціальна упаковка", "Експрес-доставка", "Відстеження"]
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Гарантія приживання",
                  description: "30-денна гарантія на всі рослини. Якщо щось піде не так - ми замінимо без зайвих питань",
                  features: ["30 днів гарантії", "Безкоштовна заміна", "Підтримка 24/7"]
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Персональний консультант",
                  description: "Кожен клієнт отримує персонального фахівця, який супроводжує протягом усього життєвого циклу рослини",
                  features: ["Персональний підбір", "Консультації догляду", "Регулярний супровід"]
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-2xl hover:shadow-3xl p-8 transition-all duration-500 overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>

                    {/* Features List */}
                    <ul className="space-y-3">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🌿 Enhanced Services Section */}
        <section ref={natureRef} className="relative py-32 bg-gradient-to-b from-white to-emerald-50/30 overflow-hidden">
          {/* Parallax Backgrounds */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              style={{ y: moveY1 }}
              className="absolute top-[-10rem] left-[-10rem] w-[40rem] h-[40rem] bg-emerald-200/40 rounded-full blur-[160px]"
            />
            <motion.div
              style={{ y: moveY2 }}
              className="absolute top-1/3 right-[-15rem] w-[45rem] h-[45rem] bg-green-300/25 rounded-full blur-[180px]"
            />
            <motion.div
              style={{ y: moveY3 }}
              className="absolute bottom-[-12rem] left-[10%] w-[35rem] h-[35rem] bg-emerald-100/40 rounded-full blur-[160px]"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 text-center">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                Наші{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  послуги
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Комплексний підхід до створення ідеального зеленого простору
              </p>
            </motion.div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Sprout className="w-12 h-12" />,
                  title: "Продаж рослин",
                  description: "Ексклюзивні рослини з усього світу, підібрані нашими флористами",
                  image: "/images/placeholder.jpg",
                  features: ["Екзотичні види", "Флористичний підбір", "Консультація догляду"],
                  price: "від 299 ₴"
                },
                {
                  icon: <Trees className="w-12 h-12" />,
                  title: "Ландшафтний дизайн",
                  description: "Повний цикл створення гармонійних просторів - від концепції до реалізації",
                  image: "/images/placeholder2.jpg",
                  features: ["3D візуалізація", "Підбір матеріалів", "Авторський нагляд"],
                  price: "від 15 000 ₴"
                },
                {
                  icon: <Sparkles className="w-12 h-12" />,
                  title: "Догляд за рослинами",
                  description: "Професійне обслуговування та супровід ваших зелених композицій",
                  image: "/images/test.jpg",
                  features: ["Регулярний догляд", "Діагностика", "Лечення рослин"],
                  price: "від 999 ₴/міс"
                }
              ].map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: i * 0.15,
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -12,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl overflow-hidden transition-all duration-500"
                >
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2">
                      <span className="text-lg font-bold text-emerald-600">{service.price}</span>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white">
                        {service.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>

                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                      <span className="flex items-center justify-center gap-2">
                        Детальніше
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🌟 Premium CTA Section */}
        <section className="relative py-36 px-6 text-center text-white overflow-hidden bg-gray-900">
          {/* Enhanced Background */}
          <div className="absolute inset-0">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="absolute inset-0 bg-[url('/images/plants-bg.jpg')] bg-cover bg-center bg-fixed"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-gray-900/95" />
            
            {/* Animated particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>

          {/* Animated glow */}
          <motion.div
            animate={{ 
              x: [0, 100, -100, 0],
              y: [0, -50, 50, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 12 }}
            className="absolute top-1/3 left-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen"
          />

          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-200 px-6 py-3 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                Преміум якість з 2016 року
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black mb-8 leading-tight"
            >
              Готові створити{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                ідеальний
              </span>
              <br />
              зелений простір?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Приєднуйтесь до 12,000+ клієнтів, які вже довірили нам створення 
              своєї ідеальної атмосфери. Почніть вашу зелену трансформацію вже сьогодні.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link
                href="/consultation"
                className="group relative inline-flex items-center gap-4 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-lg">Отримати консультацію</span>
              </Link>

              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-3 bg-transparent border-2 border-white/30 text-white font-semibold py-5 px-8 rounded-2xl backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all duration-500"
              >
                <span>Переглянути портфоліо</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Гарантія якості</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Безпечна доставка</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Підтримка 24/7</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}