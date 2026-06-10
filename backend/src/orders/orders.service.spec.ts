import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaMock: {
    $transaction: jest.Mock;
    plant: {
      findMany: jest.Mock;
    };
    order: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn(),
      plant: {
        findMany: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(
      (
        callback: (tx: {
          plant: typeof prismaMock.plant;
          order: typeof prismaMock.order;
        }) => unknown,
      ) =>
        Promise.resolve(
          callback({
            plant: prismaMock.plant,
            order: prismaMock.order,
          }),
        ),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('createForUser створює замовлення зі snapshot item data та totalAmount', async () => {
    prismaMock.plant.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Monstera',
        price: 120,
        images: '["http://localhost:3001/uploads/plants/monstera.png"]',
      },
    ]);
    prismaMock.order.create.mockResolvedValue({
      id: 15,
      userId: 7,
      status: OrderStatus.PENDING,
      customerName: 'Іван',
      customerEmail: 'user@example.com',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ',
      note: 'Коментар',
      totalAmount: 240,
      createdAt: new Date('2026-03-24T12:00:00.000Z'),
      updatedAt: new Date('2026-03-24T12:00:00.000Z'),
      _count: { items: 1 },
      items: [
        {
          id: 1,
          plantId: 1,
          plantName: 'Monstera',
          plantImage: 'http://localhost:3001/uploads/plants/monstera.png',
          unitPrice: 120,
          quantity: 2,
          lineTotal: 240,
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
        },
      ],
    });

    const result = await service.createForUser(
      {
        userId: 7,
        email: 'user@example.com',
      },
      {
        customerName: 'Іван',
        customerPhone: '+380671234567',
        deliveryAddress: 'Київ',
        note: 'Коментар',
        items: [
          { plantId: 1, quantity: 1 },
          { plantId: 1, quantity: 1 },
        ],
      },
    );

    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: 7,
          status: OrderStatus.PENDING,
          customerName: 'Іван',
          customerEmail: 'user@example.com',
          customerPhone: '+380671234567',
          deliveryAddress: 'Київ',
          note: 'Коментар',
          totalAmount: 240,
          items: {
            create: [
              {
                plantId: 1,
                plantName: 'Monstera',
                plantImage: 'http://localhost:3001/uploads/plants/monstera.png',
                unitPrice: 120,
                quantity: 2,
                lineTotal: 240,
              },
            ],
          },
        },
      }),
    );
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      id: 15,
      totalAmount: 240,
      itemCount: 1,
      items: [
        expect.objectContaining({
          quantity: 2,
          lineTotal: 240,
        }),
      ],
    });
  });

  it('createForUser кидає NotFoundException, якщо одну з рослин не знайдено', async () => {
    prismaMock.plant.findMany.mockResolvedValue([]);

    await expect(
      service.createForUser(
        {
          userId: 7,
          email: 'user@example.com',
        },
        {
          customerName: 'Іван',
          customerPhone: '+380671234567',
          deliveryAddress: 'Київ',
          items: [{ plantId: 99, quantity: 1 }],
        },
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('listForUser повертає тільки summary data', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 7,
        status: OrderStatus.SHIPPED,
        customerName: 'Іван',
        customerEmail: 'user@example.com',
        customerPhone: '+380671234567',
        deliveryAddress: 'Київ',
        note: null,
        totalAmount: 120,
        createdAt: new Date('2026-03-24T12:00:00.000Z'),
        updatedAt: new Date('2026-03-24T12:00:00.000Z'),
        _count: { items: 2 },
      },
    ]);

    await expect(service.listForUser(7)).resolves.toEqual([
      expect.objectContaining({
        id: 1,
        itemCount: 2,
        status: OrderStatus.SHIPPED,
      }),
    ]);
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 7 },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('getForUser не повертає чуже замовлення', async () => {
    prismaMock.order.findFirst.mockResolvedValue(null);

    await expect(service.getForUser(7, 11)).rejects.toThrow(NotFoundException);
    expect(prismaMock.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 11,
          userId: 7,
        },
      }),
    );
  });

  it('updateStatus оновлює статус існуючого замовлення', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ id: 11 });
    prismaMock.order.update.mockResolvedValue({
      id: 11,
      userId: 7,
      status: OrderStatus.DELIVERED,
      customerName: 'Іван',
      customerEmail: 'user@example.com',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ',
      note: null,
      totalAmount: 120,
      createdAt: new Date('2026-03-24T12:00:00.000Z'),
      updatedAt: new Date('2026-03-25T12:00:00.000Z'),
      _count: { items: 1 },
      items: [
        {
          id: 1,
          plantId: 1,
          plantName: 'Monstera',
          plantImage: null,
          unitPrice: 120,
          quantity: 1,
          lineTotal: 120,
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
        },
      ],
    });

    await expect(
      service.updateStatus(11, OrderStatus.DELIVERED),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 11,
        status: OrderStatus.DELIVERED,
      }),
    );
    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 11 },
        data: { status: OrderStatus.DELIVERED },
      }),
    );
  });
});
