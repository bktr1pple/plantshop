import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_CHECK_PATH = "/auth/me";

// Базовый URL именно для middleware / серверных запросов
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
      console.warn(`Auth check failed with status: ${res.status}`);
      return null;
    }

    try {
      const data = await res.json();
      console.log("Auth data in middleware:", data);
      return data; // { user: {...} }
    } catch (err) {
      console.warn("Failed to parse auth response:", err);
      return null;
    }
  } catch (err) {
    console.error("Auth check exception:", err);
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

  // Проверяем, есть ли вообще refresh_token в куках
  const cookieHeader = request.headers.get("cookie") || "";
  const hasRefreshToken = cookieHeader.includes("refresh_token=");

  const authData = await checkAuth(request);

  // ❌ Нет пользователя по /auth/me
  if (!authData?.user) {
    // ⚠️ Но есть refresh_token → даём пройти, пусть фронт попробует сделать refresh
    if (hasRefreshToken) {
      console.log("Middleware: no user from /auth/me, but refresh_token exists → letting request pass to client");
      return NextResponse.next();
    }

    // ❌ Нет ни user, ни refresh_token → реально неавторизованный → редиректим на /login
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "login");  
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Пользователь есть
  const user = authData.user;
  const routeConfig = PROTECTED_PATHS[matchedPath as keyof typeof PROTECTED_PATHS];

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
