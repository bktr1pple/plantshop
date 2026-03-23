import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { parsePlantImages } from '../plants/plant-images';
import { CreateOrderDto } from './dto/create-order.dto';

const orderSummarySelect = {
  id: true,
  userId: true,
  status: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  deliveryAddress: true,
  note: true,
  totalAmount: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      items: true,
    },
  },
} satisfies Prisma.OrderSelect;

const orderDetailSelect = {
  ...orderSummarySelect,
  items: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      plantId: true,
      plantName: true,
      plantImage: true,
      unitPrice: true,
      quantity: true,
      lineTotal: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderSelect;

type OrderSummaryRecord = Prisma.OrderGetPayload<{
  select: typeof orderSummarySelect;
}>;
type OrderDetailRecord = Prisma.OrderGetPayload<{
  select: typeof orderDetailSelect;
}>;

function normalizeOptionalText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeRequiredText(value: string): string {
  return value.trim();
}

function mapOrderSummary(order: OrderSummaryRecord) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    note: order.note,
    totalAmount: order.totalAmount,
    itemCount: order._count.items,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function mapOrderDetail(order: OrderDetailRecord) {
  return {
    ...mapOrderSummary(order),
    items: order.items.map((item) => ({
      id: item.id,
      plantId: item.plantId,
      plantName: item.plantName,
      plantImage: item.plantImage,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      createdAt: item.createdAt,
    })),
  };
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private mergeItems(items: CreateOrderDto['items']) {
    const merged = new Map<number, number>();

    for (const item of items) {
      merged.set(item.plantId, (merged.get(item.plantId) ?? 0) + item.quantity);
    }

    return Array.from(merged.entries()).map(([plantId, quantity]) => ({
      plantId,
      quantity,
    }));
  }

  async createForUser(
    user: { userId: number; email: string },
    dto: CreateOrderDto,
  ) {
    const mergedItems = this.mergeItems(dto.items);
    const plantIds = mergedItems.map((item) => item.plantId);

    const plants = await this.prisma.plant.findMany({
      where: { id: { in: plantIds } },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
      },
    });

    if (plants.length !== plantIds.length) {
      const existingIds = new Set(plants.map((plant) => plant.id));
      const missingId = plantIds.find((id) => !existingIds.has(id));
      throw new NotFoundException(
        `Plant with id ${missingId ?? 'unknown'} not found`,
      );
    }

    const plantMap = new Map(plants.map((plant) => [plant.id, plant]));
    const orderItems = mergedItems.map(({ plantId, quantity }) => {
      const plant = plantMap.get(plantId);

      if (!plant) {
        throw new NotFoundException(`Plant with id ${plantId} not found`);
      }

      const [coverImage] = parsePlantImages(plant.images);
      const unitPrice = plant.price;
      const lineTotal = unitPrice * quantity;

      return {
        plantId: plant.id,
        plantName: plant.name,
        plantImage: coverImage ?? null,
        unitPrice,
        quantity,
        lineTotal,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );

    const createdOrder = await this.prisma.order.create({
      data: {
        userId: user.userId,
        status: OrderStatus.PENDING,
        customerName: normalizeRequiredText(dto.customerName),
        customerEmail: user.email,
        customerPhone: normalizeRequiredText(dto.customerPhone),
        deliveryAddress: normalizeRequiredText(dto.deliveryAddress),
        note: normalizeOptionalText(dto.note),
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      select: orderDetailSelect,
    });

    return mapOrderDetail(createdOrder);
  }

  async listForUser(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: orderSummarySelect,
    });

    return orders.map(mapOrderSummary);
  }

  async getForUser(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: orderDetailSelect,
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return mapOrderDetail(order);
  }

  async listForAdmin() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: orderSummarySelect,
    });

    return orders.map(mapOrderSummary);
  }

  async getForAdmin(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: orderDetailSelect,
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return mapOrderDetail(order);
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      select: orderDetailSelect,
    });

    return mapOrderDetail(updatedOrder);
  }
}
