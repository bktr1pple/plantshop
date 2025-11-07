"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Leaf, Sparkles, Sprout, Trees } from "lucide-react";

export default function HomePage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);

  // 🌿 Hero image carousel
  const images = ["/images/block.jpg", "/images/block.jpg", "/images/block.jpg", "/images/block.jpg"];
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setNext((prev) => (prev + 1) % images.length);
        setFade(false);
      }, 1000);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  // 🌱 Для паралаксу фонів у секціях
  const natureRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: natureRef, offset: ["start end", "end start"] });
  const moveY1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const moveY2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const moveY3 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-gray-900 overflow-hidden">
      <main className="flex-grow">

        {/* 🌿 Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-black">
          {/* ✨ Smooth crossfade images */}
          <motion.div
            key={current}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
            style={{
              backgroundImage: `url(${images[current]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: fade ? 0 : 1,
            }}
          />
          <motion.div
            key={next}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
            style={{
              backgroundImage: `url(${images[next]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: fade ? 1 : 0,
            }}
          />

          {/* М’який блюр */}
          <div className="absolute inset-0 backdrop-blur-[2px]" />

          {/* Градієнтна атмосфера */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-green-900/40 to-transparent" />

          {/* Легка світлова пляма */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-300/20 blur-[140px] rounded-full mix-blend-overlay"
          />

          {/* 📜 Текст */}
          <div className="relative z-10 text-center max-w-5xl px-8">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-xl"
            >
              Відчуйте{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-green-100 bg-clip-text text-transparent">
                природу
              </span>{" "}
              у своєму домі
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-8 text-lg sm:text-2xl text-green-50/85 max-w-4xl mx-auto leading-relaxed tracking-wide"
            >
              Дизайнерські рослини, природне світло, гармонія та спокій.
              Відкрийте новий рівень комфорту й краси у своєму просторі,
              де кожна деталь дихає природою.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-12"
            >
              <Link
                href="/plants"
                className="inline-flex items-center gap-3 bg-white/95 text-green-800 font-semibold py-3.5 px-10 rounded-2xl shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 hover:-translate-y-1"
              >
                <Leaf size={22} className="text-green-700" />
                Переглянути колекцію
              </Link>
            </motion.div>
          </div>

          {/* 🔘 Progress dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  current === i ? "bg-emerald-400 w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>

        {/* 🌿 Combined Nature Section */}
        <section ref={natureRef} className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/60 to-white">
          {/* ✅ Один спільний фон з паралаксом */}
          <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          </motion.div>

{/* ⚡️ Features — Fast, modern e-commerce motion */}
<div className="relative py-28 max-w-7xl mx-auto px-6 text-center overflow-hidden">
  {/* Заголовок */}
  <motion.h2
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
    viewport={{ once: true }}
    className="text-4xl md:text-5xl font-bold text-green-900 mb-16"
  >
    Наше бачення сучасної <span className="text-emerald-600">природи</span>
  </motion.h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
    {[
      {
        icon: <Sprout className="w-10 h-10 text-emerald-600" />,
        title: "Продаж рослин",
        desc: "Авторські рослини, підібрані флористами. Кожна з них — частина екосистеми вашого дому.",
        image: "/images/test.jpg",
      },
      {
        icon: <Trees className="w-10 h-10 text-emerald-600" />,
        title: "Ландшафтний дизайн",
        desc: "Ми створюємо простори, що дихають природою: гармонія між рослинами, формами та світлом.",
        image: "/images/plants-bg.jpg",
      },
      {
        icon: <Sparkles className="w-10 h-10 text-emerald-600" />,
        title: "Догляд за рослинами",
        desc: "Розумні поради, автоматичні нагадування та штучний інтелект для здорових рослин.",
        image: "/images/placeholder2.jpg",
      },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: i * 0.1,
          duration: 0.45,
          ease: [0.33, 1, 0.68, 1],
        }}
        viewport={{ once: true }}
        whileHover={{
          y: -6,
          scale: 1.03,
          transition: { type: "spring", stiffness: 250, damping: 14 },
        }}
        className="relative group bg-white/80 backdrop-blur-xl rounded-3xl border border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
      >
        {/* Background image with fast parallax */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover opacity-0 group-hover:opacity-25 transition-opacity duration-400 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 p-10 flex flex-col items-center text-center">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="bg-emerald-100/70 p-4 rounded-2xl mb-6 shadow-inner"
          >
            {item.icon}
          </motion.div>

          <motion.h3
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-semibold mb-3 text-gray-800"
          >
            {item.title}
          </motion.h3>

          <p className="text-gray-600 leading-relaxed">{item.desc}</p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="h-[2px] w-14 bg-emerald-500/80 mt-4 origin-left rounded-full"
          />
        </div>
      </motion.div>
    ))}
  </div>
</div>



          {/* 🌸 Gallery */}
          <div className="relative py-24 -mt-10 text-center max-w-7xl mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-5xl font-bold text-green-900"
            >
              Натхнення з <span className="text-emerald-600">природи</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-gray-600 max-w-2xl mx-auto mt-4 text-lg leading-relaxed"
            >
              Ідеї та композиції, що розкривають гармонію зелені, світла й сучасного дизайну.
            </motion.p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-16">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl cursor-pointer"
                >
                  <motion.img
                    whileHover={{ scale: 1.08 }}
                    src={`/images/test.jpg`} // /images/gallery${i + 1}.jpg
                    alt={`Inspiration ${i + 1}`}
                    className="w-full h-64 object-cover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-sm uppercase tracking-wider font-medium opacity-80">Inspiration</p>
                    <h4 className="text-lg font-semibold">Зелений баланс</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🌱 Call to Action */}
        <section className="relative py-36 px-6 text-center text-white overflow-hidden bg-neutral-950">
          <div className="absolute inset-0">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="absolute inset-0 bg-[url('/images/plants-bg.jpg')] bg-cover bg-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          </div>

          <motion.div
            animate={{ x: [0, 50, -50, 0], y: [0, 30, -30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 10 }}
            className="absolute top-1/3 left-1/2 w-[600px] h-[600px] bg-green-500/20 blur-[100px] rounded-full mix-blend-screen"
          />

          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-balance"
            >
              Зробімо <span className="text-emerald-300">світ зеленішим</span> разом 🌿
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10"
            >
              Приєднуйтесь до спільноти, що цінує природу, дизайн і баланс.
              Кожна рослина — це маленький крок до великої гармонії.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-3 bg-emerald-400 hover:bg-emerald-300 text-gray-900 font-semibold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300"
              >
                <Sparkles className="w-5 h-5" />
                Приєднатись зараз
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
