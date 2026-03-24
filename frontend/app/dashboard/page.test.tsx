import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardPage from './page';

const {
  mockAddNotification,
  mockListCurrentUserOrders,
  mockPush,
} = vi.hoisted(() => ({
  mockAddNotification: vi.fn(),
  mockListCurrentUserOrders: vi.fn(),
  mockPush: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
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

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'user@example.com',
      name: 'Користувач',
      role: 'USER',
    },
    logout: vi.fn().mockResolvedValue(true),
    isLoading: false,
  }),
}));

vi.mock('@/lib/orders', async () => {
  const actual = await vi.importActual<typeof import('@/lib/orders')>(
    '@/lib/orders',
  );

  return {
    ...actual,
    listCurrentUserOrders: mockListCurrentUserOrders,
  };
});

describe('Dashboard page', () => {
  beforeEach(() => {
    mockAddNotification.mockReset();
    mockListCurrentUserOrders.mockReset();
    mockPush.mockReset();
  });

  it('показує реальне останнє замовлення з backend data', async () => {
    mockListCurrentUserOrders.mockResolvedValue([
      {
        id: 42,
        userId: 1,
        status: 'SHIPPED',
        customerName: 'Користувач',
        customerEmail: 'user@example.com',
        customerPhone: '+380501112233',
        deliveryAddress: 'Львів',
        note: 'Дзвінок перед доставкою',
        totalAmount: 680,
        itemCount: 3,
        createdAt: '2026-03-24T12:00:00.000Z',
        updatedAt: '2026-03-24T12:00:00.000Z',
      },
    ]);

    render(<DashboardPage />);

    expect(
      await screen.findByText('Замовлення #42'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Відправлено')).toHaveLength(2);
    expect(screen.getByText('$680.00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Відкрити деталі' }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/dashboard/orders?orderId=42'),
    );
  });

  it('показує чесний empty state, якщо замовлень ще немає', async () => {
    mockListCurrentUserOrders.mockResolvedValue([]);

    render(<DashboardPage />);

    expect(
      await screen.findByText('У вас ще немає замовлень'),
    ).toBeInTheDocument();
  });
});
