import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: number;
    email: string;
    role: 'USER' | 'ADMIN';
  };
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createForCurrentUser(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createForUser(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listCurrentUserOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.listForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getCurrentUserOrder(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.getForUser(req.user.userId, id);
  }
}
