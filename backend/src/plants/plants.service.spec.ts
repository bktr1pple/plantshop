import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PlantsService } from './plants.service';

describe('PlantsService', () => {
  let service: PlantsService;
  let prismaMock: {
    $transaction: jest.Mock;
    plant: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn(),
      plant: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
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

  it('findPaginated повертає сторінку товарів з метаданими', async () => {
    prismaMock.plant.count.mockReturnValue('count-query');
    prismaMock.plant.findMany.mockReturnValue('find-many-query');
    prismaMock.$transaction.mockResolvedValue([
      13,
      [
        {
          id: 1,
          name: 'Monstera',
          description: 'Large plant',
          price: 120,
          images: '["a.jpg"]',
        },
      ],
    ]);

    await expect(service.findPaginated({ page: 3, limit: 6 })).resolves.toEqual(
      {
        items: [
          {
            id: 1,
            name: 'Monstera',
            description: 'Large plant',
            price: 120,
            images: ['a.jpg'],
          },
        ],
        meta: {
          page: 3,
          limit: 6,
          totalItems: 13,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: false,
        },
      },
    );
    expect(prismaMock.plant.findMany).toHaveBeenCalledWith({
      orderBy: { updatedAt: 'desc' },
      skip: 12,
      take: 6,
    });
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
