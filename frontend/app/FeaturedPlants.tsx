import Link from 'next/link';
import { ArrowRight, Sprout } from 'lucide-react';
import type { Plant } from '@/app/types/plant';
import { formatPrice } from '@/lib/format-price';
import { getPlantPath } from '@/lib/plant-slug';
import PlantCardImage from '@/app/plants/PlantCardImage';
import CardAddToCartButton from '@/app/plants/CardAddToCartButton';

/**
 * Серверна секція головної: реальні рослини з каталогу.
 * Рендериться на сервері (SEO + швидкий LCP), інтерактив — лише
 * маленькі клієнтські острівці зображення та кнопки кошика.
 */
export default function FeaturedPlants({ plants }: { plants: Plant[] }) {
  if (!plants.length) {
    return null;
  }

  return (
    <section className="relative py-20 sm:py-24" aria-labelledby="featured-plants-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Sprout className="h-3.5 w-3.5" />
              Живий каталог
            </span>
            <h2
              id="featured-plants-title"
              className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
            >
              Рослини, які зараз у наявності
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
              Найсвіжіші позиції з нашого каталогу — кожну можна замовити з
              доставкою вже сьогодні.
            </p>
          </div>
          <Link
            href="/plants"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
          >
            Весь каталог
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {plants.map((plant, index) => (
            <article
              key={plant.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100/70 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:rounded-3xl"
            >
              <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 sm:h-56">
                <PlantCardImage
                  src={plant.images?.[0] ?? '/images/placeholder.jpg'}
                  alt={plant.name}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index < 2}
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                  <Link
                    href={getPlantPath(plant)}
                    className="transition-colors after:absolute after:inset-0 after:content-[''] hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    {plant.name}
                  </Link>
                </h3>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 sm:text-lg">
                    {formatPrice(plant.price)}
                  </span>
                  <CardAddToCartButton plant={plant} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
