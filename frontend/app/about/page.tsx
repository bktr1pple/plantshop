"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf,
  Users,
  Sprout,
  Award,
  Target,
  Globe,
  Heart,
  Shield,
  Calendar,
  Trees,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const containerStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <motion.div variants={fadeInUp} className="flex flex-col items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg sm:h-16 sm:w-16">
        {icon}
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </motion.div>
  );
}

export default function AboutPage() {
  const stats = [
    {
      icon: <Calendar className="h-6 w-6" />,
      value: "8+",
      label: "Років досвіду",
    },
    {
      icon: <Users className="h-6 w-6" />,
      value: "12 000+",
      label: "Задоволених клієнтів",
    },
    {
      icon: <Sprout className="h-6 w-6" />,
      value: "2 500+",
      label: "Видів рослин",
    },
    {
      icon: <Award className="h-6 w-6" />,
      value: "3 500+",
      label: "Реалізованих проектів",
    },
  ];

  const missionPoints = [
    "Покращуємо якість повітря та мікроклімат у приміщеннях.",
    "Допомагаємо створити спокійний, затишний та гармонійний простір.",
    "Працюємо з повагою до природи та екологічними підходами.",
    "Навчаємо базовому догляду, щоб рослини жили у вас довго.",
  ];

  const values = [
    { icon: "🌱", label: "Сталий розвиток" },
    { icon: "💚", label: "Любов до природи" },
    { icon: "🏆", label: "Якість у деталях" },
    { icon: "🤝", label: "Довіра та партнерство" },
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Гарантія якості",
      description:
        "Кожна рослина проходить відбір, адаптацію та підготовку до нової домівки.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Підбір під ваш простір",
      description:
        "Рекомендуємо рослини з урахуванням освітлення, площі та стилю інтерʼєру.",
    },
    {
      icon: <Trees className="h-6 w-6" />,
      title: "Власні теплиці",
      description:
        "Вирощуємо рослини у контрольованих умовах за сучасними стандартами.",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Підтримка після покупки",
      description:
        "Залишаємося з вами: даємо поради, відповідаємо на питання, допомагаємо з доглядом.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Еко-підхід",
      description:
        "Використовуємо безпечні добрива, субстрати та упаковку з турботою про природу.",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Професійна команда",
      description:
        "Фахівці з ботаніки, дизайну та сервісу працюють разом для крутого результату.",
    },
  ];

  const achievements = [
    "🏆 Учасники профільних виставок та івентів у сфері ландшафтного дизайну.",
    "🌿 Тисячі рослин, які прижилися та радують клієнтів щодня.",
    "💚 Системний підхід до якості, сервісу та довгострокової співпраці.",
    "⭐ Високі оцінки за сервіс та підтримку клієнтів.",
  ];

  return (
    <div className="content-with-navbar min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-white text-gray-900 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 dark:text-gray-100">
      {/* HERO */}
      <Section className="pt-20 pb-12 sm:pt-24 sm:pb-16">
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800"
          >
            <Leaf className="h-4 w-4" />
            Про PlantShop
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl dark:text-white"
          >
            Ми допомагаємо простору{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
              дихати
            </span>{" "}
            разом з вами
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300"
          >
            PlantShop — це команда, що поєднує любов до рослин, дизайн мислення
            та зручний онлайн-сервіс. Ми не просто продаємо рослини — ми
            допомагаємо створити живий, затишний та здоровий простір.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-6 flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Leaf className="h-4 w-4" />
              Переглянути рослини
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-100 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
            >
              Звʼязатися з нами
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </Section>

      {/* STATS */}
      <Section className="pb-12">
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-6 rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 sm:grid-cols-4 sm:p-6"
        >
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </motion.div>
      </Section>

      {/* MISSION & VALUES */}
      <Section className="pb-14">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Місія */}
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4"
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Target className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                Наша місія
              </h2>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300"
            >
              Ми хочемо, щоб більше людей відчули, як живі рослини змінюють
              настрій, повітря та атмосферу. Завдання PlantShop — зробити
              зелений простір доступним і простим у догляді, навіть якщо ви
              ніколи раніше не мали кімнатних рослин.
            </motion.p>

            <motion.ul
              variants={containerStagger}
              className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200"
            >
              {missionPoints.map((point) => (
                <motion.li
                  key={point}
                  variants={fadeInUp}
                  className="flex items-start gap-2"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>{point}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Цінності */}
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/40 sm:p-6"
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                Наші цінності
              </h2>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-100"
            >
              Все, що ми робимо, базується на повазі до природи, людей і
              простору, в якому вони живуть.
            </motion.p>

            <motion.div
              variants={containerStagger}
              className="mt-3 grid grid-cols-2 gap-3 text-sm sm:gap-4"
            >
              {values.map((value) => (
                <motion.div
                  key={value.label}
                  variants={fadeInUp}
                  className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-gray-800 shadow-sm dark:bg-gray-950/60 dark:text-gray-100"
                >
                  <span className="text-lg">{value.icon}</span>
                  <span>{value.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* STORY */}
      <Section className="pb-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-5"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white"
            >
              Як зʼявився PlantShop
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300"
            >
              Все почалося з маленької теплиці та великого бажання — дати людям
              можливість мати красиві, здорові рослини без складних процесів
              пошуку та догляду. З часом до ідеї приєдналася команда
              однодумців — ботаніки, декоратори, ландшафтні дизайнери.
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300"
            >
              Сьогодні PlantShop — це зручний онлайн-сервіс, консультації,
              проєкти озеленення квартир, офісів, кавʼярень та шоурумів, а також
              підтримка клієнтів на кожному етапі.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4 rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:p-6"
          >
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                Те, чим ми пишаємося
              </h3>
            </motion.div>

            <motion.ul
              variants={containerStagger}
              className="mt-2 space-y-3 text-sm text-gray-700 dark:text-gray-200"
            >
              {achievements.map((item) => (
                <motion.li
                  key={item}
                  variants={fadeInUp}
                  className="flex items-start gap-2"
                >
                  <span className="mt-0.5 text-lg">•</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </Section>

      {/* WHY US */}
      <Section className="pb-16">
        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-6 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white"
          >
            Чому клієнти повертаються до нас
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300"
          >
            Ми будуємо сервіс навколо людей: простий вибір, зрозуміла інформація
            про догляд, чесна комунікація та живі, здорові рослини.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
            />
          ))}
        </motion.div>
      </Section>

      {/* CTA */}
      <Section className="pb-20">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-8 text-center text-white shadow-lg sm:px-8"
        >
          <h2 className="text-xl font-semibold sm:text-2xl">
            Готові додати більше зелені у своє життя?
          </h2>
          <p className="mt-2 text-sm text-emerald-50 sm:text-base">
            Оберіть рослини для свого дому чи офісу, а ми допоможемо з
            рекомендаціями та доглядом.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Leaf className="h-4 w-4" />
              Перейти до каталогу
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Потрібна консультація
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-emerald-50/90">
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Підтримка після покупки
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Актуальні рекомендації по догляду
            </span>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
