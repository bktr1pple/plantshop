import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const {
  mockAddNotification,
  mockFetchWithRefresh,
  mockPush,
  mockRefresh,
} = vi.hoisted(() => ({
  mockAddNotification: vi.fn(),
  mockFetchWithRefresh: vi.fn(),
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: mockRefresh,
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

vi.mock('@/lib/fetchWithRefresh', () => ({
  fetchWithRefresh: mockFetchWithRefresh,
}));

function setSessionHintCookie() {
  document.cookie = 'ps_session=1';
}

function clearSessionHintCookie() {
  document.cookie = 'ps_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

const authenticatedUser = {
  id: 1,
  email: 'user@example.com',
  name: 'Користувач',
  role: 'USER' as const,
};

function createAuthResponse(user = authenticatedUser) {
  return {
    unauthorized: false,
    temporaryFailure: false,
    res: {
      ok: true,
      json: async () => ({ user }),
    },
  };
}

function AuthHarness() {
  const { user, logout, ensureAuthAndGo } = useAuth();

  return (
    <div>
      <div data-testid="auth-user">{user?.email ?? 'none'}</div>
      <button onClick={() => void logout()}>logout</button>
      <button onClick={() => void ensureAuthAndGo('/dashboard/orders')}>
        go-orders
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockAddNotification.mockReset();
    mockFetchWithRefresh.mockReset();
    mockPush.mockReset();
    mockRefresh.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn());
    // За замовчуванням імітуємо наявну сесію (hint cookie присутній),
    // щоб тести автентифікованого користувача виконували /auth/me на mount.
    setSessionHintCookie();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    clearSessionHintCookie();
  });

  it('не викликає /auth/me для гостя без session-hint cookie', async () => {
    clearSessionHintCookie();

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-user')).toHaveTextContent('none'),
    );
    expect(mockFetchWithRefresh).not.toHaveBeenCalled();
  });

  it('очищає user лише після підтвердженого backend logout', async () => {
    mockFetchWithRefresh.mockResolvedValueOnce(createAuthResponse());
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
    } as Response);

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-user')).toHaveTextContent(
        'user@example.com',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() =>
      expect(screen.getByTestId('auth-user')).toHaveTextContent('none'),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('не очищає user при failed logout і показує помилку', async () => {
    mockFetchWithRefresh
      .mockResolvedValueOnce(createAuthResponse())
      .mockResolvedValueOnce({
        unauthorized: false,
        temporaryFailure: true,
        res: null,
      });
    vi.mocked(global.fetch).mockRejectedValue(new Error('network down'));

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-user')).toHaveTextContent(
        'user@example.com',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'Сервер авторизації тимчасово недоступний',
        }),
      ),
    );
    expect(screen.getByTestId('auth-user')).toHaveTextContent(
      'user@example.com',
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('не робить false logout при temporary auth failure в ensureAuthAndGo', async () => {
    mockFetchWithRefresh
      .mockResolvedValueOnce(createAuthResponse())
      .mockResolvedValueOnce({
        unauthorized: false,
        temporaryFailure: true,
        res: null,
      });

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('auth-user')).toHaveTextContent(
        'user@example.com',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'go-orders' }));

    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'Сервер авторизації тимчасово недоступний',
        }),
      ),
    );
    expect(screen.getByTestId('auth-user')).toHaveTextContent(
      'user@example.com',
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
