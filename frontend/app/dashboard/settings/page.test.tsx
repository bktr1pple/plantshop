import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SettingsPage from './page';

const { mockAddNotification, mockCheckAuth, mockFetchWithRefresh } =
  vi.hoisted(() => ({
    mockAddNotification: vi.fn(),
    mockCheckAuth: vi.fn(),
    mockFetchWithRefresh: vi.fn(),
  }));

vi.mock('@/app/components/NotificationSystem', () => ({
  useNotification: () => ({
    addNotification: mockAddNotification,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'user@example.com',
      name: 'Користувач',
      phone: '+380671234567',
      address: 'Київ',
      bio: 'Люблю рослини',
      emailNotifications: true,
      orderUpdates: true,
      careReminders: true,
      promotional: false,
      profileVisibility: 'friends',
      dataSharing: false,
      personalizedAds: false,
      role: 'USER',
    },
    checkAuth: mockCheckAuth,
  }),
}));

vi.mock('@/lib/fetchWithRefresh', () => ({
  fetchWithRefresh: mockFetchWithRefresh,
}));

describe('Dashboard settings page', () => {
  beforeEach(() => {
    mockAddNotification.mockReset();
    mockCheckAuth.mockReset();
    mockCheckAuth.mockResolvedValue(true);
    mockFetchWithRefresh.mockReset();
    mockFetchWithRefresh.mockResolvedValue({
      unauthorized: false,
      temporaryFailure: false,
      res: {
        ok: true,
        json: async () => ({
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Оновлений користувач',
            phone: '+380501112233',
            address: 'Львів',
            bio: 'Колекціоную фікуси',
            emailNotifications: true,
            orderUpdates: false,
            careReminders: true,
            promotional: true,
            profileVisibility: 'private',
            dataSharing: true,
            personalizedAds: true,
            role: 'USER',
          },
        }),
      },
    });
  });

  it('зберігає current-user settings через реальний PATCH /auth/me contract', async () => {
    render(<SettingsPage />);

    const nameInput = screen.getByDisplayValue('Користувач');
    const phoneInput = screen.getByDisplayValue('+380671234567');
    const emailInput = screen.getByDisplayValue('user@example.com');

    expect(emailInput).toBeDisabled();

    fireEvent.change(nameInput, {
      target: { value: 'Оновлений користувач' },
    });
    fireEvent.change(phoneInput, {
      target: { value: '+380501112233' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Сповіщення' }));
    let orderUpdatesToggle: HTMLButtonElement | undefined;
    await waitFor(() => {
      orderUpdatesToggle = screen
        .getAllByRole('button')
        .find((button) =>
          button.textContent?.includes('Оновлення замовлень'),
        ) as HTMLButtonElement | undefined;
      expect(orderUpdatesToggle).toBeTruthy();
    });
    fireEvent.click(orderUpdatesToggle!);

    fireEvent.click(screen.getByRole('button', { name: 'Конфіденційність' }));
    let profilePrivateButton: HTMLButtonElement | undefined;
    await waitFor(() => {
      profilePrivateButton = screen
        .getAllByRole('button')
        .find((button) =>
          button.textContent?.includes('Приватний'),
        ) as HTMLButtonElement | undefined;
      expect(profilePrivateButton).toBeTruthy();
    });
    fireEvent.click(profilePrivateButton!);

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти зміни' }));

    await waitFor(() =>
      expect(mockFetchWithRefresh).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const [, requestInit] = mockFetchWithRefresh.mock.calls[0] as [
      string,
      { body: string },
    ];
    expect(JSON.parse(requestInit.body)).toMatchObject({
      profileVisibility: 'private',
    });

    await waitFor(() => expect(mockCheckAuth).toHaveBeenCalled());
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        title: 'Налаштування збережено',
      }),
    );
  });
});
