// lib/fetchWithRefresh.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const AUTH_CHECK_PATH = '/auth/me';

export interface FetchResult {
  res: Response | null;
  unauthorized: boolean;
  temporaryFailure: boolean;
}

type RecoveryStatus = 'authenticated' | 'unauthorized' | 'unavailable';
let authRecoveryPromise: Promise<RecoveryStatus> | null = null;

function resolveUrl(input: string): URL {
  return new URL(input, API_URL);
}

function isAuthEndpoint(pathname: string): boolean {
  return pathname.startsWith('/auth/');
}

function isRecoveryCandidate(res: Response | null): boolean {
  if (!res) {
    return true;
  }

  return res.status === 401 || res.status >= 500;
}

function canRetryRequest(method: string, res: Response | null): boolean {
  const normalizedMethod = method.toUpperCase();

  if (normalizedMethod === 'POST') {
    return !!res && res.status === 401;
  }

  return true;
}

async function checkAuthStatus(): Promise<RecoveryStatus> {
  if (authRecoveryPromise) {
    return authRecoveryPromise;
  }

  authRecoveryPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}${AUTH_CHECK_PATH}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (res.status === 401 || res.status === 403) {
        return 'unauthorized';
      }

      if (!res.ok) {
        return 'unavailable';
      }

      const data = (await res.json().catch(() => null)) as
        | { user?: unknown }
        | null;

      return data?.user ? 'authenticated' : 'unavailable';
    } catch {
      return 'unavailable';
    } finally {
      authRecoveryPromise = null;
    }
  })();

  return authRecoveryPromise;
}

async function doRequest(input: string, init: RequestInit): Promise<Response> {
  const resolvedUrl = resolveUrl(input);
  const apiOrigin = new URL(API_URL).origin;
  if (resolvedUrl.origin !== apiOrigin) {
    throw new Error('Cross-origin API request is not allowed');
  }

  return fetch(resolvedUrl.toString(), {
    ...init,
    credentials: 'include',
  });
}

export async function fetchWithRefresh(
  input: string,
  init: RequestInit = {},
): Promise<FetchResult> {
  const url = resolveUrl(input);
  const method = (init.method ?? 'GET').toUpperCase();

  let firstResponse: Response | null = null;

  try {
    firstResponse = await doRequest(input, init);
  } catch {
    firstResponse = null;
  }

  if (firstResponse?.ok) {
    return { res: firstResponse, unauthorized: false, temporaryFailure: false };
  }

  if (isAuthEndpoint(url.pathname)) {
    if (!firstResponse) {
      return { res: null, unauthorized: false, temporaryFailure: true };
    }

    if (firstResponse.status === 401 || firstResponse.status === 403) {
      return { res: firstResponse, unauthorized: true, temporaryFailure: false };
    }

    return { res: firstResponse, unauthorized: false, temporaryFailure: true };
  }

  if (!isRecoveryCandidate(firstResponse)) {
    return {
      res: firstResponse,
      unauthorized: false,
      temporaryFailure: true,
    };
  }

  const authStatus = await checkAuthStatus();

  if (authStatus === 'unauthorized') {
    return {
      res: firstResponse,
      unauthorized: true,
      temporaryFailure: false,
    };
  }

  if (authStatus === 'unavailable') {
    return {
      res: firstResponse,
      unauthorized: false,
      temporaryFailure: true,
    };
  }

  if (!canRetryRequest(method, firstResponse)) {
    return {
      res: firstResponse,
      unauthorized: false,
      temporaryFailure: true,
    };
  }

  try {
    const retryResponse = await doRequest(input, init);

    if (retryResponse.ok) {
      return { res: retryResponse, unauthorized: false, temporaryFailure: false };
    }

    return {
      res: retryResponse,
      unauthorized: false,
      temporaryFailure: true,
    };
  } catch {
    return {
      res: firstResponse,
      unauthorized: false,
      temporaryFailure: true,
    };
  }
}
