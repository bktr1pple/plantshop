'use client';

import Image, { type ImageLoader } from 'next/image';
import React, { useState } from 'react';

type SafeImageProps = Omit<
  React.ComponentProps<typeof Image>,
  'src' | 'alt'
> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

const remoteImageLoader: ImageLoader = ({ src }) => src;

function isRemoteImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const finalSrc = hasError ? fallbackSrc : src;
  const isRemoteSrc = isRemoteImageUrl(finalSrc);

  return (
    <Image
      src={finalSrc}
      alt={alt}
      loader={isRemoteSrc ? remoteImageLoader : undefined}
      unoptimized={isRemoteSrc}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
