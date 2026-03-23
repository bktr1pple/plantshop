'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Sprout,
  Package,
  Images,
  Settings2,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const adminNavItems = [
  {
    href: '/admin',
    label: 'Огляд',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/plants',
    label: 'Рослини',
    icon: Sprout,
  },
  {
    href: '/admin/orders',
    label: 'Замовлення',
    icon: Package,
  },
  {
    href: '/admin/media',
    label: 'Медіа',
    icon: Images,
  },
  {
    href: '/admin/settings',
    label: 'Налаштування',
    icon: Settings2,
  },
] as const;

function getPageTitle(pathname: string): string {
  const matched = adminNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return matched?.label ?? 'Адмін панель';
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = getPageTitle(pathname);

  const handleLogout = async () => {
    const loggedOut = await logout();
    if (!loggedOut) {
      return;
    }

    window.location.href = '/';
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <div className="rounded-2xl bg-emerald-500/15 p-2 text-emerald-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-400">
            {settings.siteName}
          </p>
          <h1 className="truncate text-lg font-semibold">Адмін панель</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-5">
        {adminNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-950/40'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-800 px-5 py-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="truncate text-sm font-semibold text-white">
            {user?.name || user?.email || 'ADMIN'}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
            {user?.role ?? 'ADMIN'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="flex-1 border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
          >
            <Link href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Сайт
            </Link>
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:block lg:w-72">
        {sidebar}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Закрити меню"
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-80 max-w-[85vw] shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden dark:border-slate-800 dark:text-slate-200"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  CMS / Admin
                </p>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  {pageTitle}
                </h2>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-950 dark:text-white">
                  {user?.name || user?.email || 'ADMIN'}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
