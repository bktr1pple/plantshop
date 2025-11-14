// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_CHECK_PATH = "/auth/me";

const PROTECTED_PATHS = {
  '/dashboard': {
    requireAuth: true,
    requireAdmin: false
  },
  '/admin': {
    requireAuth: true,
    requireAdmin: true
  }
} as const;

function buildApiUrl(request: NextRequest) {
  if (!API_URL) {
    return new URL(AUTH_CHECK_PATH, request.url).toString();
  }
  return (API_URL + AUTH_CHECK_PATH).replace(/([^:]\/)\/+/g, "$1");
}

async function checkAuth(request: NextRequest) {
  try {
    const incomingCookies = request.headers.get("cookie") || "";
    const apiUrl = buildApiUrl(request);
    
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
      return data;
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

  const matchedPath = Object.keys(PROTECTED_PATHS).find(protectedPath => 
    path.startsWith(protectedPath)
  );

  if (!matchedPath) {
    return NextResponse.next();
  }

  const authData = await checkAuth(request);

  if (!authData?.user) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const routeConfig = PROTECTED_PATHS[matchedPath as keyof typeof PROTECTED_PATHS];

  if (routeConfig.requireAdmin && !authData.user.isAdmin) {
    const forbiddenUrl = new URL("/", request.url);
    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*"
  ],
};