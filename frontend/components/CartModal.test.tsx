import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CartModal } from './CartModal';

const {
  mockAddNotification,
  mockRouterPush,
  mockEnsureAuthAndGo,
  mockClearCart,
  mockCreateCurrentUserOrder,
  mockAuthState,
  mockCartState,
} = vi.hoisted(() => ({
  mockAddNotification: vi.fn(),
  mockRouterPush: vi.fn(),
  mockEnsureAuthAndGo: vi.fn(),
  mockClearCart: vi.fn(),
  mockCreateCurrentUserOrder: vi.fn(),
  mockAuthState: {
    user: {
      id: 1,
      email: 'user@example.com',
      name: 'Іван',
      phone: '+380671234567',
      address: 'Київ',
    },
    isLoading: false,
  },
  mockCartState: {
    cartItems: [
      {
        id: '1',
        name: 'Monstera',
        price: 120,
        image: '/images/placeholder.jpg',
        quantity: 2,
      },
    ],
    totalPrice: 240,
    totalItems: 2,
  },
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt} />
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock('@/app/components/NotificationSystem', () => ({
  useNotification: () => ({
    addNotification: mockAddNotification,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthState.user,
    isLoading: mockAuthState.isLoading,
    ensureAuthAndGo: mockEnsureAuthAndGo,
  }),
}));

vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    cartItems: mockCartState.cartItems,
    updateQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    totalPrice: mockCartState.totalPrice,
    totalItems: mockCartState.totalItems,
    clearCart: mockClearCart,
  }),
}));

vi.mock('@/lib/orders', async () => {
  const actual = await vi.importActual<typeof import('@/lib/orders')>(
    '@/lib/orders',
  );

  return {
    ...actual,
    createCurrentUserOrder: mockCreateCurrentUserOrder,
  };
});

describe('CartModal', () => {
  beforeEach(() => {
    mockAddNotification.mockReset();
    mockRouterPush.mockReset();
    mockEnsureAuthAndGo.mockReset();
    mockClearCart.mockReset();
    mockCreateCurrentUserOrder.mockReset();
    mockAuthState.user = {
      id: 1,
      email: 'user@example.com',
      name: 'Іван',
      phone: '+380671234567',
      address: 'Київ',
    };
    mockAuthState.isLoading = false;
    mockCartState.cartItems = [
      {
        id: '1',
        name: 'Monstera',
        price: 120,
        image: '/images/placeholder.jpg',
        quantity: 2,
      },
    ];
    mockCartState.totalPrice = 240;
    mockCartState.totalItems = 2;
  });

  it('створює реальне замовлення для authenticated user і очищає кошик після підтвердження backend', async () => {
    mockCreateCurrentUserOrder.mockResolvedValue({
      id: 77,
      userId: 1,
      status: 'PENDING',
      customerName: 'Іван',
      customerEmail: 'user@example.com',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ',
      note: null,
      totalAmount: 240,
      itemCount: 1,
      createdAt: '2026-03-24T12:00:00.000Z',
      updatedAt: '2026-03-24T12:00:00.000Z',
      items: [],
    });

    const onClose = vi.fn();
    render(<CartModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Підтвердити замовлення' }));

    await waitFor(() =>
      expect(mockCreateCurrentUserOrder).toHaveBeenCalledWith({
        customerName: 'Іван',
        customerPhone: '+380671234567',
        deliveryAddress: 'Київ',
        note: undefined,
        items: [{ plantId: 1, quantity: 2 }],
      }),
    );
    expect(mockClearCart).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard/orders/77');
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        title: 'Замовлення створено',
      }),
    );
  });

  it('для неавторизованого користувача не симулює checkout, а веде в auth flow', async () => {
    mockAuthState.user = null;
    mockCartState.cartItems = [
      {
        id: '1',
        name: 'Monstera',
        price: 120,
        image: '/images/placeholder.jpg',
        quantity: 1,
      },
    ];
    mockCartState.totalPrice = 120;
    mockCartState.totalItems = 1;

    const onClose = vi.fn();
    render(<CartModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Увійти для оформлення' }));

    await waitFor(() =>
      expect(mockEnsureAuthAndGo).toHaveBeenCalledWith('/dashboard/orders'),
    );
    expect(mockCreateCurrentUserOrder).not.toHaveBeenCalled();
  });
});
