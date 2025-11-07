import { Test, TestingModule } from '@nestjs/testing';
import { PlantController } from './plants.controller';
import { PlantsService } from './plants.service';

describe('PlantController', () => {
  let controller: PlantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlantController],
      providers: [PlantsService],
    }).compile();

    // Здесь используем PlantController, как импортировали
    controller = module.get<PlantController>(PlantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

