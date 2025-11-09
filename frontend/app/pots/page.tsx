"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import Link from "next/link";
import { 
  Sparkles,
  Filter,
  Search,
  ShoppingBag,
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Truck,
  Shield,
  Recycle,
  Palette,
  Ruler,
  Droplets,
  Leaf,
  Zap,
  Award,
  Clock,
  ChevronDown
} from "lucide-react";

export default function PotsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  interface Pot {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    size: string;
    color: string;
    material: string;
    drainage: boolean;
    rating: number;
    reviews: number;
    image: string;
    featured: boolean;
    description: string;
    features: string[];
  }

  const [selectedPot, setSelectedPot] = useState<Pot | null>(null);
  const [quantity, setQuantity] = useState(1);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const filters = [
    { id: "all", label: "Всі горщики" },
    { id: "ceramic", label: "Керамічні" },
    { id: "clay", label: "Глиняні" },
    { id: "plastic", label: "Пластикові" },
    { id: "concrete", label: "Бетонні" },
    { id: "wooden", label: "Дерев'яні" },
    { id: "hanging", label: "Підвісні" },
    { id: "self-watering", label: "З автополивом" }
  ];

  const sizes = ["S", "M", "L", "XL"];

  const pots = [
    {
      id: 1,
      name: "Керамічний горщик 'Мінімалізм'",
      category: "ceramic",
      price: 450,
      originalPrice: 600,
      size: "M",
      color: "Білий",
      material: "Кераміка",
      drainage: true,
      rating: 4.8,
      reviews: 124,
      image: "/images/pot-1.jpg",
      featured: true,
      description: "Елегантний керамічний горщик з дренажним отвором, ідеально підходить для сукулентів та кактусів.",
      features: ["Дренажний отвір", "Екологічний матеріал", "Легкий догляд"]
    },
    {
      id: 2,
      name: "Глиняний горщик 'Терракота'",
      category: "clay",
      price: 320,
      originalPrice: 400,
      size: "L",
      color: "Теракота",
      material: "Глина",
      drainage: true,
      rating: 4.9,
      reviews: 89,
      image: "/images/pot-2.jpg",
      featured: true,
      description: "Класичний глиняний горщик, що сприяє здоровому росту коренів завдяки природній циркуляції повітря.",
      features: ["Природна вентиляція", "Стійкий матеріал", "Покращує дренаж"]
    },
    {
      id: 3,
      name: "Горщик з автополивом 'Смарт'",
      category: "self-watering",
      price: 890,
      originalPrice: 1200,
      size: "M",
      color: "Сірий",
      material: "Пластик",
      drainage: true,
      rating: 4.7,
      reviews: 203,
      image: "/images/pot-3.jpg",
      featured: true,
      description: "Інтелектуальна система автополиву дозволяє рослинам отримувати оптимальну кількість води протягом 2 тижнів.",
      features: ["Система автополиву", "Індикатор рівня води", "Економія часу"]
    },
    {
      id: 4,
      name: "Бетонний горщик 'Індустріал'",
      category: "concrete",
      price: 670,
      originalPrice: 850,
      size: "L",
      color: "Бетон",
      material: "Бетон",
      drainage: true,
      rating: 4.6,
      reviews: 67,
      image: "/images/pot-4.jpg",
      description: "Міцний бетонний горщик у індустріальному стилі, ідеальний для великих рослин.",
      features: ["Висока міцність", "Сучасний дизайн", "Стійкість до погодних умов"]
    },
    {
      id: 5,
      name: "Підвісний горщик 'Макраме'",
      category: "hanging",
      price: 550,
      originalPrice: 700,
      size: "S",
      color: "Кремовий",
      material: "Кераміка",
      drainage: true,
      rating: 4.8,
      reviews: 156,
      image: "/images/pot-5.jpg",
      description: "Елегантний підвісний горщик з керамічною основою та макраме підвіскою.",
      features: ["Комплект макраме", "Легка установка", "Економія простору"]
    },
    {
      id: 6,
      name: "Дерев'яний кашпо 'Натура'",
      category: "wooden",
      price: 780,
      originalPrice: 950,
      size: "M",
      color: "Дерево",
      material: "Бамбук",
      drainage: true,
      rating: 4.5,
      reviews: 92,
      image: "/images/pot-6.jpg",
      description: "Екологічне бамбукове кашпо з унікальною текстурою дерева.",
      features: ["Екологічний матеріал", "Унікальна текстура", "Легкий"]
    },
    {
      id: 7,
      name: "Керамічний набір 'Міні'",
      category: "ceramic",
      price: 1200,
      originalPrice: 1500,
      size: "S",
      color: "Пастель",
      material: "Кераміка",
      drainage: true,
      rating: 4.9,
      reviews: 178,
      image: "/images/pot-7.jpg",
      description: "Набір з 3 міні-горщиків різних кольорів для створення композицій.",
      features: ["Набір 3 горщики", "Різноманітні кольори", "Ідеально для сукулентів"]
    },
    {
      id: 8,
      name: "Горщик 'Геометрія'",
      category: "concrete",
      price: 520,
      originalPrice: 650,
      size: "M",
      color: "Чорний",
      material: "Бетон",
      drainage: true,
      rating: 4.7,
      reviews: 114,
      image: "/images/pot-8.jpg",
      description: "Сучасний бетонний горщик з геометричним дизайном для інтер'єру в стилі мінімалізм.",
      features: ["Геометричний дизайн", "Універсальний колір", "Стійка основа"]
    }
  ];

  const benefits = [
    {
      icon: <Recycle className="w-8 h-8" />,
      title: "Екологічні матеріали",
      description: "Всі наші горщики виготовлені з безпечних та екологічних матеріалів"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Унікальний дизайн",
      description: "Ексклюзивні дизайни, розроблені нашими художниками"
    },
    {
      icon: <Ruler className="w-8 h-8" />,
      title: "Різноманітні розміри",
      description: "Широкий вибір розмірів для будь-яких типів рослин"
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Оптимальний дренаж",
      description: "Спеціальні дренажні системи для здорового росту рослин"
    }
  ];

  const filteredPots = pots.filter(pot => 
    activeFilter === "all" || pot.category === activeFilter
  );

  const featuredPots = pots.filter(pot => pot.featured);

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
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            <span className="text-gray-900 dark:text-white">Ідеальний</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
              дім
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">для ваших рослин</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed"
          >
            Виберіть унікальні горщики та кашпо, що підкреслять красу ваших рослин 
            та створять гармонію в інтер'єрі
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#products"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              Переглянути колекцію
            </a>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 px-8 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
            >
              Підбір горщика
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 🏆 Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Чому обирають наші <span className="text-emerald-600 dark:text-emerald-400">горщики</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ми дбаємо про якість, дизайн та здоров'я ваших рослин
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 Featured Products */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Популярні <span className="text-emerald-600 dark:text-emerald-400">горщики</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Найбільш затребувані моделі серед наших клієнтів
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredPots.map((pot, index) => (
              <motion.div
                key={pot.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105"
              >
                <div className="relative overflow-hidden">
                  <div className="h-64 bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🏺</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Зображення горщика</p>
                    </div>
                  </div>
                  
                  {pot.originalPrice && (
                    <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{Math.round((1 - pot.price / pot.originalPrice) * 100)}%
                    </div>
                  )}
                  
                  <button className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                      {pot.material}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      {pot.size}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {pot.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {pot.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900 dark:text-white">{pot.rating}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">({pot.reviews})</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {pot.originalPrice && (
                        <span className="text-gray-400 dark:text-gray-500 line-through text-sm">
                          {pot.originalPrice}₴
                        </span>
                      )}
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {pot.price}₴
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedPot(pot as Pot)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Додати в кошик
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛍️ All Products */}
      <section id="products" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:w-80 flex-shrink-0"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Filter className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Фільтри</h3>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Категорія</h4>
                  <div className="space-y-2">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                          activeFilter === filter.id
                            ? "bg-emerald-500 text-white"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Розмір</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Особливості</h4>
                  <div className="space-y-2">
                    {[
                      { label: "З дренажем", checked: true },
                      { label: "З піддоном", checked: false },
                      { label: "Підвісні", checked: false },
                      { label: "Набір", checked: false }
                    ].map((feature, index) => (
                      <label key={index} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={feature.checked}
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-gray-600 dark:text-gray-400">{feature.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort and Search */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Всі горщики
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filteredPots.length} товарів
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Пошук горщиків..."
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200"
                  >
                    <option value="popular">За популярністю</option>
                    <option value="price-low">Від дешевших</option>
                    <option value="price-high">Від дорожчих</option>
                    <option value="rating">За рейтингом</option>
                    <option value="new">Новинки</option>
                  </select>
                </div>
              </motion.div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPots.map((pot, index) => (
                  <motion.div
                    key={pot.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="relative overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl">🏺</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Зображення горщика</p>
                        </div>
                      </div>
                      
                      {pot.originalPrice && (
                        <div className="absolute top-3 left-3 bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{Math.round((1 - pot.price / pot.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                          {pot.material}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          {pot.size}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {pot.name}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{pot.rating}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">({pot.reviews})</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {pot.originalPrice && (
                            <span className="text-gray-400 dark:text-gray-500 line-through text-sm">
                              {pot.originalPrice}₴
                            </span>
                          )}
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {pot.price}₴
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedPot(pot as Pot)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-2 rounded-xl hover:shadow-lg transition-all duration-300 text-sm"
                        >
                          В кошик
                        </button>
                        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 Final CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Знайшли ідеальний горщик?
            </h2>
            
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Створіть неповторну композицію з нашими горщиками та живими рослинами
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/plants"
                className="inline-flex items-center gap-3 bg-white text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Leaf className="w-5 h-5" />
                Обрати рослини
              </Link>
              <Link
                href="/consultation"
                className="inline-flex items-center gap-3 border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white hover:text-emerald-600 transition-all duration-300"
              >
                Консультація дизайнера
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Безкоштовна доставка від 1000₴</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Гарантія якості</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Швидке замовлення</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedPot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4"
          onClick={() => setSelectedPot(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Product Image */}
              <div className="bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-6xl">🏺</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Зображення горщика</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-8">
                <button
                  onClick={() => setSelectedPot(null)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                        {selectedPot.material}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        {selectedPot.size}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedPot.name}
                    </h2>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedPot.rating}</span>
                        <span className="text-gray-500 dark:text-gray-400">({selectedPot.reviews} відгуків)</span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPot.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Особливості:</h3>
                    <div className="space-y-2">
                      {selectedPot.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {selectedPot.originalPrice && (
                        <div className="text-gray-400 dark:text-gray-500 line-through text-lg">
                          {selectedPot.originalPrice}₴
                        </div>
                      )}
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedPot.price}₴
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-2">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                        Додати в кошик
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}