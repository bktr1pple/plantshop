import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create() {
    throw new ForbiddenException(
      'Plant write endpoints require a future permission model',
    );
  }

  @Get()
  findAll() {
    return this.plantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update() {
    throw new ForbiddenException(
      'Plant write endpoints require a future permission model',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove() {
    throw new ForbiddenException(
      'Plant write endpoints require a future permission model',
    );
  }
}
