"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        // Виклик API бекенду (NestJS)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include", // щоб передавались cookies
        });

        // Очистка localStorage (якщо зберігався токен)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Перенаправлення на сторінку логіну
        router.push("/signin");
      } catch (error) {
        console.error("Logout error:", error);
        router.push("/signin");
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-gray-600">Вихід із системи...</p>
    </div>
  );
}
