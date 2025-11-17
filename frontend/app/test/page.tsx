"use client";

import { useState } from "react";
import { motion, LazyMotion, domAnimation, m } from "framer-motion";
import {
  Leaf,
  ShoppingBag,
  Heart,
  ArrowRight,
  Sparkles,
  Home,
  Briefcase,
  Gift,
  CheckCircle2,
  MessageCircle,
  Star,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

// Animated Section Component
function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </m.div>
  );
}

// Stagger Container
function StaggerContainer({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </m.div>
  );
}

// Stagger Item
function StaggerItem({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
    >
      {children}
    </m.div>
  );
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Category {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function HomePage() {
  const features: Feature[] = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Гарантія якості",
      description: "Тільки здорові рослини з перевіреними кореневими системами",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Швидка доставка",
      description: "Доставимо ваші рослини протягом 1-3 днів у будь-яку точку",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Безкоштовні консультації",
      description: "Наші експерти завжди готові допомогти з вибором і доглядом",
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Унікальні рослини",
      description: "Великий вибір рідкісних та екзотичних видів",
    },
  ];

  const categories: Category[] = [
    {
      icon: <Home className="w-6 h-6" />,
      title: "Для дому",
      description:
        "Створіть затишний зелений куточок у вашій оселі з нашими декоративними рослинами",
      image: "🏡",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Для офісу",
      description:
        "Покращіть атмосферу робочого простору рослинами, що очищують повітря",
      image: "🏢",
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Подарунки",
      description:
        "Оригінальні рослинні композиції для особливих моментів та свят",
      image: "🎁",
    },
  ];

  const steps: Step[] = [
    {
      number: "01",
      title: "Оберіть рослини",
      description:
        "Перегляньте наш каталог і додайте улюблені рослини в кошик",
    },
    {
      number: "02",
      title: "Оформіть замовлення",
      description: "Вкажіть адресу доставки та оберіть зручний спосіб оплати",
    },
    {
      number: "03",
      title: "Отримайте рослини",
      description:
        "Ми дбайливо упакуємо та доставимо ваші рослини у найкращому стані",
    },
    {
      number: "04",
      title: "Насолоджуйтесь",
      description:
        "Отримуйте безкоштовні поради з догляду від наших експертів",
    },
  ];

  const benefits: Benefit[] = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Понад 500 задоволених клієнтів",
      description: "Довіра та якість перевірені роками",
    },
    {
      icon: <Leaf className="w-5 h-5" />,
      title: "200+ видів рослин",
      description: "Від класики до рідкісних екземплярів",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "98% задоволеності",
      description: "Наші клієнти повертаються знову і знову",
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <AnimatedSection>
                <div className="flex flex-col gap-6">
                  <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                    Новинки сезону вже доступні
                  </div>

                  <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
                    Створіть свій
                    <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {" "}
                      зелений оазис
                    </span>
                  </h1>

                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Професійний підбір декоративних рослин для вашого дому,
                    офісу чи подарунка. Допоможемо створити ідеальну атмосферу
                    та навчимо правильному догляду.
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-4 text-base font-medium text-white shadow-lg transition hover:shadow-xl hover:scale-105">
                      Обрати рослини
                      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600 bg-white/80 px-8 py-4 text-base font-medium text-emerald-700 backdrop-blur-sm transition hover:bg-emerald-50 dark:border-emerald-500 dark:bg-gray-900/80 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                      Отримати консультацію
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {benefit.icon}
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {benefit.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-400 to-green-400 opacity-20 blur-3xl" />
                  <div className="relative grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800">
                        <div className="mb-4 text-6xl">🌿</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Монстера Делікатесна
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          від 890 грн
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800">
                        <div className="mb-4 text-6xl">🪴</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Фікус Бенджаміна
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          від 650 грн
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 pt-8">
                      <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800">
                        <div className="mb-4 text-6xl">🌱</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Сансевієрія
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          від 450 грн
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800">
                        <div className="mb-4 text-6xl">🍃</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Потос Золотистий
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          від 380 грн
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="border-y border-gray-200 bg-white/60 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/60">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <StaggerContainer>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <StaggerItem key={index}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {feature.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>

        {/* Categories Section */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <AnimatedSection>
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                  Рослини для будь-якого простору
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  Підберіть ідеальні рослини для вашого дому, офісу або як
                  неповторний подарунок
                </p>
              </div>
            </AnimatedSection>

            <StaggerContainer>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => (
                  <StaggerItem key={index}>
                    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900/80">
                      <div className="absolute right-0 top-0 text-8xl opacity-10">
                        {category.image}
                      </div>
                      <div className="relative">
                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                          {category.icon}
                        </div>
                        <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {category.title}
                        </h3>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                          {category.description}
                        </p>
                        <button className="inline-flex items-center gap-2 font-medium text-emerald-600 transition group-hover:gap-3 dark:text-emerald-400">
                          Переглянути колекцію
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <AnimatedSection>
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                  Як це працює
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  Простий процес від вибору до отримання ваших рослин
                </p>
              </div>
            </AnimatedSection>

            <StaggerContainer>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, index) => (
                  <StaggerItem key={index}>
                    <div className="relative">
                      {index < steps.length - 1 && (
                        <div className="absolute left-12 top-16 hidden h-0.5 w-full bg-gradient-to-r from-emerald-300 to-transparent lg:block dark:from-emerald-700" />
                      )}
                      <div className="relative rounded-2xl border border-gray-100 bg-white/80 p-6 dark:border-gray-800 dark:bg-gray-900/80">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-lg font-bold text-white shadow-lg">
                          {step.number}
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <AnimatedSection>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 p-12 shadow-2xl lg:p-20">
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
                  <div className="text-9xl">🌿🪴🌱</div>
                </div>
                <div className="relative mx-auto max-w-3xl text-center">
                  <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                    Готові почати свою зелену подорож?
                  </h2>
                  <p className="mb-8 text-lg text-emerald-50">
                    Отримайте безкоштовну консультацію від наших експертів та
                    підберіть ідеальні рослини для вашого простору
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-medium text-emerald-700 shadow-xl transition hover:scale-105 hover:shadow-2xl">
                      Перейти до каталогу
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white bg-transparent px-8 py-4 text-base font-medium text-white transition hover:bg-white/10">
                      Зв'язатися з нами
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}