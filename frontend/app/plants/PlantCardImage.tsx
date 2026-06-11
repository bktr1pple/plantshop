'use client';

import { useState } from 'react';
import Image, { type ImageLoader } from 'next/image';

const remoteImageLoader: ImageLoader = ({ src }) => src;

function isRemoteImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
};

/**
 * Клієнтська обгортка над next/image лише заради graceful-фолбеку
 * на плейсхолдер, коли керований медіа-файл недоступний.
 */
export default function PlantCardImage({ src, alt, sizes, priority = false }: Props) {
  const [error, setError] = useState(false);
  const imageSrc = error ? '/images/placeholder.jpg' : src;
  const isRemoteSrc = isRemoteImageUrl(imageSrc);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loader={isRemoteSrc ? remoteImageLoader : undefined}
      unoptimized={isRemoteSrc}
      onError={() => setError(true)}
      className="object-cover transition-all duration-700 group-hover:scale-110"
    />
  );
}
