import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { vi } from 'vitest';
import { AdminShell } from './AdminShell';

const { mockLogout } = vi.hoisted(() => ({
  mockLogout: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Адмін',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
    logout: mockLogout,
  }),
}));

vi.mock('@/contexts/SiteSettingsContext', () => ({
  useSiteSettings: () => ({
    settings: {
      siteName: 'PlantShop CMS',
    },
  }),
}));

vi.mock('@/components/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
    isAnimating: false,
    isLoaded: true,
  }),
}));

describe('AdminShell', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/admin/plants');
    mockLogout.mockReset();
  });

  it('рендерить shell, навігацію та контент сторінки', () => {
    render(
      <AdminShell>
        <div>Тестовий контент</div>
      </AdminShell>,
    );

    expect(screen.getAllByText('Адмін панель').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Рослини').length).toBeGreaterThan(0);
    expect(screen.getByText('PlantShop CMS')).toBeInTheDocument();
    expect(screen.getAllByText('Адмін').length).toBeGreaterThan(0);
    expect(screen.getByText('Тестовий контент')).toBeInTheDocument();
  });
});
