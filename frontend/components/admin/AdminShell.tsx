'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useTheme } from '@/components/ThemeContext';

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
  const exactMatch = adminNavItems.find((item) => pathname === item.href);
  if (exactMatch) {
    return exactMatch.label;
  }

  const nestedMatch = adminNavItems
    .filter((item) => item.href !== '/admin')
    .find((item) => pathname.startsWith(`${item.href}/`));

  return nestedMatch?.label ?? 'Адмін панель';
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const { theme, toggleTheme, isAnimating, isLoaded } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  const pageTitle = getPageTitle(pathname);
  const canShowResolvedTheme = isLoaded && hasHydrated;
  const AdminThemeIcon = canShowResolvedTheme && theme === 'dark' ? Sun : Moon;
  const themeToggleLabel =
    canShowResolvedTheme && theme === 'dark'
      ? 'Увімкнути світлу тему'
      : 'Увімкнути темну тему';
  const sidebarToggleLabel = sidebarCollapsed
    ? 'Показати бічну панель'
    : 'Сховати бічну панель';

  useEffect(() => {
    const timeout = window.setTimeout(() => setHasHydrated(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const handleLogout = async () => {
    const loggedOut = await logout();
    if (!loggedOut) {
      return;
    }

    window.location.href = '/';
  };

  const sidebar = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 dark:border-slate-800">
        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {settings.siteName}
          </p>
          <h1 className="truncate text-lg font-semibold">Адмін панель</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-5">
        {adminNavItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-200 px-5 py-5 dark:border-slate-800">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
            {user?.name || user?.email || 'ADMIN'}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            {user?.role ?? 'ADMIN'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="flex-1"
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
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:z-40 lg:block lg:w-72',
          sidebarCollapsed && 'lg:hidden',
        )}
      >
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

      <div
        className={cn(
          'transition-[padding] duration-300 ease-out',
          sidebarCollapsed ? 'lg:pl-0' : 'lg:pl-72',
        )}
      >
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden dark:border-slate-800 dark:text-slate-200"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden lg:inline-flex"
                aria-label={sidebarToggleLabel}
                title={sidebarToggleLabel}
                onClick={() => setSidebarCollapsed((prev) => !prev)}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Керування сайтом
                </p>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  {pageTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={themeToggleLabel}
                disabled={!canShowResolvedTheme || isAnimating}
                onClick={toggleTheme}
              >
                <AdminThemeIcon className="h-4 w-4" />
              </Button>

              <div className="hidden rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-right dark:border-slate-800 dark:bg-slate-900 sm:block">
                <p className="text-sm font-medium text-slate-950 dark:text-white">
                  {user?.name || user?.email || 'ADMIN'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
