import { Module } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { PlantController } from './plants.controller';

@Module({
  controllers: [PlantController],
  providers: [PlantsService],
})
export class PlantsModule {}
