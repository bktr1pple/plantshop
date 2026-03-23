import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlantsService } from './plants.service';
import { PlantController } from './plants.controller';

@Module({
  imports: [AuthModule],
  controllers: [PlantController],
  providers: [PlantsService],
})
export class PlantsModule {}
