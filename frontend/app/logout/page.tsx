"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      const loggedOut = await logout();
      if (loggedOut) {
        router.replace("/");
        return;
      }

      setFailed(true);
    };

    void performLogout();
  }, [logout, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-center text-lg text-gray-600">
        {failed
          ? "Не вдалося завершити сеанс. Перевірте з'єднання і спробуйте ще раз."
          : "Вихід із системи..."}
      </p>
    </div>
  );
}
