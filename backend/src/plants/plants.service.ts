import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import {
  deleteManagedUploadFile,
  isManagedUploadUrl,
} from '../media/media-storage';
import { parsePlantImages, stringifyPlantImages } from './plant-images';

export type PlantsPaginationOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

const MAX_SEARCH_LENGTH = 100;

function normalizeSearchTerm(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, MAX_SEARCH_LENGTH);
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(1, Math.trunc(value as number)));
}

@Injectable()
export class PlantsService {
  constructor(private prisma: PrismaService) {}

  private mapPlantResponse<T extends { images: string | null }>(
    plant: T,
  ): Omit<T, 'images'> & { images: string[] } {
    return {
      ...plant,
      images: parsePlantImages(plant.images),
    };
  }

  private async cleanupUnusedManagedImages(candidateUrls: string[]) {
    const managedUrls = candidateUrls.filter(isManagedUploadUrl);

    if (!managedUrls.length) {
      return;
    }

    const plants = await this.prisma.plant.findMany({
      select: { images: true },
    });
    const stillUsedImages = new Set(
      plants.flatMap((plant) => parsePlantImages(plant.images)),
    );

    for (const url of managedUrls) {
      if (!stillUsedImages.has(url)) {
        await deleteManagedUploadFile(url);
      }
    }
  }

  async create(createPlantDto: CreatePlantDto) {
    const imagesArray = createPlantDto.images?.length
      ? createPlantDto.images
      : [];

    const createdPlant = await this.prisma.plant.create({
      data: {
        name: createPlantDto.name,
        description: createPlantDto.description,
        price: createPlantDto.price,
        images: stringifyPlantImages(imagesArray),
      },
    });

    return this.mapPlantResponse(createdPlant);
  }

  async findAll() {
    const plants = await this.prisma.plant.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return plants.map((plant) => this.mapPlantResponse(plant));
  }

  async findPaginated(options: PlantsPaginationOptions = {}) {
    const page = normalizePositiveInteger(options.page, 1);
    const limit = normalizePositiveInteger(options.limit, 12, 48);
    const skip = (page - 1) * limit;
    const search = normalizeSearchTerm(options.search);
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : undefined;

    const [totalItems, plants] = await this.prisma.$transaction([
      this.prisma.plant.count({ where }),
      this.prisma.plant.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      items: plants.map((plant) => this.mapPlantResponse(plant)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
        search: search ?? null,
      },
    };
  }

  async findOne(id: number) {
    const plant = await this.prisma.plant.findUnique({ where: { id } });
    if (!plant) throw new NotFoundException(`Plant with id ${id} not found`);

    return this.mapPlantResponse(plant);
  }

  async update(id: number, updatePlantDto: UpdatePlantDto) {
    const plant = await this.prisma.plant.findUnique({ where: { id } });
    if (!plant) throw new NotFoundException(`Plant with id ${id} not found`);

    const previousImages = parsePlantImages(plant.images);
    const nextImages =
      updatePlantDto.images !== undefined
        ? updatePlantDto.images
        : previousImages;
    const removedImages = previousImages.filter(
      (image) => !nextImages.includes(image),
    );

    const updatedPlant = await this.prisma.plant.update({
      where: { id },
      data: {
        name: updatePlantDto.name,
        description: updatePlantDto.description,
        price: updatePlantDto.price,
        images: stringifyPlantImages(nextImages),
      },
    });

    await this.cleanupUnusedManagedImages(removedImages);

    return this.mapPlantResponse(updatedPlant);
  }

  async remove(id: number) {
    const plant = await this.prisma.plant.findUnique({ where: { id } });
    if (!plant) throw new NotFoundException(`Plant with id ${id} not found`);

    const imagesToCleanup = parsePlantImages(plant.images);
    const deletedPlant = await this.prisma.plant.delete({ where: { id } });

    await this.cleanupUnusedManagedImages(imagesToCleanup);

    return this.mapPlantResponse(deletedPlant);
  }
}
