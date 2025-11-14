"use client";

import React from "react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  ArrowRight,
  MessageCircle,
  CheckCircle,
  Shield,
  HeadphonesIcon,
  Leaf,
  Sparkles,
  Users,
  Target,
  Star,
  Zap,
  Cloud,
  Bot
} from "lucide-react";

// Типы для TypeScript
interface SectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  details: string;
  description: string;
  link: string;
  gradient: string;
  bgGradient: string;
}

// Оптимизированные motion компоненты
const MotionDiv = m.div;

// Modern Background с профессиональным дизайном
function ModernBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Основной градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/10" />
      
      {/* Сложные геометрические паттерны */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-500/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-green-500/5 to-transparent" />
      
      {/* Абстрактные формы */}
      <div className="absolute top-20 right-10% w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-40 left-5% w-96 h-96 bg-green-400/8 rounded-full blur-3xl animate-pulse-medium" />
      <div className="absolute top-60 left-30% w-64 h-64 bg-teal-400/6 rounded-full blur-3xl animate-pulse-fast" />
      
      {/* Линии и сетки */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(5, 150, 105, 0.1) 0%, transparent 50%),
              linear-gradient(45deg, transparent 48%, rgba(16, 185, 129, 0.03) 50%, transparent 52%)
            `,
            backgroundSize: '100% 100%, 100% 100%, 60px 60px'
          }}
        />
      </div>
    </div>
  );
}

// Modern Animated Section
function ModernSection({ children, delay = 0, className = "" }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <MotionDiv
      ref={ref}
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.8,
        delay: isVisible ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
}

// Modern Card Component
function ModernCard({ children, delay = 0, className = "" }: SectionProps) {
  return (
    <ModernSection delay={delay} className={className}>
      <MotionDiv
        whileHover={{ 
          y: -8,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        className="group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Акцентная полоска */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600" />
          {children}
        </div>
      </MotionDiv>
    </ModernSection>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: "", consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const pathname = usePathname();

  const contactMethods = useMemo<ContactMethod[]>(() => [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Телефон",
      details: "+38 (067) 123-45-67",
      description: "Пн-Пт: 9:00 - 18:00",
      link: "tel:+380671234567",
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/10"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      details: "hello@plantshop.ua",
      description: "Відповідаємо протягом 24 годин",
      link: "mailto:hello@plantshop.ua",
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/10 to-green-600/10"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Офіс",
      details: "м. Київ, вул. Зелена 123",
      description: "Пн-Сб: 10:00 - 20:00",
      link: "https://maps.google.com",
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-600/10"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Чат",
      details: "Telegram, Viber",
      description: "Миттєві відповіді",
      link: "#",
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-500/10 to-red-600/10"
    }
  ], []);

  const features = useMemo(() => [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Миттєва відповідь",
      description: "Середній час відповіді - 15 хвилин"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Команда експертів",
      description: "30+ професійних консультантів"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Гарантія якості",
      description: "30 днів гарантії на всі рослини"
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: "Цілодобова підтримка",
      description: "Завжди на зв'язку"
    }
  ], []);

  const stats = useMemo(() => [
    { number: "10K+", label: "Задоволених клієнтів", suffix: "" },
    { number: "99", label: "Позитивних відгуків", suffix: "%" },
    { number: "24/7", label: "Підтримка", suffix: "" },
    { number: "15", label: "Хвилин середній час відповіді", suffix: "хв" }
  ], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('scroll'));
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "", consent: false });
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
        
        {/* 🌟 СОВРЕМЕННЫЙ ФОН */}
        <ModernBackground />
        
        {/* 🎯 Hero Section - Полностью переработанная */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 via-transparent to-green-500/2" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ModernSection delay={0.1}>
              <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm mb-8">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Premium Plant Consultations
                </span>
              </div>
            </ModernSection>

            <ModernSection delay={0.2}>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-emerald-800 to-green-900 dark:from-white dark:via-emerald-200 dark:to-green-300 bg-clip-text text-transparent">
                  Contact Us
                </span>
              </h1>
            </ModernSection>

            <ModernSection delay={0.3}>
              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
                Let's create your perfect green space together. Our expert team is ready to provide 
                personalized consultations and professional advice for your plant needs.
              </p>
            </ModernSection>

            <ModernSection delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#contact"
                    className="group bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 backdrop-blur-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Start Conversation</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MotionDiv>
                <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="tel:+380671234567"
                    className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-4 px-8 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 flex items-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Now</span>
                  </Link>
                </MotionDiv>
              </div>
            </ModernSection>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <MotionDiv
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-6 h-10 border-2 border-slate-400 dark:border-slate-600 rounded-full flex justify-center backdrop-blur-sm">
                <div className="w-1 h-3 bg-slate-400 dark:bg-slate-600 rounded-full mt-2" />
              </div>
            </MotionDiv>
          </div>
        </section>

        {/* 📊 Stats Section - Минималистичная */}
        <section className="relative py-20 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <ModernSection key={index} delay={index * 0.1} className="text-center">
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/40 dark:border-slate-700/40">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {stat.number}<span className="text-emerald-600">{stat.suffix}</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </ModernSection>
              ))}
            </div>
          </div>
        </section>

        {/* ✨ Features Section */}
        <section className="relative py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ModernSection className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Why Choose <span className="text-emerald-600">PlantShop</span>?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                We combine expertise with exceptional customer service to deliver the best plant care experience
              </p>
            </ModernSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <ModernCard key={index} delay={index * 0.1} className="text-center">
                  <div className="p-8">
                    <MotionDiv
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white"
                    >
                      {feature.icon}
                    </MotionDiv>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </ModernCard>
              ))}
            </div>
          </div>
        </section>

        {/* 📞 Contact Methods - Premium дизайн */}
        <section id="contact" className="relative py-24 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ModernSection className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Get in <span className="text-emerald-600">Touch</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Choose your preferred method of communication. We're here to help you create the perfect green environment.
              </p>
            </ModernSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {contactMethods.map((method, index) => (
                <ModernCard key={index} delay={index * 0.1}>
                  <a href={method.link} className="block p-8 group">
                    <MotionDiv
                      whileHover={{ scale: 1.15, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-14 h-14 bg-gradient-to-r ${method.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    >
                      {method.icon}
                    </MotionDiv>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {method.title}
                    </h3>
                    
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {method.details}
                    </p>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      {method.description}
                    </p>

                    <MotionDiv
                      whileHover={{ x: 5 }}
                      className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium text-sm"
                    >
                      <span>Contact Now</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </MotionDiv>
                  </a>
                </ModernCard>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <ModernCard>
                  <div className="p-10">
                    <div className="flex items-center gap-4 mb-10">
                      <MotionDiv
                        whileHover={{ rotate: 15 }}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg"
                      >
                        <Send className="w-7 h-7 text-white" />
                      </MotionDiv>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          Send Us a Message
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Fill out the form below and we'll get back to you within hours
                        </p>
                      </div>
                    </div>

                    {isSubmitted ? (
                      <MotionDiv
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <MotionDiv
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.6 }}
                          className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                          <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </MotionDiv>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                          Message Sent Successfully!
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                          Thank you for reaching out. Our team will contact you shortly to discuss your plant needs.
                        </p>
                        <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <button
                            onClick={() => setIsSubmitted(false)}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-300"
                          >
                            Send Another Message
                          </button>
                        </MotionDiv>
                      </MotionDiv>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              Full Name *
                            </label>
                            <MotionDiv whileFocus={{ scale: 1.02 }}>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                                placeholder="Enter your full name"
                              />
                            </MotionDiv>
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              Email Address *
                            </label>
                            <MotionDiv whileFocus={{ scale: 1.02 }}>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                                placeholder="your@email.com"
                              />
                            </MotionDiv>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              Phone Number
                            </label>
                            <MotionDiv whileFocus={{ scale: 1.02 }}>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                                placeholder="+38 (0__) ___ ____"
                              />
                            </MotionDiv>
                          </div>
                          <div>
                            <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              Subject *
                            </label>
                            <MotionDiv whileFocus={{ scale: 1.02 }}>
                              <select
                                id="subject"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                              >
                                <option value="">Select a subject</option>
                                <option value="consultation">Plant Consultation</option>
                                <option value="order">Order Inquiry</option>
                                <option value="delivery">Delivery & Shipping</option>
                                <option value="care">Plant Care Advice</option>
                                <option value="partnership">Partnership</option>
                                <option value="other">Other</option>
                              </select>
                            </MotionDiv>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Your Message *
                          </label>
                          <MotionDiv whileFocus={{ scale: 1.01 }}>
                            <textarea
                              id="message"
                              name="message"
                              required
                              rows={6}
                              value={formData.message}
                              onChange={handleInputChange}
                              className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200 resize-none"
                              placeholder="Tell us about your plant needs, questions, or how we can help you create your perfect green space..."
                            />
                          </MotionDiv>
                        </div>

                        <div className="flex items-start gap-4">
                          <MotionDiv whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <input
                              type="checkbox"
                              id="consent"
                              name="consent"
                              required
                              checked={formData.consent}
                              onChange={handleInputChange}
                              className="mt-1 w-5 h-5 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                            />
                          </MotionDiv>
                          <label htmlFor="consent" className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            I agree to the processing of my personal data and accept the Privacy Policy. 
                            I understand that my information will be used solely for the purpose of providing consultation services.
                          </label>
                        </div>

                        <MotionDiv whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <button
                            type="submit"
                            disabled={isSubmitting || !formData.consent}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-5 px-8 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                          >
                            {isSubmitting ? (
                              <>
                                <MotionDiv
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                                />
                                <span>Sending Message...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                <span>Send Message</span>
                              </>
                            )}
                          </button>
                        </MotionDiv>
                      </form>
                    )}
                  </div>
                </ModernCard>
              </div>

              {/* Sidebar Information */}
              <div className="space-y-8">
                {/* Business Hours */}
                <ModernCard delay={0.2}>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Clock className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Business Hours</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Monday - Friday</span>
                        <span className="font-semibold text-slate-900 dark:text-white">9:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Saturday</span>
                        <span className="font-semibold text-slate-900 dark:text-white">10:00 - 16:00</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-slate-600 dark:text-slate-400">Sunday</span>
                        <span className="font-semibold text-slate-900 dark:text-white">Closed</span>
                      </div>
                    </div>
                  </div>
                </ModernCard>

                {/* Support Info */}
                <ModernCard delay={0.3}>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <HeadphonesIcon className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Premium Support</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      Our dedicated support team is committed to providing exceptional service and expert guidance for all your plant care needs.
                    </p>
                    <div className="space-y-3">
                      {["Expert Plant Consultants", "Fast Response Times", "Personalized Solutions", "Follow-up Care"].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ModernCard>

                {/* Emergency Contact */}
                <ModernCard delay={0.4}>
                  <div className="p-8 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-6 h-6 text-orange-600" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Urgent Plant Care?</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                      For immediate assistance with plant emergencies or urgent consultations.
                    </p>
                    <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="tel:+380671234567"
                        className="w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Emergency Hotline
                      </Link>
                    </MotionDiv>
                  </div>
                </ModernCard>
              </div>
            </div>
          </div>
        </section>

        {/* 🎯 Final CTA - Premium */}
        <section className="relative py-24 bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 text-white overflow-hidden">
          {/* Декоративные элементы */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-emerald-400 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ModernSection className="space-y-8">
              <MotionDiv
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <Leaf className="w-16 h-16 mx-auto text-emerald-400" />
              </MotionDiv>
              
              <h2 className="text-4xl sm:text-5xl font-bold">
                Ready to Transform Your Space?
              </h2>
              
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of satisfied customers who have created their dream green environments with our expert guidance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="tel:+380671234567"
                    className="bg-white text-slate-900 font-bold py-4 px-8 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Expert Now</span>
                  </Link>
                </MotionDiv>
                <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#contact"
                    className="border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white hover:text-slate-900 transition-all duration-300 flex items-center gap-3"
                  >
                    <span>Get Free Consultation</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </MotionDiv>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-400 pt-8">
                {["No Commitment", "Free Assessment", "Expert Advice", "Satisfaction Guaranteed"].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </ModernSection>
          </div>
        </section>
      </div>

      {/* Global styles for анимаций */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.02); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-pulse-medium { animation: pulse-medium 6s ease-in-out infinite; }
        .animate-pulse-fast { animation: pulse-fast 4s ease-in-out infinite; }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-slow,
          .animate-pulse-medium,
          .animate-pulse-fast {
            animation: none;
          }
        }
      `}</style>
    </LazyMotion>
  );
}