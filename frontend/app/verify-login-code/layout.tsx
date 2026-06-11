import type { Metadata } from 'next';

// Службовий auth-маршрут — не індексується.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function VerifyLoginCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
