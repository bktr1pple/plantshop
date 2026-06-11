import type { Metadata } from 'next';

// Приватний кабінет — повністю закритий від індексації.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
