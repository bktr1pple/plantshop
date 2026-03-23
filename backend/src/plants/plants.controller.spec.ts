import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlantController } from './plants.controller';
import { PlantsService } from './plants.service';

describe('PlantController', () => {
  let controller: PlantController;
  let plantsServiceMock: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    plantsServiceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
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

  it('create лишається заблокованим до появи permission model', () => {
    expect(() => controller.create()).toThrow(ForbiddenException);
  });

  it('update лишається заблокованим до появи permission model', () => {
    expect(() => controller.update()).toThrow(ForbiddenException);
  });

  it('remove лишається заблокованим до появи permission model', () => {
    expect(() => controller.remove()).toThrow(ForbiddenException);
  });
});
