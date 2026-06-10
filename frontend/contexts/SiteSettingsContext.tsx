'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { API_URL, defaultSiteSettings, type SiteSettings } from '@/lib/site-settings';

type SiteSettingsContextValue = {
  settings: SiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(
  undefined,
);

export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/site-settings/public`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as Partial<SiteSettings>;
      setSettings((prev) => ({
        ...prev,
        ...data,
      }));
    } catch {
      // Залишаємо дефолтні налаштування, щоб storefront не ламався.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSettings();
  }, [refreshSettings]);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);

  if (!context) {
    throw new Error(
      'useSiteSettings must be used within a SiteSettingsProvider',
    );
  }

  return context;
}
