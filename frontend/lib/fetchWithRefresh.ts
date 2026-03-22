// lib/fetchWithRefresh.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface FetchResult {
  res: Response | null;
  unauthorized: boolean;
  temporaryFailure: boolean;
}

export async function fetchWithRefresh(
  input: string,
  init: RequestInit = {}
): Promise<FetchResult> {
  const url = input.startsWith('http') ? input : `${API_URL}${input}`;

  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
    });

    if (res.status === 401 || res.status === 403) {
      return { res, unauthorized: true, temporaryFailure: false };
    }

    if (!res.ok) {
      return { res, unauthorized: false, temporaryFailure: true };
    }

    return { res, unauthorized: false, temporaryFailure: false };
  } catch (error) {
    console.error('Fetch error:', error);

    return { res: null, unauthorized: false, temporaryFailure: true };
  }
}
