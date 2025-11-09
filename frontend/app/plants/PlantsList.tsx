'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { LazyMotion, m, AnimatePresence, domAnimation } from 'framer-motion';
import { ShoppingCart, X, ChevronLeft, ChevronRight, Heart, Share2, Star, Truck, Shield, Zap, Sun, Droplets, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { Plant } from '../types/plant';

// Optimized motion components
const MotionDiv = m.div;
const MotionArticle = m.article;
const MotionButton = m.button;

type Props = { plants: Plant[] };

const productFeatures = [
  { icon: Truck, text: 'Free shipping over $50' },
  { icon: Shield, text: '30-day guarantee' },
  { icon: Zap, text: 'Easy care guide' }
];

const careFeatures = [
  { icon: Sun, text: 'Bright Indirect', level: 'Easy' },
  { icon: Droplets, text: 'Water weekly', level: 'Moderate' }
];

// Optimized image component with error handling
const OptimizedImage = ({ src, alt, priority = false, ...props }: any) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative w-full h-full">
      <Image
        src={error ? '/images/placeholder.jpg' : src}
        alt={alt}
        priority={priority}
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

export default function PlantsList({ plants }: Props) {
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const isMobile = useMobile();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Memoized images array with error handling
  const images = useMemo(() => {
    if (!selectedPlant?.images?.length) return ['/images/placeholder.jpg'];
    
    return selectedPlant.images.map((img, index) => 
      imageLoadErrors.has(index) ? '/images/placeholder.jpg' : img
    );
  }, [selectedPlant?.images, imageLoadErrors]);

  const currentImage = images[currentIndex];

  // Memoized product info calculations
  const getProductInfo = useCallback((plant: Plant) => {
    const isPopular = plant.id % 3 === 0;
    const originalPrice = plant.id % 2 === 0 ? plant.price * 1.8 : null;
    const rating = 4.3 + (plant.id * 0.1) % 0.7;
    const reviewCount = 50 + (plant.id * 23) % 450;
    
    return { isPopular, originalPrice, rating, reviewCount };
  }, []);

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

  const toggleWishlist = (plantId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist(prev => {
      const newSet = new Set(prev);
      newSet.has(plantId) ? newSet.delete(plantId) : newSet.add(plantId);
      return newSet;
    });
  };

  const handleAddToCart = async (plant: Plant, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsAddingToCart(false);
    console.log('Added to cart:', plant.name);
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
            alt={`Thumbnail ${i + 1}`}
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
                alt={`Thumbnail ${actualIndex + 1}`}
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
  const MobileFullscreenViewer = () => (
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
            Swipe to navigate
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

  if (!plants || plants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No plants found</h2>
          <p className="text-gray-600 dark:text-gray-400">Check back later for new additions!</p>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative min-h-screen bg-gradient-to-br from-emerald-50/30 to-cyan-50/30 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/20 dark:bg-cyan-900/10 rounded-full blur-3xl" />
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                <Zap size={16} />
                Fresh Plants Delivered Weekly
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Green Paradise
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Discover our curated collection of premium indoor plants.
              </p>
            </MotionDiv>
          </div>

          {/* Plants Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {plants.map((plant, i) => {
              const productInfo = getProductInfo(plant);
              
              return (
                <MotionArticle
                  key={plant.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: i * 0.05,
                    ease: "easeOut" 
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative cursor-pointer bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/60 dark:border-gray-700/60"
                  onClick={() => openModal(plant, 0)}
                  style={{ willChange: 'transform, opacity' }}
                >
                  {productInfo.isPopular && (
                    <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Popular
                    </div>
                  )}

                  <button
                    onClick={(e) => toggleWishlist(plant.id.toString(), e)}
                    className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    style={{ willChange: 'transform' }}
                  >
                    <Heart 
                      size={16} 
                      className={`transition-all duration-200 ${
                        wishlist.has(plant.id.toString()) 
                          ? 'fill-red-500 text-red-500 scale-110' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-red-400'
                      }`}
                    />
                  </button>

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
                      <div className="flex items-center gap-1 ml-2">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{productInfo.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                      {plant.description || 'Beautiful indoor plant.'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${plant.price.toFixed(2)}</div>
                      <MotionButton
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleAddToCart(plant, e)}
                        className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white py-1.5 px-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        style={{ willChange: 'transform' }}
                      >
                        <ShoppingCart size={14} />
                        <span className="hidden sm:inline">Add</span>
                      </MotionButton>
                    </div>
                  </div>
                </MotionArticle>
              );
            })}
          </div>
        </main>

        {/* Mobile-Optimized Modal */}
        <AnimatePresence mode="wait">
          {isModalOpen && selectedPlant && (
            <>
              {/* Fullscreen Viewer */}
              {isFullscreen && <MobileFullscreenViewer />}
              
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
                        <div className="flex items-center gap-2 mb-2">
                          {getProductInfo(selectedPlant).isPopular && (
                            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Popular
                            </span>
                          )}
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span className="font-semibold">{getProductInfo(selectedPlant).rating.toFixed(1)}</span>
                            <span className="text-amber-600 dark:text-amber-400">({getProductInfo(selectedPlant).reviewCount})</span>
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 sm:text-2xl">{selectedPlant.name}</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{selectedPlant.description}</p>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${selectedPlant.price.toFixed(2)}</div>
                        {getProductInfo(selectedPlant).originalPrice && (
                          <>
                            <div className="text-lg text-gray-400 line-through">
                              ${getProductInfo(selectedPlant).originalPrice!.toFixed(2)}
                            </div>
                            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs font-semibold">
                              Save ${(getProductInfo(selectedPlant).originalPrice! - selectedPlant.price).toFixed(2)}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {productFeatures.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <feature.icon size={16} className="text-emerald-500 flex-shrink-0" />
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Care Info */}
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Care Instructions</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {careFeatures.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                              <feature.icon size={16} className="text-emerald-500 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">{feature.text}</div>
                                <div className="text-gray-600 dark:text-gray-400">{feature.level}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-2">
                        <div className="flex gap-2">
                          <MotionButton
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleAddToCart(selectedPlant, e)}
                            disabled={isAddingToCart}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                            style={{ willChange: 'transform' }}
                          >
                            {isAddingToCart ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Adding...
                              </div>
                            ) : (
                              <>
                                <ShoppingCart size={18} />
                                Add to Cart
                              </>
                            )}
                          </MotionButton>
                          
                          <button
                            onClick={(e) => toggleWishlist(selectedPlant.id.toString(), e)}
                            className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex-shrink-0"
                          >
                            <Heart 
                              size={18} 
                              className={`transition-all ${
                                wishlist.has(selectedPlant.id.toString()) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            />
                          </button>
                        </div>
                        
                        <button className="w-full py-2.5 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                          <Share2 size={16} />
                          Share Product
                        </button>
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