import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardOrderDetailRedirectPage from './page';

const { mockRouterReplace, mockUseParams } = vi.hoisted(() => ({
  mockRouterReplace: vi.fn(),
  mockUseParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
  useParams: () => mockUseParams(),
}));

describe('Dashboard order detail redirect page', () => {
  beforeEach(() => {
    mockRouterReplace.mockReset();
    mockUseParams.mockReset();
  });

  it('редіректить валідний orderId у канонічний detail state сторінки history', async () => {
    mockUseParams.mockReturnValue({ id: '77' });

    render(<DashboardOrderDetailRedirectPage />);

    expect(
      screen.getByText('Відкриваємо деталі замовлення...'),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith(
        '/dashboard/orders?orderId=77',
      ),
    );
  });

  it('для невалідного id повертає користувача в список замовлень', async () => {
    mockUseParams.mockReturnValue({ id: 'oops' });

    render(<DashboardOrderDetailRedirectPage />);

    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith('/dashboard/orders'),
    );
  });
});
