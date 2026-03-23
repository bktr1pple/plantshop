import { Test, TestingModule } from '@nestjs/testing';
import { PlantController } from './plants.controller';
import { PlantsService } from './plants.service';

describe('PlantController', () => {
  let controller: PlantController;
  let plantsServiceMock: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    plantsServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlantController],
      providers: [
        {
          provide: PlantsService,
          useValue: plantsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PlantController>(PlantController);
  });

  it('findAll повертає результат сервісу', async () => {
    plantsServiceMock.findAll.mockResolvedValue([
      { id: 1, name: 'Monstera', price: 120, images: [] },
    ]);

    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, name: 'Monstera', price: 120, images: [] },
    ]);
    expect(plantsServiceMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne прокидує id у сервіс', async () => {
    plantsServiceMock.findOne.mockResolvedValue({
      id: 7,
      name: 'Ficus',
      price: 90,
      images: [],
    });

    await expect(controller.findOne(7)).resolves.toEqual({
      id: 7,
      name: 'Ficus',
      price: 90,
      images: [],
    });
    expect(plantsServiceMock.findOne).toHaveBeenCalledWith(7);
  });

  it('create прокидує DTO у сервіс', async () => {
    plantsServiceMock.create.mockResolvedValue({
      id: 1,
      name: 'Monstera',
      price: 120,
      images: '["a.jpg"]',
    });

    await expect(
      controller.create({
        name: 'Monstera',
        price: 120,
        images: ['a.jpg'],
      }),
    ).resolves.toEqual({
      id: 1,
      name: 'Monstera',
      price: 120,
      images: '["a.jpg"]',
    });
    expect(plantsServiceMock.create).toHaveBeenCalledWith({
      name: 'Monstera',
      price: 120,
      images: ['a.jpg'],
    });
  });

  it('update прокидує id і DTO у сервіс', async () => {
    plantsServiceMock.update.mockResolvedValue({
      id: 1,
      name: 'Updated Monstera',
      price: 140,
      images: '["a.jpg"]',
    });

    await expect(
      controller.update(1, {
        name: 'Updated Monstera',
        price: 140,
      }),
    ).resolves.toEqual({
      id: 1,
      name: 'Updated Monstera',
      price: 140,
      images: '["a.jpg"]',
    });
    expect(plantsServiceMock.update).toHaveBeenCalledWith(1, {
      name: 'Updated Monstera',
      price: 140,
    });
  });

  it('remove прокидує id у сервіс', async () => {
    plantsServiceMock.remove.mockResolvedValue({ id: 1 });

    await expect(controller.remove(1)).resolves.toEqual({ id: 1 });
    expect(plantsServiceMock.remove).toHaveBeenCalledWith(1);
  });
});
