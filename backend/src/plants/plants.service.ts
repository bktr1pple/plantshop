import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantsService {
  constructor(private prisma: PrismaService) {}

  async create(createPlantDto: CreatePlantDto) {
    // Якщо images не передано — створюємо порожній масив
    const imagesArray = createPlantDto.images?.length
      ? createPlantDto.images
      : [];

    return this.prisma.plant.create({
      data: {
        name: createPlantDto.name,
        description: createPlantDto.description,
        price: createPlantDto.price,
        // Зберігаємо JSON у базі
        images: JSON.stringify(imagesArray),
      },
    });
  }

  async findAll() {
    const plants = await this.prisma.plant.findMany();
    // Парсимо JSON щоб повернути масив у відповідь
    return plants.map((plant) => ({
      ...plant,
      images: plant.images ? JSON.parse(plant.images) : [],
    }));
  }

  async findOne(id: number) {
    const plant = await this.prisma.plant.findUnique({ where: { id } });
    if (!plant) throw new NotFoundException(`Plant with id ${id} not found`);

    return {
      ...plant,
      images: plant.images ? JSON.parse(plant.images) : [],
    };
  }

  async update(id: number, updatePlantDto: UpdatePlantDto) {
    const plant = await this.prisma.plant.findUnique({ where: { id } });
    if (!plant) throw new NotFoundException(`Plant with id ${id} not found`);

    const updatedImages = updatePlantDto.images?.length
      ? JSON.stringify(updatePlantDto.images)
      : plant.images;

    return this.prisma.plant.update({
      where: { id },
      data: {
        name: updatePlantDto.name,
        description: updatePlantDto.description,
        price: updatePlantDto.price,
        images: updatedImages,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.plant.delete({ where: { id } });
  }
}
