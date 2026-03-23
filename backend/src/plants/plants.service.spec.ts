import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PlantsService } from './plants.service';

describe('PlantsService', () => {
  let service: PlantsService;
  let prismaMock: {
    plant: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      plant: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlantsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PlantsService>(PlantsService);
  });

  it('create серіалізує images у JSON-рядок', async () => {
    prismaMock.plant.create.mockResolvedValue({
      id: 1,
      name: 'Monstera',
      description: 'Large plant',
      price: 120,
      images: '["a.jpg","b.jpg"]',
    });

    await service.create({
      name: 'Monstera',
      description: 'Large plant',
      price: 120,
      images: ['a.jpg', 'b.jpg'],
    });

    expect(prismaMock.plant.create).toHaveBeenCalledWith({
      data: {
        name: 'Monstera',
        description: 'Large plant',
        price: 120,
        images: '["a.jpg","b.jpg"]',
      },
    });
  });

  it('findAll парсить images назад у масив', async () => {
    prismaMock.plant.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Monstera',
        description: 'Large plant',
        price: 120,
        images: '["a.jpg","b.jpg"]',
      },
    ]);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: 1,
        name: 'Monstera',
        description: 'Large plant',
        price: 120,
        images: ['a.jpg', 'b.jpg'],
      },
    ]);
  });

  it('findOne кидає NotFoundException, якщо рослину не знайдено', async () => {
    prismaMock.plant.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('update зберігає наявні images, якщо нові не передані', async () => {
    prismaMock.plant.findUnique.mockResolvedValue({
      id: 1,
      name: 'Monstera',
      description: 'Large plant',
      price: 120,
      images: '["a.jpg"]',
    });
    prismaMock.plant.update.mockResolvedValue({
      id: 1,
      name: 'Updated Monstera',
      description: 'Updated description',
      price: 140,
      images: '["a.jpg"]',
    });

    await service.update(1, {
      name: 'Updated Monstera',
      description: 'Updated description',
      price: 140,
    });

    expect(prismaMock.plant.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        name: 'Updated Monstera',
        description: 'Updated description',
        price: 140,
        images: '["a.jpg"]',
      },
    });
  });
});
