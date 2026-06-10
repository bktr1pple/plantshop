import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

type AuthenticatedRequest = Parameters<
  OrdersController['createForCurrentUser']
>[0];

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersServiceMock: {
    createForUser: jest.Mock;
    listForUser: jest.Mock;
    getForUser: jest.Mock;
  };

  beforeEach(async () => {
    ordersServiceMock = {
      createForUser: jest.fn(),
      listForUser: jest.fn(),
      getForUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('createForCurrentUser прокидує authenticated user і DTO у сервіс', async () => {
    const req = {
      user: {
        userId: 7,
        email: 'user@example.com',
        role: 'USER',
      },
    } as AuthenticatedRequest;
    const dto = {
      customerName: 'Іван',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ, відділення 1',
      note: 'Обережно з вазоном',
      items: [{ plantId: 1, quantity: 2 }],
    };

    ordersServiceMock.createForUser.mockResolvedValue({ id: 11 });

    await expect(controller.createForCurrentUser(req, dto)).resolves.toEqual({
      id: 11,
    });
    expect(ordersServiceMock.createForUser).toHaveBeenCalledWith(req.user, dto);
  });

  it('listCurrentUserOrders передає userId у сервіс', async () => {
    const req = {
      user: {
        userId: 5,
        email: 'user@example.com',
        role: 'USER',
      },
    } as AuthenticatedRequest;

    ordersServiceMock.listForUser.mockResolvedValue([{ id: 1 }]);

    await expect(controller.listCurrentUserOrders(req)).resolves.toEqual([
      { id: 1 },
    ]);
    expect(ordersServiceMock.listForUser).toHaveBeenCalledWith(5);
  });

  it('getCurrentUserOrder передає userId та orderId у сервіс', async () => {
    const req = {
      user: {
        userId: 5,
        email: 'user@example.com',
        role: 'USER',
      },
    } as AuthenticatedRequest;

    ordersServiceMock.getForUser.mockResolvedValue({ id: 14 });

    await expect(controller.getCurrentUserOrder(req, 14)).resolves.toEqual({
      id: 14,
    });
    expect(ordersServiceMock.getForUser).toHaveBeenCalledWith(5, 14);
  });
});
