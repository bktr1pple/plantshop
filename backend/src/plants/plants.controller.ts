import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { PlantsService } from './plants.service';

@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantsService) {}

  @Post()
  create() {
    throw new ForbiddenException('Plant write endpoints are disabled');
  }

  @Get()
  findAll() {
    return this.plantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantService.findOne(+id);
  }

  @Patch(':id')
  update() {
    throw new ForbiddenException('Plant write endpoints are disabled');
  }

  @Delete(':id')
  remove() {
    throw new ForbiddenException('Plant write endpoints are disabled');
  }
}
