'use client';

import { useState } from 'react';
import Image, { type ImageLoader } from 'next/image';

const remoteImageLoader: ImageLoader = ({ src }) => src;

function isRemoteImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

type Props = {
  images: string[];
  alt: string;
};

export default function PlantGallery({ images, alt }: Props) {
  const safeImages = images.length ? images : ['/images/placeholder.jpg'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

  const resolveSrc = (index: number) =>
    failedIndexes.has(index)
      ? '/images/placeholder.jpg'
      : safeImages[index];

  const markFailed = (index: number) => {
    setFailedIndexes((prev) => new Set(prev).add(index));
  };

  const currentSrc = resolveSrc(currentIndex);
  const isRemote = isRemoteImageUrl(currentSrc);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:border-gray-800 dark:from-emerald-900/20 dark:to-cyan-900/20">
        <Image
          src={currentSrc}
          alt={currentIndex === 0 ? alt : `${alt} — фото ${currentIndex + 1}`}
          fill
          priority={currentIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          loader={isRemote ? remoteImageLoader : undefined}
          unoptimized={isRemote}
          onError={() => markFailed(currentIndex)}
        />
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-1">
          {safeImages.map((_, index) => {
            const thumbSrc = resolveSrc(index);
            const thumbIsRemote = isRemoteImageUrl(thumbSrc);

            return (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Показати фото ${index + 1}`}
                className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  index === currentIndex
                    ? 'border-emerald-500 ring-2 ring-emerald-300'
                    : 'border-gray-200 hover:border-emerald-300 dark:border-gray-700'
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${alt} — мініатюра ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  loader={thumbIsRemote ? remoteImageLoader : undefined}
                  unoptimized={thumbIsRemote}
                  onError={() => markFailed(index)}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
