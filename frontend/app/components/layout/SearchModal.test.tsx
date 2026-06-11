import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SearchModal } from './SearchModal';

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('framer-motion', async (importOriginal) => {
  const React = await import('react');
  const actual = await importOriginal<typeof import('framer-motion')>();
  const MockDiv = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >((props, ref) => <div ref={ref} {...props} />);

  MockDiv.displayName = 'MockMotionDiv';

  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    m: {
      div: MockDiv,
    },
  };
});

describe('SearchModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockPush.mockReset();
    mockOnClose.mockReset();
  });

  const renderModal = () =>
    render(
      <SearchModal
        searchOpen
        searchModalRef={createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>}
        popularSearches={['монстера', 'кактуси']}
        onClose={mockOnClose}
      />,
    );

  it('переходить на /plants із search-параметром після сабміту', () => {
    renderModal();

    fireEvent.change(
      screen.getByPlaceholderText('Пошук рослин у каталозі...'),
      { target: { value: '  фікус  ' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Знайти в каталозі' }));

    expect(mockPush).toHaveBeenCalledWith(
      `/plants?search=${encodeURIComponent('фікус')}`,
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('популярний запит веде на реальний пошук', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'монстера' }));

    expect(mockPush).toHaveBeenCalledWith(
      `/plants?search=${encodeURIComponent('монстера')}`,
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('не виконує навігацію для порожнього запиту', () => {
    renderModal();

    const submitButton = screen.getByRole('button', {
      name: 'Знайти в каталозі',
    });

    expect(submitButton).toBeDisabled();
    fireEvent.click(submitButton);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
