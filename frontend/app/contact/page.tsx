"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  ArrowRight,
  Sparkles,
  MessageCircle,
  CheckCircle,
  Shield,
  HeadphonesIcon
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
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '50px' // Trigger 50px before element enters viewport
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

    // Check immediately and after a short delay
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
      // Trigger events that might help Intersection Observer re-check
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        consent: false
      });
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Телефон",
      details: "+38 (067) 123-45-67",
      description: "Пн-Пт: 9:00 - 18:00",
      link: "tel:+380671234567",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      details: "hello@plantshop.ua",
      description: "Відповідаємо протягом 24 годин",
      link: "mailto:hello@plantshop.ua",
      color: "from-emerald-500 to-green-600"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Офіс",
      details: "м. Київ, вул. Зелена 123",
      description: "Пн-Сб: 10:00 - 20:00",
      link: "https://maps.google.com",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Мессенджери",
      details: "Telegram, Viber",
      description: "Онлайн-консультації",
      link: "#",
      color: "from-orange-500 to-red-600"
    }
  ];

  const faqItems = [
    {
      question: "Як довго триває доставка?",
      answer: "Доставка по Києву - 1-2 дні, по Україні - 2-4 дні. Точний термін залежить від наявності рослин та вашого регіону."
    },
    {
      question: "Чи є гарантія на рослини?",
      answer: "Так, ми надаємо 30-денну гарантію на всі рослини. Якщо рослина не приживеться через наш брак, ми замінимо її безкоштовно."
    },
    {
      question: "Чи можна повернути рослину?",
      answer: "Так, протягом 14 днів з моменту покупки ви можете повернути рослину у разі виявлення дефектів."
    },
    {
      question: "Чи надаєте консультації з догляду?",
      answer: "Звісно! Наші фахівці готові надати безкоштовні консультації з догляду за рослинами після покупки."
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
              <span className="text-gray-900 dark:text-white">Давайте</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
                спілкуватися
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Ми завжди раді допомогти вам обрати ідеальні рослини 
              та відповісти на всі ваші запитання
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 📞 Contact Methods */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Зв'яжіться з <span className="text-emerald-600 dark:text-emerald-400">нами</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Оберіть зручний для вас спосіб зв'язку. Ми завжди на зв'язку!
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactMethods.map((method, index) => (
              <AnimatedSection 
                key={index}
                delay={index * 0.1}
                className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700"
              >
                <a href={method.link} className="block">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${method.color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {method.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {method.title}
                  </h3>
                  
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {method.details}
                  </p>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {method.description}
                  </p>

                  <div className="mt-4 flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    <span>Написати</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Надіслати повідомлення
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Заповніть форму і ми зв'яжемося з вами протягом дня
                      </p>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Повідомлення відправлено!
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Дякуємо за ваше звернення. Ми зв'яжемося з вами найближчим часом.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        Надіслати ще одне повідомлення
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ім'я *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                            placeholder="Ваше ім'я"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Телефон
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                            placeholder="+38 (0__) ___ ____"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Тема *
                          </label>
                          <select
                            id="subject"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                          >
                            <option value="">Оберіть тему</option>
                            <option value="consultation">Консультація щодо рослин</option>
                            <option value="order">Питання щодо замовлення</option>
                            <option value="delivery">Доставка та оплата</option>
                            <option value="care">Догляд за рослинами</option>
                            <option value="cooperation">Співпраця</option>
                            <option value="other">Інше</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Повідомлення *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200 resize-none"
                          placeholder="Опишіть ваше питання або повідомлення..."
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="consent"
                          name="consent"
                          required
                          checked={formData.consent}
                          onChange={handleInputChange}
                          className="mt-1 w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <label htmlFor="consent" className="text-sm text-gray-600 dark:text-gray-400">
                          Я погоджуюсь з обробкою моїх персональних даних та Політикою конфіденційності
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.consent}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Відправка...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Відправити повідомлення</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </AnimatedSection>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-8">
              {/* Business Hours */}
              <AnimatedSection delay={0.2}>
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Графік роботи</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Понеділок - П'ятниця</span>
                      <span className="font-semibold">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Субота</span>
                      <span className="font-semibold">10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Неділя</span>
                      <span className="font-semibold">Вихідний</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Support Info */}
              <AnimatedSection delay={0.3}>
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <HeadphonesIcon className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Підтримка</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Наша команда підтримки завжди готова допомогти вам з будь-якими питаннями.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Швидка відповідь</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Експертні консультації</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Безкоштовна допомога</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* FAQ Preview */}
              <AnimatedSection delay={0.4}>
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Часті запитання</h3>
                  </div>
                  <div className="space-y-4">
                    {faqItems.slice(0, 2).map((item, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.question}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mt-4 hover:gap-3 transition-all duration-300"
                  >
                    <span>Всі запитання</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 🗺️ Map Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Наш <span className="text-emerald-600 dark:text-emerald-400">офіс</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Запрошуємо відвідати наш офіс та оранжерею в Києві
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Map Placeholder */}
                <div className="lg:col-span-2 h-96 bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">
                      Інтерактивна карта
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      м. Київ, вул. Зелена 123
                    </p>
                  </div>
                </div>

                {/* Location Details */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Як нас знайти
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Адреса</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          м. Київ, вул. Зелена 123<br />
                          Бізнес-центр "Еко-Хаба"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Графік роботи</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Пн-Пт: 9:00 - 18:00<br />
                          Сб: 10:00 - 16:00<br />
                          Нд: Вихідний
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Телефон</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          +38 (067) 123-45-67<br />
                          +38 (044) 123-45-67
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button className="w-full bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-colors duration-300">
                      Побудувати маршрут
                    </button>
                    <button className="w-full border border-emerald-600 text-emerald-600 dark:text-emerald-400 py-3 px-6 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-300">
                      Зателефонувати
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 🎯 Final CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Готові до співпраці?
            </h2>
            
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Зв'яжіться з нами сьогодні та отримайте безкоштовну консультацію 
              щодо ваших рослин та простору
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="tel:+380671234567"
                className="inline-flex items-center gap-3 bg-white text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-5 h-5" />
                Зателефонувати зараз
              </Link>
              <Link
                href="mailto:hello@plantshop.ua"
                className="inline-flex items-center gap-3 border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white hover:text-emerald-600 transition-all duration-300"
              >
                Написати на email
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Швидка відповідь</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Експертна консультація</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Безкоштовна оцінка</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}