import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '../generated/prisma/client';
import { AdminOrdersController } from './admin-orders.controller';
import { OrdersService } from './orders.service';

describe('AdminOrdersController', () => {
  let controller: AdminOrdersController;
  let ordersServiceMock: {
    listForAdmin: jest.Mock;
    getForAdmin: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    ordersServiceMock = {
      listForAdmin: jest.fn(),
      getForAdmin: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminOrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AdminOrdersController>(AdminOrdersController);
  });

  it('findAll/findOne/updateStatus прокидають аргументи у сервіс', async () => {
    ordersServiceMock.listForAdmin.mockResolvedValue([{ id: 1 }]);
    ordersServiceMock.getForAdmin.mockResolvedValue({ id: 1 });
    ordersServiceMock.updateStatus.mockResolvedValue({
      id: 1,
      status: OrderStatus.SHIPPED,
    });

    await expect(controller.findAll()).resolves.toEqual([{ id: 1 }]);
    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
    await expect(
      controller.updateStatus(1, { status: OrderStatus.SHIPPED }),
    ).resolves.toEqual({
      id: 1,
      status: OrderStatus.SHIPPED,
    });

    expect(ordersServiceMock.getForAdmin).toHaveBeenCalledWith(1);
    expect(ordersServiceMock.updateStatus).toHaveBeenCalledWith(
      1,
      OrderStatus.SHIPPED,
    );
  });
});
