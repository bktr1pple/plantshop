"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Leaf,
  Mail,
  Facebook,
  Instagram,
  Send,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setIsSubscribed(false);
      }, 3000);
    }
  };

  const footerLinks = {
    company: [
      { name: "Про нас", href: "/about" },
      { name: "Наша історія", href: "/about#history" },
      { name: "Команда", href: "/about#team" },
      { name: "Вакансії", href: "/careers" },
      { name: "Блог", href: "/blog" },
    ],
    catalog: [
      { name: "Усі рослини", href: "/plants" },
      { name: "Кімнатні рослини", href: "/plants?category=indoor" },
      { name: "Рідкісні види", href: "/plants?category=rare" },
      { name: "Новинки", href: "/plants?new=true" },
      { name: "Розпродаж", href: "/plants?sale=true" },
    ],
    services: [
      { name: "Консультація", href: "/consultation" },
      { name: "Догляд за рослинами", href: "/care" },
      { name: "Озеленення офісів", href: "/services/office" },
      { name: "Ландшафтний дизайн", href: "/services/landscape" },
      { name: "Підписка на догляд", href: "/services/subscription" },
    ],
    help: [
      { name: "Контакти", href: "/contact" },
      { name: "Доставка і оплата", href: "/delivery" },
      { name: "Повернення товару", href: "/returns" },
      { name: "FAQ", href: "/faq" },
      { name: "Підтримка", href: "/support" },
    ],
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20 border-t border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
      {/* Декоративні елементи */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Основна секція */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Про компанію + підписка */}
            <div className="lg:col-span-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-4 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110">
                  <Leaf className="w-5 h-5" />
                </div>
                PlantShop
              </Link>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Створюємо зелені простори, які надихають. Преміальні рослини,
                професійний догляд та індивідуальний підхід до кожного клієнта.
              </p>

              {/* Підписка на розсилку */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Підпишіться на новини
                </h4>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    placeholder="Ваш email"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    disabled={isSubscribed}
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribed}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50"
                  >
                    {isSubscribed ? (
                      <span className="text-xs">✓</span>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {isSubscribed && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Дякуємо за підписку!
                  </p>
                )}
              </div>

              {/* Соцмережі */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="mailto:info@plantshop.com"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Посилання */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {/* Компанія */}
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Компанія
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                        >
                          {link.name}
                          <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Каталог */}
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Каталог
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.catalog.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                        >
                          {link.name}
                          <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Послуги */}
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Послуги
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.services.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                        >
                          {link.name}
                          <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Допомога */}
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Допомога
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.help.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                        >
                          {link.name}
                          <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Кнопка контактів */}
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 w-full sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Зв&apos;язатися з нами</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="mt-3 text-xs text-center sm:text-left text-gray-500 dark:text-gray-500">
                  Телефон, email, адреса та робочий графік
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Нижня частина */}
        <div className="border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                © {new Date().getFullYear()} PlantShop. Всі права захищені.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                <Link
                  href="/privacy"
                  className="text-gray-500 transition-colors hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400"
                >
                  Політика конфіденційності
                </Link>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <Link
                  href="/terms"
                  className="text-gray-500 transition-colors hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400"
                >
                  Умови використання
                </Link>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <Link
                  href="/cookies"
                  className="text-gray-500 transition-colors hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
