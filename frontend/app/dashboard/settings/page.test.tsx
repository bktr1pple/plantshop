import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SettingsPage from './page';

const {
  mockAddNotification,
  mockCheckAuth,
  mockFetchWithRefresh,
  mockChangePassword,
  mockPush,
  mockRefresh,
} =
  vi.hoisted(() => ({
    mockAddNotification: vi.fn(),
    mockCheckAuth: vi.fn(),
    mockFetchWithRefresh: vi.fn(),
    mockChangePassword: vi.fn(),
    mockPush: vi.fn(),
    mockRefresh: vi.fn(),
  }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/app/components/NotificationSystem', () => ({
  useNotification: () => ({
    addNotification: mockAddNotification,
  }),
}));

function createMockUser() {
  return {
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
  };
}

// Стабільна референція user між рендерами (як стан реального AuthContext);
// тест оновлює її через mockCheckAuth, імітуючи повторний /auth/me.
let mockUser: ReturnType<typeof createMockUser> = createMockUser();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    checkAuth: mockCheckAuth,
    isLoading: false,
  }),
}));

vi.mock('@/lib/fetchWithRefresh', () => ({
  fetchWithRefresh: mockFetchWithRefresh,
}));

vi.mock('@/lib/auth-security', () => ({
  changePassword: mockChangePassword,
  getSecurityErrorMessage: (code: string | undefined, fallback: string) =>
    code ? `mapped:${code}` : fallback,
}));

const savedUserResponse = {
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
  profileVisibility: 'friends',
  dataSharing: false,
  personalizedAds: false,
  role: 'USER',
} as const;

describe('Dashboard settings page', () => {
  beforeEach(() => {
    mockAddNotification.mockReset();
    mockCheckAuth.mockReset();
    mockChangePassword.mockReset();
    mockPush.mockReset();
    mockRefresh.mockReset();
    mockUser = createMockUser();
    // Повторний /auth/me після save повертає оновленого користувача.
    mockCheckAuth.mockImplementation(async () => {
      mockUser = { ...savedUserResponse };
      return true;
    });
    mockFetchWithRefresh.mockReset();
    mockFetchWithRefresh.mockResolvedValue({
      unauthorized: false,
      temporaryFailure: false,
      res: {
        ok: true,
        json: async () => ({
          user: { ...savedUserResponse },
        }),
      },
    });
  });

  it('зберігає current-user settings через реальний PATCH /auth/me contract', async () => {
    render(<SettingsPage />);

    const saveButton = screen.getByRole('button', { name: 'Зберегти зміни' });
    expect(saveButton).toBeDisabled();

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

    expect(saveButton).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Сповіщення' }));
    let orderUpdatesToggle: HTMLElement | undefined;
    await waitFor(() => {
      orderUpdatesToggle = screen
        .getAllByRole('switch')
        .find((toggle) =>
          toggle.textContent?.includes('Оновлення замовлень'),
        );
      expect(orderUpdatesToggle).toBeTruthy();
    });
    fireEvent.click(orderUpdatesToggle!);

    fireEvent.click(saveButton);

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
    const parsedBody = JSON.parse(requestInit.body) as Record<string, unknown>;
    expect(parsedBody).toMatchObject({
      name: 'Оновлений користувач',
      phone: '+380501112233',
      orderUpdates: false,
    });
    // Фейкових privacy-контролів більше немає — PATCH їх не надсилає.
    expect(parsedBody).not.toHaveProperty('profileVisibility');
    expect(parsedBody).not.toHaveProperty('dataSharing');
    expect(parsedBody).not.toHaveProperty('personalizedAds');

    await waitFor(() => expect(mockCheckAuth).toHaveBeenCalled());
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        title: 'Налаштування збережено',
      }),
    );
    await waitFor(() => expect(saveButton).toBeDisabled());
  });

  it('показує повідомлення бекенда, якщо PATCH /auth/me повернув validation error', async () => {
    mockFetchWithRefresh.mockResolvedValueOnce({
      unauthorized: false,
      temporaryFailure: true,
      res: {
        ok: false,
        status: 400,
        json: async () => ({
          message: ['bio must be shorter than or equal to 1000 characters'],
        }),
      },
    });

    render(<SettingsPage />);

    fireEvent.change(screen.getByDisplayValue('Люблю рослини'), {
      target: { value: 'Оновлений опис' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти зміни' }));

    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Не вдалося зберегти налаштування',
          message: 'bio must be shorter than or equal to 1000 characters',
        }),
      ),
    );
    expect(mockCheckAuth).not.toHaveBeenCalled();
  });

  it('не показує success toast, якщо після save не вдалося підтвердити сесію', async () => {
    mockCheckAuth.mockResolvedValueOnce(false);

    render(<SettingsPage />);

    fireEvent.change(screen.getByDisplayValue('Люблю рослини'), {
      target: { value: 'Оновлений опис' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти зміни' }));

    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'Налаштування збережено',
          message:
            'Дані оновлено, але не вдалося повторно підтвердити сесію. Оновіть сторінку, якщо зміни не відображаються.',
        }),
      ),
    );
    expect(mockAddNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        title: 'Налаштування збережено',
      }),
    );
  });

  it('не відправляє PATCH без змін у формі', () => {
    render(<SettingsPage />);

    const saveButton = screen.getByRole('button', { name: 'Зберегти зміни' });
    const resetButton = screen.getByRole('button', { name: 'Скинути' });

    expect(saveButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
    expect(mockFetchWithRefresh).not.toHaveBeenCalled();
  });

  it('змінює пароль через реальний backend-backed flow і веде в re-login', async () => {
    mockChangePassword.mockResolvedValue({
      success: true,
      message: 'Пароль успішно змінено. Увійдіть знову.',
    });
    mockCheckAuth.mockResolvedValueOnce(false);

    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Безпека' }));

    const currentPasswordInput = await screen.findByLabelText('Поточний пароль');
    const newPasswordInput = await screen.findByLabelText('Новий пароль');
    const confirmPasswordInput = await screen.findByLabelText('Підтвердження');

    fireEvent.change(currentPasswordInput, {
      target: { value: 'old-password' },
    });
    fireEvent.change(newPasswordInput, {
      target: { value: 'new-password1' },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'new-password1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Змінити пароль' }));

    await waitFor(() =>
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'old-password',
        newPassword: 'new-password1',
        confirmPassword: 'new-password1',
      }),
    );
    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Пароль змінено',
        }),
      ),
    );
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockRefresh).toHaveBeenCalled();
  });
});
