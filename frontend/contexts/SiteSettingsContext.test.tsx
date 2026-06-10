import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SiteSettingsProvider, useSiteSettings } from './SiteSettingsContext';

function SiteSettingsHarness() {
  const { settings, isLoading } = useSiteSettings();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="site-name">{settings.siteName}</div>
      <div data-testid="hero-title">{settings.heroTitleLine1}</div>
    </div>
  );
}

describe('SiteSettingsContext', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('завантажує публічні налаштування з backend', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        siteName: 'PlantShop Test',
        heroTitleLine1: 'Зелені рішення',
      }),
    } as Response);

    render(
      <SiteSettingsProvider>
        <SiteSettingsHarness />
      </SiteSettingsProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    );
    expect(screen.getByTestId('site-name')).toHaveTextContent(
      'PlantShop Test',
    );
    expect(screen.getByTestId('hero-title')).toHaveTextContent(
      'Зелені рішення',
    );
  });

  it('залишає дефолтні налаштування при помилці backend', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'));

    render(
      <SiteSettingsProvider>
        <SiteSettingsHarness />
      </SiteSettingsProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    );
    expect(screen.getByTestId('site-name')).toHaveTextContent('PlantShop');
  });
});
