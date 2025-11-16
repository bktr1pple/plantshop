// lib/fetchWithRefresh.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface FetchResult {
  res: Response | null;
  unauthorized: boolean;
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
      return { res, unauthorized: true };
    }

    return { res, unauthorized: false };
  } catch (error) {
    console.error("Fetch error:", error);

    return { res: null, unauthorized: true };
  }
}
