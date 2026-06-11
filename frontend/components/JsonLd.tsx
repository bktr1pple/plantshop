import React from 'react';

/**
 * Серверний рендер JSON-LD. Екрануємо `<`, щоб вміст не міг закрити
 * <script> і перетворитися на XSS через дані з бекенда.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
