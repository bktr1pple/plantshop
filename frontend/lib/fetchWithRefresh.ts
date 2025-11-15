// lib/fetchWithRefresh.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface FetchWithRefreshResult {
  res: Response | null;
  unauthorized: boolean; // true, если и запрос, и refresh не помогли
}

export async function fetchWithRefresh(
  input: string,
  init: RequestInit = {}
): Promise<FetchWithRefreshResult> {
  const url = input.startsWith('http') ? input : `${API_URL}${input}`;

  let res = await fetch(url, {
    ...init,
    credentials: 'include',
  });

  // Не 401 → возвращаем как есть
  if (res.status !== 401) {
    return { res, unauthorized: false };
  }

  // Пытаемся обновить токен
  const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!refreshRes.ok) {
    // refresh не удался → реально неавторизованный
    return { res, unauthorized: true };
  }

  // Повторяем исходный запрос уже с новым access_token
  res = await fetch(url, {
    ...init,
    credentials: 'include',
  });

  if (res.status === 401 || res.status === 403) {
    return { res, unauthorized: true };
  }

  return { res, unauthorized: false };
}
