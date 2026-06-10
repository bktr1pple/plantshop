import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MediaUploader } from './MediaUploader';

const { mockUploadAdminMedia } = vi.hoisted(() => ({
  mockUploadAdminMedia: vi.fn(),
}));

vi.mock('@/lib/admin-api', () => ({
  uploadAdminMedia: mockUploadAdminMedia,
}));

describe('MediaUploader', () => {
  beforeEach(() => {
    mockUploadAdminMedia.mockReset();
  });

  it('показує помилку для не-image файлу', async () => {
    const onError = vi.fn();

    const { container } = render(
      <MediaUploader
        collection="plants"
        images={[]}
        onChange={vi.fn()}
        onError={onError}
      />,
    );

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [new File(['hello'], 'notes.txt', { type: 'text/plain' })],
      },
    });

    expect(onError).toHaveBeenCalledWith('Дозволено лише зображення.');
    expect(mockUploadAdminMedia).not.toHaveBeenCalled();
  });

  it('завантажує файли і додає їх як temporary items', async () => {
    const onChange = vi.fn();
    const onError = vi.fn();

    mockUploadAdminMedia.mockResolvedValue([
      {
        filename: 'leaf.png',
        url: 'http://localhost:3001/uploads/plants/leaf.png',
        collection: 'plants',
        size: 2048,
        updatedAt: '2026-03-23T12:00:00.000Z',
      },
    ]);

    const { container } = render(
      <MediaUploader
        collection="plants"
        images={[]}
        onChange={onChange}
        onError={onError}
      />,
    );

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [new File(['image'], 'leaf.png', { type: 'image/png' })],
      },
    });

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        {
          id: 'http://localhost:3001/uploads/plants/leaf.png',
          url: 'http://localhost:3001/uploads/plants/leaf.png',
          filename: 'leaf.png',
          isTemporary: true,
        },
      ]),
    );
    expect(onError).not.toHaveBeenCalled();
  });

  it('дозволяє переставити інше зображення як обкладинку', () => {
    const onChange = vi.fn();

    render(
      <MediaUploader
        collection="plants"
        images={[
          {
            id: '1',
            url: 'http://localhost:3001/uploads/plants/cover-1.png',
            filename: 'cover-1.png',
            isTemporary: false,
          },
          {
            id: '2',
            url: 'http://localhost:3001/uploads/plants/cover-2.png',
            filename: 'cover-2.png',
            isTemporary: false,
          },
        ]}
        onChange={onChange}
        onError={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Зробити обкладинкою' }),
    );

    expect(onChange).toHaveBeenCalledWith([
      {
        id: '2',
        url: 'http://localhost:3001/uploads/plants/cover-2.png',
        filename: 'cover-2.png',
        isTemporary: false,
      },
      {
        id: '1',
        url: 'http://localhost:3001/uploads/plants/cover-1.png',
        filename: 'cover-1.png',
        isTemporary: false,
      },
    ]);
  });
});
