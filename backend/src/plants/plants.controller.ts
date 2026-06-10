import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  UseGuards,
  ParseIntPipe,
  Body,
  Query,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createPlantDto: CreatePlantDto) {
    return this.plantService.create(createPlantDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('all') all?: string,
  ) {
    if (all === 'true') {
      return this.plantService.findAll();
    }

    return this.plantService.findPaginated({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    return this.plantService.update(id, updatePlantDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantService.remove(id);
  }
}
