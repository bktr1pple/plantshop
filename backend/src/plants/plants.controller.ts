import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantsService) {}

  @Post()
  create(@Body() createPlantDto: CreatePlantDto) {
    return this.plantService.create(createPlantDto);
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
  update(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto) {
    return this.plantService.update(+id, updatePlantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plantService.remove(+id);
  }
}
