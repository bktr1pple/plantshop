import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { vi } from 'vitest';
import { SiteSettingsManager } from './SiteSettingsManager';

const {
  mockAddNotification,
  mockRefreshSettings,
  mockGetAdminSiteSettings,
  mockUpdateAdminSiteSettings,
  mockRouterRefresh,
} = vi.hoisted(() => ({
  mockAddNotification: vi.fn(),
  mockRefreshSettings: vi.fn(),
  mockGetAdminSiteSettings: vi.fn(),
  mockUpdateAdminSiteSettings: vi.fn(),
  mockRouterRefresh: vi.fn(),
}));

vi.mock('@/app/components/NotificationSystem', () => ({
  useNotification: () => ({
    addNotification: mockAddNotification,
  }),
}));

vi.mock('@/contexts/SiteSettingsContext', () => ({
  useSiteSettings: () => ({
    refreshSettings: mockRefreshSettings,
  }),
}));

vi.mock('@/lib/admin-api', () => ({
  getAdminSiteSettings: mockGetAdminSiteSettings,
  updateAdminSiteSettings: mockUpdateAdminSiteSettings,
}));

describe('SiteSettingsManager', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: mockRouterRefresh,
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    });
    mockAddNotification.mockReset();
    mockRefreshSettings.mockReset();
    mockGetAdminSiteSettings.mockReset();
    mockUpdateAdminSiteSettings.mockReset();
    mockRouterRefresh.mockReset();
  });

  it('завантажує налаштування і дозволяє зберегти оновлені дані', async () => {
    mockGetAdminSiteSettings.mockResolvedValue({
      siteName: 'PlantShop',
      siteTagline: 'Теглайн',
      heroTitleLine1: 'Природа',
      heroTitleLine2: 'у сучасному',
      heroTitleLine3: 'дизайні',
      heroSubtitle: 'Hero subtitle',
      heroPrimaryCtaLabel: 'До каталогу',
      heroPrimaryCtaHref: '/plants',
      contactIntro: 'Contact intro',
      footerDescription: 'Footer description',
      footerCtaLabel: "Зв'язатися з нами",
      footerCtaHref: '/contact',
      contactPhoneDisplay: '+38 (067) 123-45-67',
      contactPhoneHref: 'tel:+380671234567',
      contactEmail: 'hello@plantshop.ua',
      contactAddress: 'м. Київ, вул. Зелена, 123',
      showroomHours: 'Пн-Пт: 09:00-18:00',
      messengerLabel: 'Telegram',
      messengerUrl: '#',
      facebookUrl: 'https://facebook.com/plantshop',
      instagramUrl: 'https://instagram.com/plantshop',
    });
    mockUpdateAdminSiteSettings.mockResolvedValue({
      siteName: 'PlantShop Admin',
    });

    render(<SiteSettingsManager />);

    const siteNameInput = await screen.findByDisplayValue('PlantShop');
    fireEvent.change(siteNameInput, {
      target: { value: 'PlantShop Admin' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти зміни' }));

    await waitFor(() =>
      expect(mockUpdateAdminSiteSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          siteName: 'PlantShop Admin',
        }),
      ),
    );
    expect(mockRefreshSettings).toHaveBeenCalled();
    expect(mockRouterRefresh).toHaveBeenCalled();
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
      }),
    );
  });
});
