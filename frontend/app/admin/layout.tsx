import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';

// Адмінка — повністю закрита від індексації.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
