import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { fetchServerPlant, fetchServerPlants } from '@/lib/server-api';
import { formatPrice } from '@/lib/format-price';
import { findPlantBySlug, getPlantPath } from '@/lib/plant-slug';
import { buildOpenGraph, toAbsoluteImageUrl, toMetaDescription } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site-url';
import type { Plant } from '@/app/types/plant';
import AddToCartButton from './AddToCartButton';
import PlantGallery from './PlantGallery';

// ISR: сторінка товару оновлюється без перебудови всього сайту.
export const revalidate = 300;

type PlantPageProps = {
  params: Promise<{ slug: string }>;
};

type ResolvedPlant = {
  plant: Plant;
  // false → URL не канонічний (старий numeric id), сторінка має редиректити
  isCanonical: boolean;
};

async function resolvePlant(rawSlug: string): Promise<ResolvedPlant | null> {
  const decoded = decodeURIComponent(rawSlug);

  // Старі URL виду /plants/25: знаходимо рослину за id і редиректимо
  // на канонічний слаг, щоб уже проіндексовані посилання не зникли.
  if (/^\d+$/.test(decoded)) {
    const id = Number(decoded);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return null;
    }

    const plant = await fetchServerPlant(id, { revalidate: 300 });
    return plant ? { plant, isCanonical: false } : null;
  }

  const plants = await fetchServerPlants({ revalidate: 300 });
  const plant = findPlantBySlug(plants, decoded);
  return plant ? { plant, isCanonical: true } : null;
}

export async function generateMetadata({
  params,
}: PlantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolvePlant(slug);

  if (!resolved) {
    return {
      title: 'Рослину не знайдено',
      robots: { index: false, follow: false },
    };
  }

  const { plant } = resolved;
  const description = toMetaDescription(
    plant.description,
    `Купити ${plant.name} у PlantShop — ціна ${formatPrice(plant.price)}, доставка по Україні. Преміум рослини для дому, офісу та саду.`,
  );
  const canonicalPath = getPlantPath(plant);
  const coverImage = plant.images?.[0];

  return {
    title: `${plant.name} — купити`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: buildOpenGraph({
      url: canonicalPath,
      title: `${plant.name} — купити | PlantShop`,
      description,
      ...(coverImage ? { images: [toAbsoluteImageUrl(coverImage)] } : {}),
    }),
    twitter: {
      card: 'summary_large_image',
      title: `${plant.name} — купити | PlantShop`,
      description,
    },
  };
}

export default async function PlantPage({ params }: PlantPageProps) {
  const { slug } = await params;
  const resolved = await resolvePlant(slug);

  if (!resolved) {
    notFound();
  }

  const { plant, isCanonical } = resolved;

  if (!isCanonical) {
    permanentRedirect(getPlantPath(plant));
  }

  const images = plant.images?.length
    ? plant.images
    : ['/images/placeholder.jpg'];
  const descriptionText =
    plant.description?.trim() || 'Опис рослини поки не додано.';
  const canonicalUrl = absoluteUrl(getPlantPath(plant));

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plant.name,
    image: images.map((image) => toAbsoluteImageUrl(image)),
    description: toMetaDescription(
      plant.description,
      `${plant.name} з каталогу преміум рослин PlantShop.`,
    ),
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      price: plant.price,
      priceCurrency: 'UAH',
      availability: 'https://schema.org/InStock',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Головна',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Каталог рослин',
        item: absoluteUrl('/plants'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: plant.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <main className="content-with-navbar min-h-screen bg-slate-50 text-gray-950 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Хлібні крихти" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="transition hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Головна
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} />
            </li>
            <li>
              <Link
                href="/plants"
                className="transition hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Каталог рослин
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} />
            </li>
            <li
              aria-current="page"
              className="font-medium text-gray-900 dark:text-white"
            >
              {plant.name}
            </li>
          </ol>
        </nav>

        <article className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <PlantGallery images={images} alt={plant.name} />

          <div className="flex flex-col gap-6">
            <header>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {plant.name}
              </h1>
              <p className="mt-4 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatPrice(plant.price)}
              </p>
            </header>

            <section aria-label="Опис рослини">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Опис
              </h2>
              <p className="mt-2 whitespace-pre-line text-base leading-7 text-gray-600 dark:text-gray-300">
                {descriptionText}
              </p>
            </section>

            <div className="mt-auto space-y-4 border-t border-gray-200 pt-6 dark:border-gray-800">
              <AddToCartButton plant={plant} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Питання щодо цієї рослини чи догляду за нею?{' '}
                <Link
                  href="/contact"
                  className="font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400"
                >
                  Напишіть нам
                </Link>
                .
              </p>
            </div>
          </div>
        </article>

        <div className="mt-12">
          <Link
            href="/plants"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
          >
            <ArrowLeft size={16} />
            Повернутися до каталогу
          </Link>
        </div>
      </div>
    </main>
  );
}
