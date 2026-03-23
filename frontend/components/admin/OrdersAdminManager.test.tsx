import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { OrdersAdminManager } from './OrdersAdminManager';

const {
  mockAddNotification,
  mockListAdminOrders,
  mockGetAdminOrder,
  mockUpdateAdminOrderStatus,
} = vi.hoisted(() => ({
  mockAddNotification: vi.fn(),
  mockListAdminOrders: vi.fn(),
  mockGetAdminOrder: vi.fn(),
  mockUpdateAdminOrderStatus: vi.fn(),
}));

vi.mock('@/app/components/NotificationSystem', () => ({
  useNotification: () => ({
    addNotification: mockAddNotification,
  }),
}));

vi.mock('@/components/SafeImage', () => ({
  SafeImage: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean },
  ) => {
    const imageProps = { ...props };
    delete imageProps.fill;

    return <img {...imageProps} alt={props.alt} />;
  },
}));

vi.mock('@/components/ui/select', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const SelectContext = React.createContext<{
    value?: string;
    disabled?: boolean;
    onValueChange?: (value: string) => void;
  }>({});

  return {
    Select: ({
      value,
      disabled,
      onValueChange,
      children,
    }: {
      value?: string;
      disabled?: boolean;
      onValueChange?: (value: string) => void;
      children: React.ReactNode;
    }) => (
      <SelectContext.Provider value={{ value, disabled, onValueChange }}>
        {children}
      </SelectContext.Provider>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => {
      const context = React.useContext(SelectContext);

      return (
        <button type="button" data-testid="status-trigger" disabled={context.disabled}>
          {children}
          <span>{context.value}</span>
        </button>
      );
    },
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectItem: ({
      value,
      children,
    }: {
      value: string;
      children: React.ReactNode;
    }) => {
      const context = React.useContext(SelectContext);

      return (
        <button
          type="button"
          data-testid={`status-option-${value}`}
          disabled={context.disabled}
          onClick={() => context.onValueChange?.(value)}
        >
          {children}
        </button>
      );
    },
  };
});

vi.mock('@/lib/orders', async () => {
  const actual = await vi.importActual<typeof import('@/lib/orders')>(
    '@/lib/orders',
  );

  return {
    ...actual,
    listAdminOrders: mockListAdminOrders,
    getAdminOrder: mockGetAdminOrder,
    updateAdminOrderStatus: mockUpdateAdminOrderStatus,
  };
});

describe('OrdersAdminManager', () => {
  beforeEach(() => {
    mockAddNotification.mockReset();
    mockListAdminOrders.mockReset();
    mockGetAdminOrder.mockReset();
    mockUpdateAdminOrderStatus.mockReset();
  });

  it('завантажує список замовлень і дозволяє адміну оновити статус', async () => {
    mockListAdminOrders.mockResolvedValue([
      {
        id: 21,
        userId: 7,
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
    ]);
    mockGetAdminOrder.mockResolvedValue({
      id: 21,
      userId: 7,
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
    });
    mockUpdateAdminOrderStatus.mockResolvedValue({
      id: 21,
      userId: 7,
      status: 'SHIPPED',
      customerName: 'Іван',
      customerEmail: 'user@example.com',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ',
      note: null,
      totalAmount: 240,
      itemCount: 2,
      createdAt: '2026-03-24T12:00:00.000Z',
      updatedAt: '2026-03-25T12:00:00.000Z',
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
    });

    render(<OrdersAdminManager />);

    await screen.findByRole('button', { name: /Замовлення #21/i });
    expect(await screen.findByText('Monstera')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('status-trigger'));
    fireEvent.click(screen.getByTestId('status-option-SHIPPED'));

    await waitFor(() =>
      expect(mockUpdateAdminOrderStatus).toHaveBeenCalledWith(21, 'SHIPPED'),
    );
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        title: 'Статус замовлення оновлено',
      }),
    );
  });
});
