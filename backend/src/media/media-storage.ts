import { mkdirSync, existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join, normalize } from 'path';
import { getPublicApiBaseUrl } from '../config/env';

export type MediaCollection = 'plants' | 'site';

const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const KNOWN_COLLECTIONS: MediaCollection[] = ['plants', 'site'];

export function normalizeMediaCollection(value?: string): MediaCollection {
  return value === 'site' ? 'site' : 'plants';
}

export function getUploadsRootDir(): string {
  return UPLOADS_ROOT;
}

export function getCollectionDir(collection: MediaCollection): string {
  return join(UPLOADS_ROOT, collection);
}

export function ensureUploadDirectories(): void {
  mkdirSync(UPLOADS_ROOT, { recursive: true });
  for (const collection of KNOWN_COLLECTIONS) {
    mkdirSync(getCollectionDir(collection), { recursive: true });
  }
}

export function createStoredFilename(originalName: string): string {
  const extension = extname(originalName).toLowerCase() || '.bin';
  return `${Date.now()}-${randomUUID()}${extension}`;
}

export function buildMediaUrl(
  collection: MediaCollection,
  filename: string,
): string {
  return `${getPublicApiBaseUrl()}/uploads/${collection}/${filename}`;
}

export function resolveManagedUploadPath(url: string): string | null {
  let pathname = url;

  if (/^https?:\/\//i.test(url)) {
    try {
      pathname = new URL(url).pathname;
    } catch {
      return null;
    }
  }

  if (!pathname.startsWith('/uploads/')) {
    return null;
  }

  const relativePath = normalize(pathname.replace(/^\/uploads\//, ''));
  const filePath = join(UPLOADS_ROOT, relativePath);

  if (!filePath.startsWith(UPLOADS_ROOT)) {
    return null;
  }

  return filePath;
}

export function isManagedUploadUrl(url: string): boolean {
  return resolveManagedUploadPath(url) !== null;
}

export async function deleteManagedUploadFile(url: string): Promise<boolean> {
  const filePath = resolveManagedUploadPath(url);

  if (!filePath || !existsSync(filePath)) {
    return false;
  }

  await unlink(filePath);
  return true;
}
