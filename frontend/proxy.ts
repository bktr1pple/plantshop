import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_CHECK_PATH = "/auth/me";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4000";

const PROTECTED_PATHS = {
  "/dashboard": {
    requireAuth: true,
    requireAdmin: false,
  },
    "/admin": {
    requireAuth: true,
    requireAdmin: true,
  },
} as const;

function buildApiUrl() {
  const base = INTERNAL_API_URL.replace(/\/+$/, "");
  return base + AUTH_CHECK_PATH;
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

    if (!res.ok) {
      return null;
    }

    try {
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  } catch {
    return null;
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

  // ✅ если рефреш-куки вообще нет — нет смысла дёргать /auth/me
  if (!hasRefreshToken) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "login");
    return NextResponse.redirect(loginUrl);
  }

  // есть refresh_token — можно попробовать аккуратно спросить бек
  const authData = await checkAuth(request);

  if (!authData?.user) {
    // тут есть refresh_token, но /auth/me не вернул юзера
    // даём фронтенду шанс сделать refresh через fetchWithRefresh
    return NextResponse.next();
  }

  const user = authData.user;
  const routeConfig =
    PROTECTED_PATHS[matchedPath as keyof typeof PROTECTED_PATHS];

  if (routeConfig.requireAdmin && !user.isAdmin) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "login");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
