import { mkdirSync, existsSync } from 'fs';
import { open, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, isAbsolute, relative, resolve, sep } from 'path';
import { getPublicApiBaseUrl } from '../config/env';

export type MediaCollection = 'plants' | 'site';

const UPLOADS_ROOT = resolve(process.cwd(), 'uploads');
const KNOWN_COLLECTIONS: MediaCollection[] = ['plants', 'site'];
export type SupportedImageType = 'jpeg' | 'png' | 'webp' | 'gif';

export function normalizeMediaCollection(value?: string): MediaCollection {
  return value === 'site' ? 'site' : 'plants';
}

export function getUploadsRootDir(): string {
  return UPLOADS_ROOT;
}

export function getCollectionDir(collection: MediaCollection): string {
  return resolve(UPLOADS_ROOT, collection);
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
      const parsedUrl = new URL(url);
      const publicOrigin = new URL(getPublicApiBaseUrl()).origin;
      if (parsedUrl.origin !== publicOrigin) {
        return null;
      }
      pathname = parsedUrl.pathname;
    } catch {
      return null;
    }
  }

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (!pathname.startsWith('/uploads/')) {
    return null;
  }

  const normalizedPath = pathname.replace(/\\/g, '/');
  const segments = normalizedPath
    .replace(/^\/uploads\//, '')
    .split('/')
    .filter(Boolean);

  if (
    segments.length !== 2 ||
    !KNOWN_COLLECTIONS.includes(segments[0] as MediaCollection) ||
    segments.some((segment) => segment === '.' || segment === '..')
  ) {
    return null;
  }

  const filePath = resolve(UPLOADS_ROOT, segments[0], segments[1]);
  const pathFromRoot = relative(UPLOADS_ROOT, filePath);
  if (
    !pathFromRoot ||
    pathFromRoot === '..' ||
    pathFromRoot.startsWith(`..${sep}`) ||
    isAbsolute(pathFromRoot)
  ) {
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

export async function detectImageType(
  filePath: string,
): Promise<SupportedImageType | null> {
  const handle = await open(filePath, 'r');

  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const bytes = buffer.subarray(0, bytesRead);

    if (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    ) {
      return 'jpeg';
    }

    if (
      bytes.length >= 8 &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ) {
      return 'png';
    }

    if (
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return 'webp';
    }

    if (bytes.length >= 6) {
      const gifHeader = bytes.subarray(0, 6).toString('ascii');
      if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
        return 'gif';
      }
    }

    return null;
  } finally {
    await handle.close();
  }
}
