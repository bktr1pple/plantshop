// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""; // если пусто — считаем, что API на том же домене
const AUTH_CHECK_PATH = "/auth/me";

function buildApiUrl(request: NextRequest) {
  if (!API_URL) {
    // API на том же домене/host — используем относительный путь (абсолютно корректно для middleware)
    return new URL(AUTH_CHECK_PATH, request.url).toString();
  } else {
    // API на другом домене
    return (API_URL + AUTH_CHECK_PATH).replace(/([^:]\/)\/+/g, "$1");
  }
}

export async function middleware(request: NextRequest) {
  try {
    console.log("🔥 Middleware triggered for:", request.nextUrl.pathname);

    // Что реально пришло в Cookie заголовке
    const incomingCookies = request.headers.get("cookie") || "";
    console.log("🍪 Incoming cookies header:", incomingCookies ? incomingCookies : "<empty>");

    const apiUrl = buildApiUrl(request);
    console.log("➡️ Calling auth check at:", apiUrl);

    // Формируем заголовки для запроса
    const headers: Record<string, string> = {
      // Прокидываем cookie вручную (работает для httpOnly cookies)
      cookie: incomingCookies,
      // Прокидываем origin (полезно когда бэкенд на другом домене и смотрит Origin/CORS)
      origin: request.nextUrl.origin,
      // дополнительные хэдеры если нужно
      "x-forwarded-host": request.headers.get("host") || "",
      "x-requested-with": "XMLHttpRequest",
    };

    const res = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    console.log("🔁 Auth API status:", res.status);

    // Попробуем распарсить тело (без ошибки)
    let bodyText = "";
    try {
      bodyText = await res.text();
      // Пытаемся форматировать JSON для читаемости
      try {
        const parsed = JSON.parse(bodyText);
        console.log("📦 Auth API body (parsed):", parsed);
      } catch {
        console.log("📄 Auth API body (text):", bodyText);
      }
    } catch (err) {
      console.warn("⚠️ Failed to read auth response body:", err);
    }

    // Логика принятия решения:
    // - если 200 OK и вернулся объект с user — пускаем дальше
    // - иначе — редиректим
    if (res.ok) {
      try {
        const json = JSON.parse(bodyText || "{}");
        if (json && json.user) {
          console.log("✅ Middleware: user valid — allowed:", json.user.email ?? json.user.id ?? "<no-ident>");
          return NextResponse.next();
        } else {
          console.warn("🚫 Middleware: /auth/me returned ok but no user field");
        }
      } catch (err) {
        console.warn("⚠️ Middleware: cannot parse /auth/me JSON:", err);
      }
    } else {
      console.warn("🚫 Middleware: /auth/me returned non-OK status", res.status);
    }
  } catch (err) {
    console.error("❌ Middleware exception:", err);
  }

  // fallback: редирект на /
  const loginUrl = new URL("/", request.url);
  console.log("➡️ Middleware redirect to /");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
