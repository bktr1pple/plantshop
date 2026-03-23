import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import {
  deleteManagedUploadFile,
  isManagedUploadUrl,
} from '../media/media-storage';
import { parsePlantImages, stringifyPlantImages } from './plant-images';

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
