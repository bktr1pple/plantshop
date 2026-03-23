import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import OrdersPage from './page';

const {
  mockListCurrentUserOrders,
  mockGetCurrentUserOrder,
  mockRouterPush,
} = vi.hoisted(() => ({
  mockListCurrentUserOrders: vi.fn(),
  mockGetCurrentUserOrder: vi.fn(),
  mockRouterPush: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/SafeImage', () => ({
  SafeImage: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt} />
  ),
}));

vi.mock('@/lib/orders', async () => {
  const actual = await vi.importActual<typeof import('@/lib/orders')>(
    '@/lib/orders',
  );

  return {
    ...actual,
    listCurrentUserOrders: mockListCurrentUserOrders,
    getCurrentUserOrder: mockGetCurrentUserOrder,
  };
});

describe('Dashboard orders page', () => {
  beforeEach(() => {
    mockListCurrentUserOrders.mockReset();
    mockGetCurrentUserOrder.mockReset();
    mockRouterPush.mockReset();
  });

  it('завантажує реальну історію замовлень і показує detail для вибраного запису', async () => {
    mockListCurrentUserOrders.mockResolvedValue([
      {
        id: 10,
        userId: 1,
        status: 'PENDING',
        customerName: 'Іван',
        customerEmail: 'user@example.com',
        customerPhone: '+380671234567',
        deliveryAddress: 'Київ',
        note: null,
        totalAmount: 240,
        itemCount: 2,
        createdAt: '2026-03-24T12:00:00.000Z',
        updatedAt: '2026-03-24T12:00:00.000Z',
      },
      {
        id: 11,
        userId: 1,
        status: 'SHIPPED',
        customerName: 'Іван',
        customerEmail: 'user@example.com',
        customerPhone: '+380671234567',
        deliveryAddress: 'Львів',
        note: 'Швидка доставка',
        totalAmount: 120,
        itemCount: 1,
        createdAt: '2026-03-23T12:00:00.000Z',
        updatedAt: '2026-03-23T12:00:00.000Z',
      },
    ]);

    mockGetCurrentUserOrder
      .mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'PENDING',
        customerName: 'Іван',
        customerEmail: 'user@example.com',
        customerPhone: '+380671234567',
        deliveryAddress: 'Київ',
        note: null,
        totalAmount: 240,
        itemCount: 2,
        createdAt: '2026-03-24T12:00:00.000Z',
        updatedAt: '2026-03-24T12:00:00.000Z',
        items: [
          {
            id: 1,
            plantId: 1,
            plantName: 'Monstera',
            plantImage: '/images/placeholder.jpg',
            unitPrice: 120,
            quantity: 2,
            lineTotal: 240,
            createdAt: '2026-03-24T12:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        id: 11,
        userId: 1,
        status: 'SHIPPED',
        customerName: 'Іван',
        customerEmail: 'user@example.com',
        customerPhone: '+380671234567',
        deliveryAddress: 'Львів',
        note: 'Швидка доставка',
        totalAmount: 120,
        itemCount: 1,
        createdAt: '2026-03-23T12:00:00.000Z',
        updatedAt: '2026-03-23T12:00:00.000Z',
        items: [
          {
            id: 2,
            plantId: 2,
            plantName: 'Ficus',
            plantImage: '/images/placeholder.jpg',
            unitPrice: 120,
            quantity: 1,
            lineTotal: 120,
            createdAt: '2026-03-23T12:00:00.000Z',
          },
        ],
      });

    render(<OrdersPage />);

    await screen.findByRole('button', { name: /Замовлення #10/i });
    expect(mockGetCurrentUserOrder).toHaveBeenCalledWith(10);
    expect(screen.getByText('Monstera')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Замовлення #11/i }));

    await waitFor(() => expect(mockGetCurrentUserOrder).toHaveBeenCalledWith(11));
    expect(await screen.findByText('Ficus')).toBeInTheDocument();
    expect(screen.getByText('Швидка доставка')).toBeInTheDocument();
  });

  it('показує чесний empty state, якщо замовлень ще немає', async () => {
    mockListCurrentUserOrders.mockResolvedValue([]);

    render(<OrdersPage />);

    expect(
      await screen.findByText('У вас ще немає замовлень'),
    ).toBeInTheDocument();
  });
});
