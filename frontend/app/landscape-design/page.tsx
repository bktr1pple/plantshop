"use client";

import { LazyMotion, m, domAnimation, spring } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight,
  Eye,
  Palette,
  ClipboardCheck,
  Trees,
  Home,
  Sparkles,
  CheckCircle,
  Star,
  Clock,
  Users,
  Award,
  Camera,
  Leaf,
  Zap,
  Shield,
  Heart
} from "lucide-react";

// Stagger animations for performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: spring,
      stiffness: 100,
      damping: 15
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: spring,
      stiffness: 100,
      damping: 15
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: spring,
      stiffness: 100,
      damping: 12
    }
  }
};

export default function LandscapeDesignPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const services = useMemo(() => [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "3D Візуалізація",
      description: "Створюємо фотореалістичні 3D моделі вашого майбутнього саду перед початком робіт",
      features: ["Панорамні види", "Віртуальна прогулянка", "Зміна ракурсів", "Реальні текстури"],
      image: "/images/3d-visualization.jpg",
      category: "design"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Підбір матеріалів",
      description: "Підбираємо якісні та довговічні матеріали, що ідеально підходять для вашого клімату",
      features: ["Натуральний камінь", "Якісна деревина", "Сучасні покриття", "Екологічні матеріали"],
      image: "/images/materials-selection.jpg",
      category: "materials"
    },
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Авторський нагляд",
      description: "Контролюємо кожен етап робіт для гарантії якості та відповідності проекту",
      features: ["Регулярні звіти", "Контроль якості", "Технічний супровід", "Координація робіт"],
      image: "/images/supervision.jpg",
      category: "supervision"
    }
  ], []);

  const processSteps = useMemo(() => [
    {
      step: "01",
      title: "Консультація та аналіз",
      description: "Обговорюємо ваші побажання, аналізуємо ділянку та складаємо технічне завдання",
      icon: <Users className="w-6 h-6" />
    },
    {
      step: "02",
      title: "Концепція та ескізи",
      description: "Розробляємо концепцію, створюємо ескізи та затверджуємо з вами основний напрям",
      icon: <Palette className="w-6 h-6" />
    },
    {
      step: "03",
      title: "3D Візуалізація",
      description: "Створюємо детальну 3D модель з можливістю віртуальної прогулянки територією",
      icon: <Eye className="w-6 h-6" />
    },
    {
      step: "04",
      title: "Підбір матеріалів",
      description: "Підбираємо оптимальні матеріали, рослини та обладнання для реалізації проекту",
      icon: <Trees className="w-6 h-6" />
    },
    {
      step: "05",
      title: "Реалізація проекту",
      description: "Виконуємо всі роботи з озеленення та благоустрою під авторським наглядом",
      icon: <ClipboardCheck className="w-6 h-6" />
    },
    {
      step: "06",
      title: "Здавання об'єкта",
      description: "Здаємо готовий об'єкт, надаємо гарантії та консультації з догляду",
      icon: <Award className="w-6 h-6" />
    }
  ], []);

  const portfolioItems = useMemo(() => [
    {
      id: 1,
      title: "Сучасний сад у мінімалізмі",
      category: "modern",
      area: "120 м²",
      duration: "3 тижні",
      location: "Київ",
      image: "/images/portfolio-1.jpg",
      features: ["Зона відпочинку", "Нічне освітлення", "Автополив", "Декоративні рослини"]
    },
    {
      id: 2,
      title: "Класичний англійський сад",
      category: "classic",
      area: "250 м²",
      duration: "6 тижнів",
      location: "Львів",
      image: "/images/portfolio-2.jpg",
      features: ["Фонтани", "Живі огорожі", "Квіткові композиції", "Альтанка"]
    },
    {
      id: 3,
      title: "Японський сад кам'яних ліхтарів",
      category: "japanese",
      area: "80 м²",
      duration: "4 тижні",
      location: "Одеса",
      image: "/images/portfolio-3.jpg",
      features: ["Японські клени", "Водойми", "Кам'яні стежки", "Церемонійний чайний дім"]
    },
    {
      id: 4,
      title: "Сімейний сад з дитячою зоною",
      category: "family",
      area: "180 м²",
      duration: "5 тижнів",
      location: "Харків",
      image: "/images/portfolio-4.jpg",
      features: ["Дитячий майданчик", "Зона барбекю", "Газон для ігор", "Безпечні рослини"]
    },
    {
      id: 5,
      title: "Міський сад на даху",
      category: "urban",
      area: "60 м²",
      duration: "2 тижні",
      location: "Дніпро",
      image: "/images/portfolio-5.jpg",
      features: ["Контейнерне садівництво", "Мобільні меблі", "Кашпо", "Нічне освітлення"]
    },
    {
      id: 6,
      title: "Середземноморський дворик",
      category: "mediterranean",
      area: "150 м²",
      duration: "4 тижні",
      location: "Запоріжжя",
      image: "/images/portfolio-6.jpg",
      features: ["Оливкові дерева", "Теракота", "Водоспад", "Арочні конструкції"]
    }
  ], []);

  const benefits = useMemo(() => [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Швидка реалізація",
      description: "Від концепції до готового результату за 2-8 тижнів"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Гарантія якості",
      description: "Гарантія на всі роботи та рослини до 3 років"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Індивідуальний підхід",
      description: "Кожен проект унікальний та створюється з урахуванням ваших побажань"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Професійна команда",
      description: "Досвідчені дизайнери, архітектори та дендрологи"
    }
  ], []);

  const filteredPortfolio = useMemo(() => 
    activeCategory === "all" 
      ? portfolioItems 
      : portfolioItems.filter(item => item.category === activeCategory),
    [portfolioItems, activeCategory]
  );

  const categories = useMemo(() => [
    { id: "all", label: "Всі проекти" },
    { id: "modern", label: "Сучасні" },
    { id: "classic", label: "Класичні" },
    { id: "japanese", label: "Японські" },
    { id: "family", label: "Сімейні" },
    { id: "urban", label: "Міські" },
    { id: "mediterranean", label: "Середземноморські" }
  ], []);

  // Optimized placeholder image component
  const PlaceholderImage = ({ className = "h-64", text = "Зображення проекту" }: { className?: string; text?: string }) => (
    <div className={`${className} bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-xl">🌿</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );

  return (
    <LazyMotion features={domAnimation}>
      <div className="content-with-navbar flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* 🌿 Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 right-20 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
            <m.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <m.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
              >
                <span className="text-gray-900 dark:text-white">Ландшафтний</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
                  дизайн
                </span>
              </m.h1>

              <m.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
              >
                Повний цикл створення гармонійних просторів — від концепції до реалізації
              </m.p>

              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              >
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-5 px-10 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
                >
                  <Sparkles className="w-6 h-6" />
                  Замовити проект
                </Link>
                <a
                  href="#portfolio"
                  className="inline-flex items-center gap-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-5 px-10 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 text-lg"
                >
                  <Camera className="w-6 h-6" />
                  Переглянути портфоліо
                </a>
              </m.div>
            </m.div>
          </div>
        </section>

        {/* 🎯 Services Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-6">
            <m.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-16"
              style={{ willChange: 'transform, opacity' }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Наші <span className="text-emerald-600 dark:text-emerald-400">послуги</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Комплексний підхід до створення ідеального простору
              </p>
            </m.div>

            <m.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              style={{ willChange: 'transform, opacity' }}
            >
              {services.map((service, index) => (
                <m.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="relative overflow-hidden">
                    <PlaceholderImage className="h-48" text={service.title} />
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg flex items-center justify-center text-white">
                        {service.icon}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* 📈 Process Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto px-6">
            <m.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-16"
              style={{ willChange: 'transform, opacity' }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Процес <span className="text-emerald-600 dark:text-emerald-400">роботи</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                6 кроків до ідеального ландшафтного дизайну
              </p>
            </m.div>

            <m.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              style={{ willChange: 'transform, opacity' }}
            >
              {processSteps.map((step, index) => (
                <m.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {step.step}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-emerald-600 dark:text-emerald-400">
                          {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* 🏆 Benefits Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-6">
            <m.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-16"
              style={{ willChange: 'transform, opacity' }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Чому обирають <span className="text-emerald-600 dark:text-emerald-400">нас</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Ми створюємо не просто красиві сади, а простори для життя
              </p>
            </m.div>

            <m.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              style={{ willChange: 'transform, opacity' }}
            >
              {benefits.map((benefit, index) => (
                <m.div
                  key={index}
                  variants={itemVariants}
                  className="text-center group"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {benefit.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* 🖼️ Portfolio Section */}
        <section id="portfolio" className="py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto px-6">
            <m.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-12"
              style={{ willChange: 'transform, opacity' }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Наше <span className="text-emerald-600 dark:text-emerald-400">портфоліо</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Реалізовані проекти, якими ми пишаємося
              </p>
            </m.div>

            {/* Portfolio Filters */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-wrap justify-center gap-3 mb-12"
              style={{ willChange: 'transform, opacity' }}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </m.div>

            {/* Portfolio Grid */}
            <m.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              style={{ willChange: 'transform, opacity' }}
            >
              {filteredPortfolio.map((project, index) => (
                <m.div
                  key={project.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="relative overflow-hidden">
                    <PlaceholderImage className="h-48" text={project.title} />
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-medium">
                        {project.area}
                      </span>
                      <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                        {project.duration}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{project.location}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {project.title}
                    </h3>

                    <div className="space-y-2 mb-6">
                      {project.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                      Детальніше про проект
                    </button>
                  </div>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* 🎯 Final CTA */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="space-y-8"
              style={{ willChange: 'transform, opacity' }}
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                Готові створити сад вашої мрії?
              </h2>
              
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Зв'яжіться з нами для безкоштовної консультації та розробки індивідуального проекту
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-3 bg-white text-emerald-600 font-bold py-5 px-12 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
                >
                  <Sparkles className="w-6 h-6" />
                  Замовити консультацію
                </Link>
                <Link
                  href="/contacts"
                  className="inline-flex items-center gap-3 border-2 border-white text-white font-semibold py-5 px-12 rounded-2xl hover:bg-white hover:text-emerald-600 transition-all duration-300 text-lg"
                >
                  Наші контакти
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80 pt-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Термін реалізації: 2-8 тижнів</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Гарантія на роботи: 3 роки</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Понад 150 успішних проектів</span>
                </div>
              </div>
            </m.div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}