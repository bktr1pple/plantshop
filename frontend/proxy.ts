import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_CHECK_PATH = "/auth/me";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:3001";

const PROTECTED_PATHS = {
  "/dashboard": {
    requireAuth: true,
  },
  "/admin": {
    requireAuth: true,
    requireRole: "ADMIN",
  },
} as const;

type AuthUser = {
  id?: number;
  email?: string;
  name?: string;
  role?: "USER" | "ADMIN";
};

type AuthCheckResult = {
  status: "authenticated" | "unauthorized" | "unavailable";
  user: AuthUser | null;
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

function isAuthUser(value: unknown): value is AuthUser {
  return typeof value === "object" && value !== null;
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

    if (res.status === 401 || res.status === 403) {
      return {
        status: "unauthorized",
        user: null,
        setCookies,
      } satisfies AuthCheckResult;
    }

    if (!res.ok) {
      return {
        status: "unavailable",
        user: null,
        setCookies,
      } satisfies AuthCheckResult;
    }

    try {
      const data = await res.json();
      const user = isAuthUser(data?.user) ? data.user : null;

      return {
        status: user ? "authenticated" : "unavailable",
        user,
        setCookies,
      } satisfies AuthCheckResult;
    } catch {
      return {
        status: "unavailable",
        user: null,
        setCookies,
      } satisfies AuthCheckResult;
    }
  } catch {
    return {
      status: "unavailable",
      user: null,
      setCookies: [],
    } satisfies AuthCheckResult;
  }
}

export async function proxy(request: NextRequest) {
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

  if (authResult.status === "unauthorized") {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "login");
    const response = NextResponse.redirect(loginUrl);
    appendSetCookies(response, authResult.setCookies);
    return response;
  }

  if (authResult.status === "unavailable") {
    const unavailableUrl = new URL("/auth-unavailable", request.url);
    unavailableUrl.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    const response = NextResponse.redirect(unavailableUrl);
    appendSetCookies(response, authResult.setCookies);
    return response;
  }

  if (!authResult.user) {
    const unavailableUrl = new URL("/auth-unavailable", request.url);
    unavailableUrl.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    const response = NextResponse.redirect(unavailableUrl);
    appendSetCookies(response, authResult.setCookies);
    return response;
  }

  const pathConfig = PROTECTED_PATHS[matchedPath as keyof typeof PROTECTED_PATHS];
  if (
    "requireRole" in pathConfig &&
    pathConfig.requireRole &&
    authResult.user.role !== pathConfig.requireRole
  ) {
    const fallbackUrl = new URL("/forbidden", request.url);
    const response = NextResponse.redirect(fallbackUrl);
    appendSetCookies(response, authResult.setCookies);
    return response;
  }

  const response = NextResponse.next();
  appendSetCookies(response, authResult.setCookies);
  return response;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
