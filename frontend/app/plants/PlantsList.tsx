'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Plant } from '../types/plant';

type Props = { plants: Plant[] };

export default function PlantsList({ plants }: Props) {
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [index, setIndex] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // block background scroll while modal open
  useEffect(() => {
    document.body.style.overflow = selectedPlant ? 'hidden' : '';
    if (selectedPlant) setTimeout(() => closeBtnRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPlant]);

  // keyboard nav
  useEffect(() => {
    if (!selectedPlant) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPlant, index]);

  const openModal = (p: Plant, startIndex = 0) => {
    setSelectedPlant(p);
    setIndex(startIndex);
  };
  const closeModal = () => {
    setSelectedPlant(null);
    setIndex(0);
  };
  const next = () => {
    if (!selectedPlant?.images?.length) return;
    setIndex((i) => (i + 1) % selectedPlant.images!.length);
  };
  const prev = () => {
    if (!selectedPlant?.images?.length) return;
    setIndex((i) => (i === 0 ? selectedPlant.images!.length - 1 : i - 1));
  };

  // swipe handlers (simple reliable implementation)
  const startX = useRef<number | null>(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => (startX.current = e.touches[0].clientX); //test2
    const onTouchEnd = (e: TouchEvent) => {
      if (startX.current == null) return;
      const diff = e.changedTouches[0].clientX - startX.current;
      const threshold = 60;
      if (diff > threshold) prev();
      if (diff < -threshold) next();
      startX.current = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    // mouse drag (pointer)
    let pointerDown = false;
    const onPointerDown = (ev: PointerEvent) => {
      pointerDown = true;
      startX.current = ev.clientX;
      el.setPointerCapture?.(ev.pointerId);
    };
    const onPointerUp = (ev: PointerEvent) => {
      if (!pointerDown) return;
      pointerDown = false;
      if (startX.current == null) return;
      const diff = ev.clientX - startX.current;
      const threshold = 60;
      if (diff > threshold) prev();
      if (diff < -threshold) next();
      startX.current = null;
    };
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [selectedPlant, index]);

  const images = selectedPlant?.images && selectedPlant.images.length ? selectedPlant.images : ['/images/placeholder.jpg'];
  const currentImage = images[index];

  const thumbsRef = useRef<HTMLButtonElement[]>([]);

  // під іншим useEffect (або поруч з ними)
  useEffect(() => {
    const el = thumbsRef.current[index];
    if (!el) return;
    // трохи відкладемо для плавності (щоб рендер завершився)
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index, images]);

  return (
    <div className="relative min-h-screen">
      {/* page background visuals */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/plants-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 to-white/100" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent">
            Відкрийте для себе наші рослини
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Ознайомтеся з колекцією красивих рослин для вашого дому.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {plants.map((plant, i) => (
            <motion.article
              key={plant.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              className="group relative cursor-pointer bg-white/95 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-100"
              onClick={() => openModal(plant, 0)}
              role="button"
              aria-label={`Open ${plant.name}`}
            >
              <div className="relative h-56 w-full bg-gray-50">
                <Image
                  src={plant.images?.[0] ?? '/images/placeholder.jpg'}
                  alt={plant.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition">
                  <span className="opacity-0 group-hover:opacity-100 text-white bg-green-600 px-3 py-2 rounded-lg">
                    View details
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{plant.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{plant.description ?? ''}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-bold text-green-700">${plant.price.toFixed(2)}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(plant, 0);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full text-sm"
                  >
                    <ShoppingCart size={16} /> Buy
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedPlant && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* overlay with smooth fade + blur */}
            <motion.div
              className="absolute inset-0"
              initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              animate={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
              exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.35, ease: 'easeInOut', delay: 0.05 }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeModal();
              }}
            />

            {/* Модальне вікно */}
            <motion.div
              ref={modalRef}
              className="
                relative bg-white rounded-2xl shadow-2xl overflow-hidden
                w-[95vw] max-w-4xl sm:max-w-5xl 
                max-h-[90vh] flex flex-col md:grid md:grid-cols-[1fr_360px]
              "
              initial={{ scale: 0.96, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              {/* кнопка закриття (завжди видима, темна іконка) */}
              <button
                ref={closeBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
                aria-label="Close"
                className="absolute top-3 right-3 z-50 bg-white/95 p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none transition-transform hover:scale-110"
              >
                <X size={22} className="text-black" />
              </button>

              {/* LEFT: карусель зображень */}
              <div className="relative flex items-center justify-center bg-gray-50 overflow-hidden">
                {/* розмитий фон */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-center bg-cover blur-2xl opacity-30 scale-105"
                  style={{ backgroundImage: `url(${currentImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

                {/* слайдер */}
                <div
                  ref={trackRef}
                  className="relative w-full h-[60vh] sm:h-[65vh] flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${index * 100}%)`,
                    touchAction: 'pan-y',
                  }}
                >
                  {images.map((src, i) => (
                    <div key={i} className="min-w-full flex items-center justify-center bg-white">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={src}
                          alt={`${selectedPlant.name} ${i + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="object-contain transition-transform duration-500 rounded-md"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* стрелки */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prev();
                      }}
                      aria-label="Previous"
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/95 shadow-lg hover:bg-gray-200 transition-transform hover:scale-110"
                    >
                      <ChevronLeft size={26} className="text-black" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        next();
                      }}
                      aria-label="Next"
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/95 shadow-lg hover:bg-gray-200 transition-transform hover:scale-110"
                    >
                      <ChevronRight size={26} className="text-black" />
                    </button>
                  </>
                )}
              </div>

              {/* RIGHT: опис */}
              <div className="p-5 sm:p-7 relative overflow-y-auto">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedPlant.name}</h2>
                <p className="text-sm text-gray-600 mt-2">{selectedPlant.description}</p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="text-2xl font-bold text-green-700">${selectedPlant.price.toFixed(2)}</div>
                  <button className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition">
                    <ShoppingCart size={16} /> Add to cart
                  </button>
                </div>

                {/* мини-превью */}
                <div className="mt-6 select-none relative">
                  {/* маска для країв */}
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />

                  <div className="flex gap-3 overflow-x-auto px-3 py-3 snap-x snap-mandatory scrollbar-thin scroll-smooth">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        ref={(el) => {
                          // зберігаємо кнопку у масив refs; важливо — не викликаємо scrollIntoView тут
                          if (el) thumbsRef.current[i] = el;
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIndex(i);
                        }}
                        className={`relative flex-shrink-0 snap-start w-24 h-20 md:w-28 md:h-22 rounded-xl overflow-hidden border-2 transition-all duration-300 
                          ${i === index
                            ? 'border-green-600 ring-4 ring-green-400/30 scale-105 shadow-lg'
                            : 'border-transparent hover:scale-105 hover:shadow-md'
                          }`}
                        aria-label={`Thumbnail ${i + 1}`}
                      >
                        <Image
                          src={src}
                          alt={`Thumbnail ${i + 1}`}
                          fill
                          className="object-cover rounded-lg transition-transform duration-300"
                        />
                      </button>
                    ))}
                  </div>

                  {/* точки навігації */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIndex(i);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
                          ${i === index ? 'bg-green-700 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                        aria-label={`Go to ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* кнопки */}
                <div className="mt-6 flex items-center gap-3">
                  <button className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition">
                    Share
                  </button>
                  <button className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition">
                    <ShoppingCart size={16} /> Buy
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
