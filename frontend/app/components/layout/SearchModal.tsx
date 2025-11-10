// components/layout/SearchModal.tsx
'use client';

import { X, Search } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { modalBackdropVariants, scaleInVariants } from '@/app/animations/navbar';

const MotionDiv = m.div;

interface SearchModalProps {
  searchOpen: boolean;
  searchModalRef: React.RefObject<HTMLDivElement>;
  popularSearches: string[];
  recentSearches: string[];
  onClose: () => void;
}

export function SearchModal({
  searchOpen,
  searchModalRef,
  popularSearches,
  recentSearches,
  onClose,
}: SearchModalProps) {
  return (
    <AnimatePresence mode="wait">
      {searchOpen && (
        <MotionDiv
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex justify-center items-start pt-20 lg:pt-32 px-4"
          style={{ willChange: 'opacity' }}
        >
          <MotionDiv
            ref={searchModalRef}
            variants={scaleInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="relative p-4 lg:p-6">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Пошук рослин, аксесуарів, порад..."
                className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 text-base lg:text-lg"
                autoFocus
              />
              <button
                onClick={onClose}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-2"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Search Suggestions */}
            <div className="px-4 lg:px-6 pb-4 lg:pb-6 space-y-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Популярні запити:</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={onClose}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-200 text-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="px-4 lg:px-6 pb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Нещодавні пошуки:</p>
                <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Очистити
                </button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                  >
                    <span className="truncate">{term}</span>
                    <X size={14} className="text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}