import { existsSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import {
  buildMediaUrl,
  deleteManagedUploadFile,
  detectImageType,
  ensureUploadDirectories,
  getCollectionDir,
  isManagedUploadUrl,
  resolveManagedUploadPath,
} from './media-storage';

describe('media-storage', () => {
  it('коректно резолвить і видаляє керований upload-файл', async () => {
    ensureUploadDirectories();
    const filename = `jest-media-${Date.now()}.png`;
    const filePath = join(getCollectionDir('plants'), filename);
    const url = buildMediaUrl('plants', filename);

    await writeFile(filePath, 'test-image-content');

    expect(isManagedUploadUrl(url)).toBe(true);
    expect(resolveManagedUploadPath(url)).toBe(filePath);

    await expect(deleteManagedUploadFile(url)).resolves.toBe(true);
    expect(existsSync(filePath)).toBe(false);
  });

  it('повертає null для сторонніх URL', () => {
    expect(resolveManagedUploadPath('https://example.com/test.png')).toBeNull();
    expect(isManagedUploadUrl('https://example.com/test.png')).toBe(false);
  });

  it.each([
    '/uploads/plants/../site/secret.png',
    '/uploads/plants/%2e%2e/site/secret.png',
    '/uploads/plants/%2e%2e%2fsite%2fsecret.png',
    '/uploads/plants/nested/secret.png',
    '/uploads-evil/plants/secret.png',
  ])('відхиляє path traversal або підміну upload-prefix: %s', (url) => {
    expect(resolveManagedUploadPath(url)).toBeNull();
  });

  it('визначає тип зображення за magic bytes, а не розширенням', async () => {
    ensureUploadDirectories();
    const filePath = join(
      getCollectionDir('plants'),
      `jest-signature-${Date.now()}.jpg`,
    );

    await writeFile(
      filePath,
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );

    await expect(detectImageType(filePath)).resolves.toBe('png');
    await unlink(filePath);
  });
});
