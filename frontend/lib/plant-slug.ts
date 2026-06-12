import type { Plant } from '@/app/types/plant';

/**
 * SEO-слаги для сторінок рослин: /plants/monstera-delitsioza замість
 * /plants/25. Слаг обчислюється з назви (офіційна транслітерація
 * КМУ №55-2010), БД не змінюється — id лишається source of truth,
 * а старі numeric-URL назавжди редиректяться на слаг.
 */

// Пари для позиції на початку слова (Є→ye, Ї→yi, Й→y, Ю→yu, Я→ya)
const INITIAL_MAP: Record<string, string> = {
  є: 'ye',
  ї: 'yi',
  й: 'y',
  ю: 'yu',
  я: 'ya',
};

const CHAR_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ie',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'iu',
  я: 'ia',
  // російські літери на випадок змішаних назв у каталозі
  ы: 'y',
  э: 'e',
  ё: 'io',
  ъ: '',
};

function transliterate(value: string): string {
  let result = '';
  let atWordStart = true;

  for (const char of value.toLowerCase()) {
    if (/[a-z0-9]/.test(char)) {
      result += char;
      atWordStart = false;
      continue;
    }

    const mapped = atWordStart ? INITIAL_MAP[char] ?? CHAR_MAP[char] : CHAR_MAP[char];

    if (mapped !== undefined) {
      result += mapped;
      atWordStart = false;
      continue;
    }

    // Апостроф/мʼякі знаки просто пропускаємо, не розриваючи слово
    if (char === "'" || char === 'ʼ' || char === '’' || char === '`') {
      continue;
    }

    // Будь-який інший символ — роздільник слова
    if (!result.endsWith('-') && result.length > 0) {
      result += '-';
    }
    atWordStart = true;
  }

  return result.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/** Слаг рослини; гарантовано непорожній і не суто числовий. */
export function getPlantSlug(plant: Pick<Plant, 'id' | 'name'>): string {
  const slug = transliterate(plant.name);

  if (!slug) {
    return `plant-${plant.id}`;
  }

  // Суто числовий слаг конфліктував би з резолвом за id
  if (/^\d+$/.test(slug)) {
    return `plant-${slug}`;
  }

  return slug;
}

/** Канонічний шлях детальної сторінки рослини. */
export function getPlantPath(plant: Pick<Plant, 'id' | 'name'>): string {
  return `/plants/${getPlantSlug(plant)}`;
}

/**
 * Пошук рослини за слагом у списку каталогу. При теоретичному збігу
 * слагів двох назв детерміновано виграє менший id.
 */
export function findPlantBySlug(
  plants: Plant[],
  slug: string,
): Plant | null {
  const matches = plants.filter((plant) => getPlantSlug(plant) === slug);

  if (!matches.length) {
    return null;
  }

  return matches.reduce((best, plant) => (plant.id < best.id ? plant : best));
}
