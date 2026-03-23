import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import {
  buildMediaUrl,
  deleteManagedUploadFile,
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
});
