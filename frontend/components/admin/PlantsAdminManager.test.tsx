import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { vi } from 'vitest';
import { PlantsAdminManager } from './PlantsAdminManager';

const { mockAddNotification, mockDeleteAdminMedia, mockRefresh } = vi.hoisted(
  () => ({
    mockAddNotification: vi.fn(),
    mockDeleteAdminMedia: vi.fn(),
    mockRefresh: vi.fn(),
  }),
);

vi.mock('@/app/components/NotificationSystem', () => ({
  useNotification: () => ({
    addNotification: mockAddNotification,
  }),
}));

vi.mock('@/components/admin/MediaUploader', () => ({
  MediaUploader: () => <div data-testid="media-uploader">Media uploader</div>,
}));

vi.mock('@/lib/admin-api', () => ({
  deleteAdminMedia: mockDeleteAdminMedia,
}));

describe('PlantsAdminManager', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: mockRefresh,
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    });
    mockAddNotification.mockReset();
    mockDeleteAdminMedia.mockReset();
    mockRefresh.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('фільтрує каталог через пошук', () => {
    render(
      <PlantsAdminManager
        initialPlants={[
          {
            id: 1,
            name: 'Monstera',
            description: 'Велике листя',
            price: 120,
            images: [],
            updatedAt: '2026-03-23T10:00:00.000Z',
          },
          {
            id: 2,
            name: 'Ficus',
            description: 'Офісна рослина',
            price: 95,
            images: [],
            updatedAt: '2026-03-22T10:00:00.000Z',
          },
        ]}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText('Пошук за назвою або описом'),
      {
        target: { value: 'Ficus' },
      },
    );

    expect(screen.getByText('Ficus')).toBeInTheDocument();
    expect(screen.queryByText('Monstera')).not.toBeInTheDocument();
  });

  it('вимагає підтвердження перед видаленням і після confirm видаляє позицію', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <PlantsAdminManager
        initialPlants={[
          {
            id: 1,
            name: 'Monstera',
            description: 'Велике листя',
            price: 120,
            images: [],
            updatedAt: '2026-03-23T10:00:00.000Z',
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText(/буде видалено з каталогу/i),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Видалити' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3001/plants/1',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByText('Monstera')).not.toBeInTheDocument(),
    );
    expect(mockRefresh).toHaveBeenCalled();
  });
});
