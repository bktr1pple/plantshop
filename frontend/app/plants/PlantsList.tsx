'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LazyMotion, m, AnimatePresence, domAnimation } from 'framer-motion';
import {
  ShoppingCart,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import Image, { type ImageLoader } from 'next/image';
import Link from 'next/link';
import type { Plant, PlantsPaginationMeta } from '../types/plant';

import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/format-price';

// Optimized motion components
const MotionDiv = m.div;
const MotionArticle = m.article;
const MotionButton = m.button;

type Props = {
  plants: Plant[];
  pagination: PlantsPaginationMeta;
  searchTerm?: string;
  hasLoadError?: boolean;
};
type OptimizedImageProps = Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> & {
  src: string;
  alt: string;
  priority?: boolean;
};

const remoteImageLoader: ImageLoader = ({ src }) => src;

function isRemoteImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function getPageHref(page: number, limit: number, searchTerm?: string) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set('page', String(page));
  }

  if (limit !== 12) {
    params.set('limit', String(limit));
  }

  if (searchTerm) {
    params.set('search', searchTerm);
  }

  const query = params.toString();
  return query ? `/plants?${query}` : '/plants';
}

// Optimized image component with error handling
const OptimizedImage = ({ src, alt, priority = false, ...props }: OptimizedImageProps) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imageSrc = error ? '/images/placeholder.jpg' : src;
  const isRemoteSrc = isRemoteImageUrl(imageSrc);
  
  return (
    <div className="relative w-full h-full">
      <Image
        src={imageSrc}
        alt={alt}
        priority={priority}
        loader={isRemoteSrc ? remoteImageLoader : undefined}
        unoptimized={isRemoteSrc}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${props.className}`}
        {...props}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      )}
    </div>
  );
};

// Mobile detection hook
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export default function PlantsList({
  plants,
  pagination,
  searchTerm = '',
  hasLoadError = false,
}: Props) {
  const { addToCart } = useCart();

  const [plantItems, setPlantItems] = useState<Plant[]>(plants);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isMobile = useMobile();
  const currentPage = Math.min(
    Math.max(1, pagination.page),
    Math.max(1, pagination.totalPages),
  );
  const visiblePages = getVisiblePages(currentPage, pagination.totalPages);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlantItems(plants);
  }, [plants]);

  const images = (() => {
    if (!selectedPlant?.images?.length) return ['/images/placeholder.jpg'];
    
    return selectedPlant.images.map((img, index) => 
      imageLoadErrors.has(index) ? '/images/placeholder.jpg' : img
    );
  })();

  const currentImage = images[currentIndex];

  // Optimized modal handlers
  const openModal = useCallback((plant: Plant, startIndex = 0) => {
    setSelectedPlant(plant);
    setCurrentIndex(startIndex);
    setImageLoadErrors(new Set());
    setIsModalOpen(true);
    setIsFullscreen(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsFullscreen(false);
    setTimeout(() => {
      setSelectedPlant(null);
      setCurrentIndex(0);
      setImageLoadErrors(new Set());
    }, 300);
  }, []);

  // Optimized navigation
  const next = useCallback(() => {
    if (!images.length) return;
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    if (!images.length) return;
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Mobile scroll management
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isModalOpen]);

  // Mobile keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          closeModal();
        }
      }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal, prev, next, isFullscreen]);

  // Mobile swipe handler
  useEffect(() => {
    if (!isModalOpen || !isMobile) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        if (diffX > 0) next();
        else prev();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isModalOpen, next, prev, isMobile]);

  const handleAddToCart = async (plant: Plant, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsAddingToCart(true);
    
    addToCart({
      id: plant.id.toString(),
      name: plant.name,
      price: plant.price,
      image: plant.images?.[0] ?? '/images/placeholder.jpg'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAddingToCart(false);
  };

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
  };

  // Optimized thumbnails renderer
  const renderThumbnails = useCallback(() => {
    if (images.length <= 6) {
      return images.map((src, i) => (
        <button
          key={i}
          onClick={() => setCurrentIndex(i)}
          className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
            i === currentIndex
              ? 'border-emerald-500 ring-2 ring-emerald-300 scale-105'
              : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
          }`}
          style={{ willChange: 'transform' }}
        >
          <OptimizedImage
            src={src}
            alt={`Мініатюра ${i + 1}`}
            width={64}
            height={48}
            className="object-cover w-full h-full"
          />
        </button>
      ));
    }

    const start = Math.max(0, currentIndex - 2);
    const end = Math.min(images.length, currentIndex + 3);
    
    return (
      <>
        {start > 0 && (
          <div className="flex-shrink-0 w-6 flex items-center justify-center text-gray-400 text-xs">
            ...
          </div>
        )}
        {images.slice(start, end).map((src, i) => {
          const actualIndex = start + i;
          return (
            <button
              key={actualIndex}
              onClick={() => setCurrentIndex(actualIndex)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                actualIndex === currentIndex
                  ? 'border-emerald-500 ring-2 ring-emerald-300 scale-105'
                  : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
              }`}
              style={{ willChange: 'transform' }}
            >
              <OptimizedImage
                src={src}
                alt={`Мініатюра ${actualIndex + 1}`}
                width={64}
                height={48}
                className="object-cover w-full h-full"
              />
            </button>
          );
        })}
        {end < images.length && (
          <div className="flex-shrink-0 w-6 flex items-center justify-center text-gray-400 text-xs">
            ...
          </div>
        )}
      </>
    );
  }, [images, currentIndex]);

  // Fullscreen image viewer for mobile
  const renderMobileFullscreenViewer = () => (
    <MotionDiv
      className="fixed inset-0 z-60 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ willChange: 'opacity' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white">
        <div className="text-lg font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={() => setIsFullscreen(false)}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Image */}
      <div 
        className="flex-1 flex items-center justify-center p-4 touch-pan-y"
        onClick={() => setIsFullscreen(false)}
      >
        <div className="relative w-full h-full max-w-4xl">
          <OptimizedImage
            src={currentImage}
            alt={`${selectedPlant?.name} ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-black/80">
          <button
            onClick={prev}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div className="text-white text-sm">
            Гортайте зображення
          </div>
          <button
            onClick={next}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>
      )}
    </MotionDiv>
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="content-with-navbar min-h-screen bg-slate-50 text-gray-950 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Каталог рослин PlantShop
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Добірка кімнатних, садових і декоративних рослин для дому, офісу та ландшафтних рішень.
              </p>
              {!hasLoadError && (
                <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? `Результати пошуку за запитом «${searchTerm}»: ${pagination.totalItems}`
                    : `Показано ${plantItems.length} з ${pagination.totalItems} позицій`}
                </p>
              )}
              {searchTerm && !hasLoadError && (
                <Link
                  href="/plants"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  <X size={14} />
                  Скинути пошук
                </Link>
              )}
            </MotionDiv>
          </div>

          {/* Plants Grid */}
          {hasLoadError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50/80 px-6 py-16 text-center shadow-sm dark:border-rose-900/50 dark:bg-rose-950/20">
              <div className="mb-4 text-5xl">⚠️</div>
              <h2 className="mb-2 text-2xl font-bold text-rose-800 dark:text-rose-200">
                Не вдалося завантажити каталог
              </h2>
              <p className="mx-auto max-w-xl text-rose-700 dark:text-rose-300">
                Сервер каталогу тимчасово недоступний. Оновіть сторінку за хвилину або поверніться пізніше.
              </p>
              <Link
                href={getPageHref(currentPage, pagination.limit, searchTerm)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Спробувати ще раз
              </Link>
            </div>
          ) : plantItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {plantItems.map((plant, i) => (
                <MotionArticle
                  key={plant.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: 'easeOut',
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative cursor-pointer bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/60 dark:border-gray-700/60"
                  onClick={() => openModal(plant, 0)}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="relative h-48 sm:h-64 w-full bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 overflow-hidden">
                    <OptimizedImage
                      src={plant.images?.[0] ?? '/images/placeholder.jpg'}
                      alt={plant.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                      priority={i < 4}
                    />
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 flex-1">{plant.name}</h3>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                      {plant.description || 'Опис рослини поки не додано.'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatPrice(plant.price)}</div>
                      <MotionButton
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleAddToCart(plant, e)}
                        className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white py-1.5 px-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        style={{ willChange: 'transform' }}
                      >
                        <ShoppingCart size={14} />
                        <span className="hidden sm:inline">Додати</span>
                      </MotionButton>
                      </div>
                    </div>
                  </MotionArticle>
                ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 text-5xl">🌱</div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Рослини не знайдено
              </h2>
              <p className="mx-auto max-w-xl text-gray-600 dark:text-gray-300">
                {searchTerm
                  ? `За запитом «${searchTerm}» нічого не знайдено. Спробуйте інше слово або перегляньте весь каталог.`
                  : 'Каталог порожній або для вибраної сторінки немає товарів. Поверніться на першу сторінку.'}
              </p>
              {searchTerm && (
                <Link
                  href="/plants"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Переглянути весь каталог
                </Link>
              )}
            </div>
          )}

          {!hasLoadError && pagination.totalPages > 1 && (
            <nav
              aria-label="Пагінація каталогу рослин"
              className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row"
            >
              {currentPage > 1 ? (
                <Link
                  href={getPageHref(currentPage - 1, pagination.limit, searchTerm)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                >
                  <ChevronLeft size={16} />
                  Попередня
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-400 dark:border-gray-800 dark:text-gray-600">
                  <ChevronLeft size={16} />
                  Попередня
                </span>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2">
                {visiblePages.map((page, index) => {
                  const previousPage = visiblePages[index - 1];
                  const showGap = previousPage !== undefined && page - previousPage > 1;
                  const isActive = page === currentPage;

                  return (
                    <React.Fragment key={page}>
                      {showGap && (
                        <span className="px-2 text-sm font-semibold text-gray-400 dark:text-gray-500">
                          ...
                        </span>
                      )}
                      <Link
                        href={getPageHref(page, pagination.limit, searchTerm)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'border border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300'
                        }`}
                      >
                        {page}
                      </Link>
                    </React.Fragment>
                  );
                })}
              </div>

              {currentPage < pagination.totalPages ? (
                <Link
                  href={getPageHref(currentPage + 1, pagination.limit, searchTerm)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                >
                  Наступна
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-400 dark:border-gray-800 dark:text-gray-600">
                  Наступна
                  <ChevronRight size={16} />
                </span>
              )}
            </nav>
          )}
        </main>

        {/* Mobile-Optimized Modal */}
        <AnimatePresence mode="wait">
          {isModalOpen && selectedPlant && (
            <>
              {/* Fullscreen Viewer */}
              {isFullscreen && renderMobileFullscreenViewer()}
              
              {/* Main Modal */}
              <MotionDiv
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={`modal-${selectedPlant.id}`}
                style={{ willChange: 'opacity' }}
              >
                {/* Backdrop */}
                <MotionDiv
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeModal}
                  style={{ willChange: 'opacity' }}
                />

                {/* Modal Content */}
                <MotionDiv
                  ref={modalRef}
                  className="relative bg-white dark:bg-gray-800 w-full max-w-2xl sm:max-w-4xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[90vh] sm:max-h-[80vh]"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  style={{ willChange: 'transform, opacity' }}
                >
                  {/* Close Button */}
                  <button
                    ref={closeBtnRef}
                    onClick={closeModal}
                    className="absolute top-3 right-3 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 sm:top-4 sm:right-4"
                    style={{ willChange: 'transform' }}
                  >
                    <X size={18} className="text-gray-700 dark:text-gray-300 sm:w-5 sm:h-5" />
                  </button>

                  {/* Image Section */}
                  <div className="relative h-64 sm:h-auto sm:flex-1 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 min-h-[40vh] sm:min-h-[500px]">
                    {/* Background Blur */}
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-110"
                      style={{ backgroundImage: `url(${currentImage})` }}
                    />

                    {/* Main Image */}
                    <div 
                      className="relative w-full h-full flex items-center justify-center p-4"
                      onClick={() => isMobile && setIsFullscreen(true)}
                    >
                      <div className="relative w-full h-full max-w-2xl flex items-center justify-center">
                        <OptimizedImage
                          src={currentImage}
                          alt={`${selectedPlant.name} ${currentIndex + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-contain"
                          priority
                          onError={() => handleImageError(currentIndex)}
                        />
                      </div>

                      {/* Fullscreen Button - Mobile Only */}
                      {isMobile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFullscreen(true);
                          }}
                          className="absolute bottom-3 right-3 z-30 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                        >
                          <Maximize2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Navigation Arrows - Desktop Only */}
                    {images.length > 1 && !isMobile && (
                      <>
                        <button
                          onClick={prev}
                          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
                          style={{ willChange: 'transform' }}
                        >
                          <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={next}
                          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
                          style={{ willChange: 'transform' }}
                        >
                          <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                      <div className="absolute top-3 left-3 z-30 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm sm:top-4 sm:left-4">
                        {currentIndex + 1} / {images.length}
                      </div>
                    )}

                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-2 sm:p-3">
                          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                            {renderThumbnails()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-none">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Header */}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 sm:text-2xl">{selectedPlant.name}</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                          {selectedPlant.description || 'Опис рослини поки не додано.'}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                          {formatPrice(selectedPlant.price)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-2">
                        <MotionButton
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleAddToCart(selectedPlant, e)}
                          disabled={isAddingToCart}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                          style={{ willChange: 'transform' }}
                        >
                          {isAddingToCart ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Додаємо...
                            </div>
                          ) : (
                            <>
                              <ShoppingCart size={18} />
                              Додати в кошик
                            </>
                          )}
                        </MotionButton>
                      </div>

                    </div>
                  </div>
                </MotionDiv>
              </MotionDiv>
            </>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
