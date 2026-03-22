import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_CHECK_PATH = "/auth/me";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:3001";

const PROTECTED_PATHS = {
  "/dashboard": {
    requireAuth: true,
  },
} as const;

type AuthCheckResult = {
  user: unknown | null;
  setCookies: string[];
};

function buildApiUrl() {
  const base = INTERNAL_API_URL.replace(/\/+$/, "");
  return base + AUTH_CHECK_PATH;
}

function splitSetCookieHeader(headerValue: string): string[] {
  return headerValue
    .split(/,(?=\s*[^;,=\s]+=[^;,]+)/)
    .map((cookie) => cookie.trim())
    .filter(Boolean);
}

function extractSetCookies(response: Response): string[] {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    return [];
  }

  return splitSetCookieHeader(setCookie);
}

function appendSetCookies(
  response: NextResponse,
  setCookies: string[],
) {
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }
}

async function checkAuth(request: NextRequest) {
  try {
    const incomingCookies = request.headers.get("cookie") || "";
    const apiUrl = buildApiUrl();

    const headers: Record<string, string> = {
      cookie: incomingCookies,
      origin: request.nextUrl.origin,
      "x-forwarded-host": request.headers.get("host") || "",
      "x-requested-with": "XMLHttpRequest",
    };

    const res = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const setCookies = extractSetCookies(res);

    if (!res.ok) {
      return { user: null, setCookies };
    }

    try {
      const data = await res.json();
      return {
        user: data?.user ?? null,
        setCookies,
      } satisfies AuthCheckResult;
    } catch {
      return { user: null, setCookies };
    }
  } catch {
    return { user: null, setCookies: [] };
  }
}

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const matchedPath = Object.keys(PROTECTED_PATHS).find((protectedPath) =>
    path.startsWith(protectedPath)
  );

  if (!matchedPath) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const hasRefreshToken = cookieHeader.includes("refresh_token=");

  if (!hasRefreshToken) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "login");
    return NextResponse.redirect(loginUrl);
  }

  const authResult = await checkAuth(request);

  if (!authResult.user) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "login");
    const response = NextResponse.redirect(loginUrl);
    appendSetCookies(response, authResult.setCookies);
    return response;
  }

  const response = NextResponse.next();
  appendSetCookies(response, authResult.setCookies);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
