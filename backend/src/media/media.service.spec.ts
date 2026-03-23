jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  stat: jest.fn(),
}));

jest.mock('./media-storage', () => ({
  buildMediaUrl: jest.fn(
    (collection: string, filename: string) =>
      `http://localhost:3001/uploads/${collection}/${filename}`,
  ),
  deleteManagedUploadFile: jest.fn(),
  ensureUploadDirectories: jest.fn(),
  getCollectionDir: jest.fn((collection: string) => `/virtual/${collection}`),
  isManagedUploadUrl: jest.fn((url: string) =>
    url.startsWith('http://localhost:3001/uploads/'),
  ),
  normalizeMediaCollection: jest.fn((value?: string) =>
    value === 'site' ? 'site' : 'plants',
  ),
  resolveManagedUploadPath: jest.fn((url: string) => `/virtual/${url}`),
}));

import { BadRequestException } from '@nestjs/common';
import { readdir, stat } from 'fs/promises';
import { MediaService } from './media.service';
import { deleteManagedUploadFile, isManagedUploadUrl } from './media-storage';

describe('MediaService', () => {
  let service: MediaService;
  let prismaMock: {
    plant: {
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      plant: {
        findMany: jest.fn(),
      },
    };

    service = new MediaService(prismaMock as never);
    jest.clearAllMocks();
  });

  it('list повертає відсортовану медіатеку з обох колекцій', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['plant.webp'] as never);
    jest.mocked(readdir).mockResolvedValueOnce(['hero.png'] as never);
    jest.mocked(stat).mockResolvedValueOnce({
      size: 2048,
      mtime: new Date('2026-03-23T10:00:00.000Z'),
    } as never);
    jest.mocked(stat).mockResolvedValueOnce({
      size: 1024,
      mtime: new Date('2026-03-24T10:00:00.000Z'),
    } as never);

    const items = await service.list();

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      filename: 'hero.png',
      collection: 'site',
      size: 1024,
    });
    expect(items[1]).toMatchObject({
      filename: 'plant.webp',
      collection: 'plants',
      size: 2048,
    });
  });

  it('deleteByUrl відхиляє сторонні URL', async () => {
    jest.mocked(isManagedUploadUrl).mockReturnValue(false);

    await expect(
      service.deleteByUrl('https://example.com/not-managed.jpg'),
    ).rejects.toThrow(BadRequestException);
  });

  it('deleteByUrl відхиляє файл, який ще використовується', async () => {
    jest.mocked(isManagedUploadUrl).mockReturnValue(true);
    jest.spyOn(service, 'isPlantImageInUse').mockResolvedValue(true);

    await expect(
      service.deleteByUrl('http://localhost:3001/uploads/plants/used.jpg'),
    ).rejects.toThrow(BadRequestException);
  });

  it('deleteByUrl видаляє файл, який більше ніде не використовується', async () => {
    jest.mocked(isManagedUploadUrl).mockReturnValue(true);
    jest.spyOn(service, 'isPlantImageInUse').mockResolvedValue(false);
    jest.mocked(deleteManagedUploadFile).mockResolvedValue(true);

    await expect(
      service.deleteByUrl('http://localhost:3001/uploads/plants/free.jpg'),
    ).resolves.toEqual({ deleted: true });
    expect(deleteManagedUploadFile).toHaveBeenCalledWith(
      'http://localhost:3001/uploads/plants/free.jpg',
    );
  });

  it('isPlantImageInUse знаходить URL серед рослин', async () => {
    prismaMock.plant.findMany.mockResolvedValue([
      {
        images:
          '["http://localhost:3001/uploads/plants/cover.jpg","http://localhost:3001/uploads/plants/extra.jpg"]',
      },
    ]);

    await expect(
      service.isPlantImageInUse(
        'http://localhost:3001/uploads/plants/cover.jpg',
      ),
    ).resolves.toBe(true);
  });

  it('toUploadResponse повертає готовий item для UI', () => {
    expect(service.toUploadResponse('plants', 'leaf.png', 3210)).toMatchObject({
      filename: 'leaf.png',
      collection: 'plants',
      size: 3210,
      url: 'http://localhost:3001/uploads/plants/leaf.png',
    });
  });
});
