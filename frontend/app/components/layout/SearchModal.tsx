// components/layout/SearchModal.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { modalBackdropVariants, scaleInVariants } from '@/app/animations/navbar';

const MotionDiv = m.div;
const MAX_SEARCH_LENGTH = 100;

interface SearchModalProps {
  searchOpen: boolean;
  searchModalRef: React.RefObject<HTMLDivElement>;
  popularSearches: string[];
  onClose: () => void;
}

export function SearchModal({
  searchOpen,
  searchModalRef,
  popularSearches,
  onClose,
}: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const goToSearch = (term: string) => {
    const normalized = term.trim().slice(0, MAX_SEARCH_LENGTH);

    if (!normalized) {
      return;
    }

    setQuery('');
    onClose();
    router.push(`/plants?search=${encodeURIComponent(normalized)}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    goToSearch(query);
  };

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
            <form onSubmit={handleSubmit} className="relative p-4 lg:p-6" role="search">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                maxLength={MAX_SEARCH_LENGTH}
                placeholder="Пошук рослин у каталозі..."
                aria-label="Пошук рослин у каталозі"
                className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 text-base lg:text-lg"
                autoFocus
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-2"
                aria-label="Закрити пошук"
              >
                <X size={20} />
              </button>
            </form>

            <div className="px-4 lg:px-6 pb-4 lg:pb-6 space-y-4">
              <button
                type="button"
                onClick={() => goToSearch(query)}
                disabled={!query.trim()}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Знайти в каталозі
              </button>

              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Популярні запити:</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => goToSearch(term)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-200 text-sm"
                  >
                    {term}
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
