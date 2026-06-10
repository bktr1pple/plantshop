import { BadRequestException, Injectable } from '@nestjs/common';
import { readdir, stat, unlink } from 'fs/promises';
import { basename, extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { parsePlantImages } from '../plants/plant-images';
import {
  MediaCollection,
  buildMediaUrl,
  deleteManagedUploadFile,
  detectImageType,
  ensureUploadDirectories,
  getCollectionDir,
  isManagedUploadUrl,
  normalizeMediaCollection,
  resolveManagedUploadPath,
} from './media-storage';

type MediaFileItem = {
  filename: string;
  url: string;
  collection: MediaCollection;
  size: number;
  updatedAt: string;
};

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {
    ensureUploadDirectories();
  }

  async list(collection?: string): Promise<MediaFileItem[]> {
    const collections = collection
      ? [normalizeMediaCollection(collection)]
      : (['plants', 'site'] as MediaCollection[]);

    const items = await Promise.all(
      collections.flatMap(async (itemCollection) => {
        const dir = getCollectionDir(itemCollection);
        const files = await readdir(dir);

        return Promise.all(
          files.map(async (filename) => {
            const filePath = resolveManagedUploadPath(
              buildMediaUrl(itemCollection, filename),
            );

            if (!filePath) {
              throw new BadRequestException('Invalid media file path');
            }

            const fileStat = await stat(filePath);

            return {
              filename,
              url: buildMediaUrl(itemCollection, filename),
              collection: itemCollection,
              size: fileStat.size,
              updatedAt: fileStat.mtime.toISOString(),
            };
          }),
        );
      }),
    );

    return items.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async validateUploads(
    files: Array<{ originalname: string; path: string }>,
  ): Promise<void> {
    const expectedTypesByExtension: Record<string, string> = {
      '.jpg': 'jpeg',
      '.jpeg': 'jpeg',
      '.png': 'png',
      '.webp': 'webp',
      '.gif': 'gif',
    };

    for (const file of files) {
      const detectedType = await detectImageType(file.path);
      const expectedType =
        expectedTypesByExtension[extname(file.originalname).toLowerCase()];

      if (!detectedType || detectedType !== expectedType) {
        await Promise.all(
          files.map((uploadedFile) =>
            unlink(uploadedFile.path).catch(() => undefined),
          ),
        );
        throw new BadRequestException(
          'Вміст файлу не відповідає дозволеному формату зображення',
        );
      }
    }
  }

  async deleteByUrl(url: string): Promise<{ deleted: boolean }> {
    if (!isManagedUploadUrl(url)) {
      throw new BadRequestException('Unsupported media URL');
    }

    if (await this.isPlantImageInUse(url)) {
      throw new BadRequestException(
        'Файл ще використовується хоча б однією рослиною',
      );
    }

    const deleted = await deleteManagedUploadFile(url);
    return { deleted };
  }

  async isPlantImageInUse(url: string): Promise<boolean> {
    const plants = await this.prisma.plant.findMany({
      select: { images: true },
    });

    return plants.some((plant) => parsePlantImages(plant.images).includes(url));
  }

  toUploadResponse(
    collection: MediaCollection,
    filename: string,
    size: number,
  ): MediaFileItem {
    return {
      filename: basename(filename),
      url: buildMediaUrl(collection, basename(filename)),
      collection,
      size,
      updatedAt: new Date().toISOString(),
    };
  }
}
