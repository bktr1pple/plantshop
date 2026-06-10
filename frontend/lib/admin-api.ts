import { API_URL, type SiteSettings } from '@/lib/site-settings';

export type MediaCollection = 'plants' | 'site';

export type MediaItem = {
  filename: string;
  url: string;
  collection: MediaCollection;
  size: number;
  updatedAt: string;
};

async function parseErrorResponse(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await res.json()) as { message?: unknown };

    if (typeof data.message === 'string') {
      return data.message;
    }

    if (Array.isArray(data.message)) {
      const joined = data.message
        .filter((item): item is string => typeof item === 'string')
        .join(', ');
      return joined || fallback;
    }
  } catch {
    // ignore
  }

  return fallback;
}

export async function uploadAdminMedia(
  files: File[],
  collection: MediaCollection,
): Promise<MediaItem[]> {
  const formData = new FormData();
  formData.set('collection', collection);
  files.forEach((file) => formData.append('files', file));

  const res = await fetch(`${API_URL}/admin/media/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(
      await parseErrorResponse(res, 'Не вдалося завантажити зображення'),
    );
  }

  const data = (await res.json()) as { items?: MediaItem[] };
  return data.items ?? [];
}

export async function listAdminMedia(
  collection?: MediaCollection,
): Promise<MediaItem[]> {
  const search = new URLSearchParams();
  if (collection) {
    search.set('collection', collection);
  }

  const res = await fetch(
    `${API_URL}/admin/media${search.toString() ? `?${search.toString()}` : ''}`,
    {
      credentials: 'include',
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(
      await parseErrorResponse(res, 'Не вдалося завантажити медіатеку'),
    );
  }

  const data = (await res.json()) as { items?: MediaItem[] };
  return data.items ?? [];
}

export async function deleteAdminMedia(url: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/media`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    throw new Error(
      await parseErrorResponse(res, 'Не вдалося видалити файл'),
    );
  }
}

export async function getAdminSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_URL}/site-settings`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(
      await parseErrorResponse(res, 'Не вдалося завантажити налаштування сайту'),
    );
  }

  return (await res.json()) as SiteSettings;
}

export async function updateAdminSiteSettings(
  payload: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const res = await fetch(`${API_URL}/site-settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      await parseErrorResponse(res, 'Не вдалося зберегти налаштування сайту'),
    );
  }

  return (await res.json()) as SiteSettings;
}
