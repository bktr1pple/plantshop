"use client";

import React, { useState } from "react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  MessageCircle,
  CheckCircle,
  HeadphonesIcon,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

// Типы
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  details: string;
  description: string;
  link: string;
}

const MotionDiv = m.div;

// Небольшой анимированный контейнер (оптимальный)
function SectionFade({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
}

const CONTACT_METHODS: ContactMethod[] = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Телефон",
    details: "+38 (067) 123-45-67",
    description: "Пн–Пт: 09:00–18:00",
    link: "tel:+380671234567",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email",
    details: "hello@plantshop.ua",
    description: "Відповідаємо протягом 24 годин",
    link: "mailto:hello@plantshop.ua",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Месенджери",
    details: "Telegram / Viber",
    description: "Зручне спілкування у чаті",
    link: "#",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Шоурум",
    details: "м. Київ, вул. Зелена, 123",
    description: "Пн–Сб: 10:00–20:00",
    link: "https://maps.google.com",
  },
];

const STATS = [
  { number: "10K+", label: "постійних клієнтів" },
  { number: "99%", label: "позитивних відгуків" },
  { number: "24/7", label: "підтримка онлайн" },
];

const SUPPORT_POINTS = [
  "Персональні рекомендації по підбору рослин",
  "Допомога з доглядом та пересадкою",
  "Консультації щодо озеленення квартири або офісу",
  "Післяпродажна підтримка та супровід",
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Тут потім підключиш реальну відправку (бекенд / email-сервіс)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        consent: false,
      });
    }, 4000);
  };

  return (
    <LazyMotion features={domAnimation}>
      {/* Обёртка страницы */}
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
        {/* Верхний блок (hero) */}
        <section className="pt-28 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionFade>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-emerald-100/70 dark:border-emerald-900/60 px-4 py-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  PlantShop — турбота про ваш зелений простір
                </span>
              </div>
            </SectionFade>

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] items-start">
              {/* Текстовая часть */}
              <SectionFade delay={0.05} className="space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-500 dark:from-emerald-300 dark:via-emerald-200 dark:to-green-300 bg-clip-text text-transparent">
                    Контакти
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl">
                  Маєте запитання щодо рослин, замовлення або догляду? Напишіть
                  нам — і ми допоможемо підібрати ідеальні рослини саме для
                  вашого простору.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="#contact-form"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-3 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Написати нам
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="tel:+380671234567"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/70 dark:border-emerald-700/70 bg-white/70 dark:bg-slate-900/70 px-5 py-3 text-sm sm:text-base font-medium text-emerald-700 dark:text-emerald-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-200 transition"
                  >
                    <Phone className="w-4 h-4" />
                    Подзвонити зараз
                  </Link>
                </div>
              </SectionFade>

              {/* Карточка с быстрыми контактами */}
              <SectionFade delay={0.1}>
                <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-100/70 dark:border-slate-800 p-6 shadow-md">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                    Швидкі контакти
                  </p>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Телефон
                        </p>
                        <a
                          href="tel:+380671234567"
                          className="font-semibold text-slate-900 dark:text-slate-50"
                        >
                          +38 (067) 123-45-67
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Email
                        </p>
                        <a
                          href="mailto:hello@plantshop.ua"
                          className="font-semibold text-slate-900 dark:text-slate-50 break-all"
                        >
                          hello@plantshop.ua
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Графік роботи
                        </p>
                        <p className="text-slate-800 dark:text-slate-200">
                          Пн–Пт: 09:00–18:00
                          <br />
                          Сб: 10:00–16:00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionFade>
            </div>

            {/* Статистика */}
            <SectionFade delay={0.15} className="mt-10">
              <div className="grid gap-4 sm:grid-cols-3">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-100/70 dark:border-slate-800 px-5 py-4 flex flex-col gap-1 shadow-sm"
                  >
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-300">
                      {stat.number}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </SectionFade>
          </div>
        </section>

        {/* Блок способов связи */}
        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionFade className="mb-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Як з нами звʼязатися
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Оберіть зручний спосіб: телефон, пошта, месенджер або візит до
                шоуруму.
              </p>
            </SectionFade>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {CONTACT_METHODS.map((method) => (
                <SectionFade key={method.title}>
                  <a
                    href={method.link}
                    className="group block rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-100/70 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-400/80 transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 p-2">
                        {method.icon}
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                        {method.title}
                      </h3>
                    </div>
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-100 mb-1">
                      {method.details}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {method.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300 text-xs font-medium group-hover:gap-2 transition-all">
                      Звʼязатися
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </a>
                </SectionFade>
              ))}
            </div>
          </div>
        </section>

        {/* Основной блок: форма + сайдбар */}
        <section id="contact-form" className="py-14 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-start">
            {/* Форма */}
            <SectionFade>
              <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-100/70 dark:border-slate-800 p-6 sm:p-8 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-2xl bg-emerald-500 text-white p-3 shadow-md">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">
                      Напишіть нам
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Залиште свої контакти — ми повернемось з відповіддю протягом
                      робочого дня.
                    </p>
                  </div>
                </div>

                {isSubmitted ? (
                  <MotionDiv
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">
                      Повідомлення надіслано
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      Дякуємо за звернення! Ми звʼяжемося з вами найближчим
                      часом, щоб обговорити всі деталі.
                    </p>
                  </MotionDiv>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5"
                        >
                          Імʼя *
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60 dark:focus:ring-emerald-900/60 outline-none transition"
                          placeholder="Ваше імʼя"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5"
                        >
                          Email *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60 dark:focus:ring-emerald-900/60 outline-none transition"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5"
                        >
                          Телефон
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60 dark:focus:ring-emerald-900/60 outline-none transition"
                          placeholder="+38 (0__) ___ __ __"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5"
                        >
                          Тема *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60 dark:focus:ring-emerald-900/60 outline-none transition"
                        >
                          <option value="">Оберіть тему</option>
                          <option value="consultation">Консультація по рослинах</option>
                          <option value="order">Питання по замовленню</option>
                          <option value="delivery">Доставка та оплата</option>
                          <option value="care">Догляд за рослинами</option>
                          <option value="other">Інше питання</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5"
                      >
                        Повідомлення *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60 dark:focus:ring-emerald-900/60 outline-none transition resize-none"
                        placeholder="Розкажіть коротко, що вас цікавить..."
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        id="consent"
                        name="consent"
                        type="checkbox"
                        required
                        checked={formData.consent}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label
                        htmlFor="consent"
                        className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                      >
                        Я погоджуюсь на обробку моїх персональних даних відповідно
                        до Політики конфіденційності.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.consent}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3.5 text-sm sm:text-base font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <MotionDiv
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                          />
                          Надсилаємо...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Надіслати повідомлення
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </SectionFade>

            {/* Сайдбар */}
            <SectionFade delay={0.05}>
              <div className="space-y-6">
                <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-100/70 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                    <h3 className="font-semibold">Графік роботи</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Пн–Пт</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        09:00–18:00
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Субота</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        10:00–16:00
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Неділя</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        Вихідний
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-100/70 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <HeadphonesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                    <h3 className="font-semibold">Підтримка PlantShop</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Наша команда допоможе розібратися з будь-якими питаннями по
                    рослинах, замовленнях та догляду.
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {SUPPORT_POINTS.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/90 to-green-600/90 text-white p-6 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5" />
                    <h3 className="font-semibold">Гарантія якості</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-50/90 mb-4">
                    Якщо з рослиною щось трапилось у перші 14 днів — ми знайдемо
                    рішення: заміна, консультація або інший варіант.
                  </p>
                  <Link
                    href="tel:+380671234567"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium hover:bg-white/15 transition"
                  >
                    <Zap className="w-4 h-4" />
                    Екстрена консультація по рослинах
                  </Link>
                </div>
              </div>
            </SectionFade>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}