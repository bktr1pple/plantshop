import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Plant, PlantsPaginationMeta } from '../types/plant';

import { formatPrice } from '@/lib/format-price';
import { getPlantPath } from '@/lib/plant-slug';
import PlantCardImage from './PlantCardImage';
import CardAddToCartButton from './CardAddToCartButton';

type Props = {
  plants: Plant[];
  pagination: PlantsPaginationMeta;
  searchTerm?: string;
  hasLoadError?: boolean;
};

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

export default function PlantsList({
  plants,
  pagination,
  searchTerm = '',
  hasLoadError = false,
}: Props) {
  const currentPage = Math.min(
    Math.max(1, pagination.page),
    Math.max(1, pagination.totalPages),
  );
  const visiblePages = getVisiblePages(currentPage, pagination.totalPages);

  return (
    <div className="content-with-navbar min-h-screen bg-slate-50 text-gray-950 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
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
                : `Показано ${plants.length} з ${pagination.totalItems} позицій`}
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
        ) : plants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {plants.map((plant, i) => (
              <article
                key={plant.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/60 dark:border-gray-700/60"
              >
                <div className="relative h-48 sm:h-64 w-full bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 overflow-hidden">
                  <PlantCardImage
                    src={plant.images?.[0] ?? '/images/placeholder.jpg'}
                    alt={plant.name}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={i < 2}
                  />
                </div>

                <div className="p-3 sm:p-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                    <Link
                      href={getPlantPath(plant)}
                      className="after:absolute after:inset-0 after:content-[''] hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      {plant.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                    {plant.description || 'Опис рослини поки не додано.'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      {formatPrice(plant.price)}
                    </div>
                    <CardAddToCartButton plant={plant} />
                  </div>
                </div>
              </article>
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
    </div>
  );
}
