import { ForbiddenException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../auth/roles.guard';
import { MediaController } from '../media/media.controller';
import { MediaService } from '../media/media.service';
import { PlantController } from '../plants/plants.controller';
import { CreatePlantDto } from '../plants/dto/create-plant.dto';
import { PlantsService } from '../plants/plants.service';
import { SiteSettingsController } from '../site-settings/site-settings.controller';
import { UpdateSiteSettingsDto } from '../site-settings/dto/update-site-settings.dto';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { AdminOrdersController } from '../orders/admin-orders.controller';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { OrderStatus } from '../generated/prisma/client';

type AuthenticatedUser = {
  userId: number;
  email: string;
  role?: 'USER' | 'ADMIN';
};

type HttpExecutionContextRequest = {
  user?: AuthenticatedUser;
};

function createExecutionContext(
  controller: object,
  handlerName: string,
  user?: AuthenticatedUser,
) {
  const request: HttpExecutionContextRequest = { user };
  const controllerPrototype = Object.getPrototypeOf(controller) as Record<
    string,
    unknown
  >;
  const handler = controllerPrototype[handlerName] as (
    ...args: never[]
  ) => unknown;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => handler,
    getClass: () => controller.constructor,
  } as const;
}

describe('Admin contracts', () => {
  let rolesGuard: RolesGuard;
  let plantController: PlantController;
  let mediaController: MediaController;
  let siteSettingsController: SiteSettingsController;
  let adminOrdersController: AdminOrdersController;
  let plantsServiceMock: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let mediaServiceMock: {
    list: jest.Mock;
    deleteByUrl: jest.Mock;
    validateUploads: jest.Mock;
    toUploadResponse: jest.Mock;
  };
  let siteSettingsServiceMock: {
    getPublicSettings: jest.Mock;
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
  };
  let ordersServiceMock: {
    createForUser: jest.Mock;
    listForUser: jest.Mock;
    getForUser: jest.Mock;
    listForAdmin: jest.Mock;
    getForAdmin: jest.Mock;
    updateStatus: jest.Mock;
  };
  let validationPipe: ValidationPipe;

  type MediaUploadFiles = Parameters<MediaController['upload']>[0];
  type MediaUploadFile = MediaUploadFiles[number];

  beforeEach(async () => {
    plantsServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mediaServiceMock = {
      list: jest.fn(),
      deleteByUrl: jest.fn(),
      validateUploads: jest.fn().mockResolvedValue(undefined),
      toUploadResponse: jest.fn(),
    };

    siteSettingsServiceMock = {
      getPublicSettings: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    };

    ordersServiceMock = {
      createForUser: jest.fn(),
      listForUser: jest.fn(),
      getForUser: jest.fn(),
      listForAdmin: jest.fn(),
      getForAdmin: jest.fn(),
      updateStatus: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [
        PlantController,
        MediaController,
        SiteSettingsController,
        AdminOrdersController,
      ],
      providers: [
        Reflector,
        RolesGuard,
        {
          provide: PlantsService,
          useValue: plantsServiceMock,
        },
        {
          provide: MediaService,
          useValue: mediaServiceMock,
        },
        {
          provide: SiteSettingsService,
          useValue: siteSettingsServiceMock,
        },
        {
          provide: OrdersService,
          useValue: ordersServiceMock,
        },
      ],
    }).compile();

    rolesGuard = moduleRef.get(RolesGuard);
    plantController = moduleRef.get(PlantController);
    mediaController = moduleRef.get(MediaController);
    siteSettingsController = moduleRef.get(SiteSettingsController);
    adminOrdersController = moduleRef.get(AdminOrdersController);

    validationPipe = new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  });

  it('не-адмін не може створити рослину', () => {
    const context = createExecutionContext(plantController, 'create', {
      userId: 1,
      email: 'user@example.com',
      role: 'USER',
    });

    expect(() => rolesGuard.canActivate(context as never)).toThrow(
      ForbiddenException,
    );
  });

  it('адмін може створити рослину, а ValidationPipe відсікає зайві поля', async () => {
    const context = createExecutionContext(plantController, 'create', {
      userId: 1,
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    expect(rolesGuard.canActivate(context as never)).toBe(true);

    const dto = (await validationPipe.transform(
      {
        name: 'Monstera',
        description: 'Green',
        price: '120.5',
        images: ['http://localhost:3001/uploads/plants/cover.png'],
        extra: 'remove-me',
      },
      {
        type: 'body',
        metatype: CreatePlantDto,
      },
    )) as CreatePlantDto;

    await plantController.create(dto);

    expect(plantsServiceMock.create).toHaveBeenCalledWith({
      name: 'Monstera',
      description: 'Green',
      price: 120.5,
      images: ['http://localhost:3001/uploads/plants/cover.png'],
    });
  });

  it('некоректний payload рослини відхиляється ValidationPipe', async () => {
    await expect(
      validationPipe.transform(
        {
          price: 'not-a-number',
        },
        {
          type: 'body',
          metatype: CreatePlantDto,
        },
      ),
    ).rejects.toThrow();
  });

  it('public settings endpoint доступний без ролі', async () => {
    siteSettingsServiceMock.getPublicSettings.mockResolvedValue({
      siteName: 'PlantShop',
    });

    await expect(siteSettingsController.getPublicSettings()).resolves.toEqual({
      siteName: 'PlantShop',
    });
  });

  it('не-адмін не може оновити settings', () => {
    const context = createExecutionContext(
      siteSettingsController,
      'updateSettings',
      {
        userId: 1,
        email: 'user@example.com',
        role: 'USER',
      },
    );

    expect(() => rolesGuard.canActivate(context as never)).toThrow(
      ForbiddenException,
    );
  });

  it('адмін може оновити settings, а whitelist прибирає зайві поля', async () => {
    const context = createExecutionContext(
      siteSettingsController,
      'updateSettings',
      {
        userId: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    );

    expect(rolesGuard.canActivate(context as never)).toBe(true);

    const dto = (await validationPipe.transform(
      {
        siteName: 'PlantShop CMS',
        contactEmail: 'admin@plantshop.ua',
        extraField: 'remove-me',
      },
      {
        type: 'body',
        metatype: UpdateSiteSettingsDto,
      },
    )) as UpdateSiteSettingsDto;

    await siteSettingsController.updateSettings(dto);

    expect(siteSettingsServiceMock.updateSettings).toHaveBeenCalledWith({
      siteName: 'PlantShop CMS',
      contactEmail: 'admin@plantshop.ua',
    });
  });

  it('не-адмін не може видаляти медіа', () => {
    const context = createExecutionContext(mediaController, 'remove', {
      userId: 1,
      email: 'user@example.com',
      role: 'USER',
    });

    expect(() => rolesGuard.canActivate(context as never)).toThrow(
      ForbiddenException,
    );
  });

  it('адмін може завантажити медіа і отримує придатну відповідь', async () => {
    const context = createExecutionContext(mediaController, 'upload', {
      userId: 1,
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mediaServiceMock.toUploadResponse.mockReturnValue({
      filename: 'leaf.png',
      url: 'http://localhost:3001/uploads/plants/leaf.png',
      collection: 'plants',
      size: 1234,
      updatedAt: '2026-03-23T12:00:00.000Z',
    });

    expect(rolesGuard.canActivate(context as never)).toBe(true);

    const files: MediaUploadFiles = [
      {
        originalname: 'leaf.png',
        mimetype: 'image/png',
        filename: 'leaf.png',
        path: 'C:\\tmp\\leaf.png',
        size: 1234,
      } satisfies MediaUploadFile,
    ];

    await expect(
      mediaController.upload(files, { collection: 'plants' }),
    ).resolves.toEqual({
      items: [
        {
          filename: 'leaf.png',
          url: 'http://localhost:3001/uploads/plants/leaf.png',
          collection: 'plants',
          size: 1234,
          updatedAt: '2026-03-23T12:00:00.000Z',
        },
      ],
    });
    expect(mediaServiceMock.validateUploads).toHaveBeenCalledWith(files);
  });

  it('не-адмін не може переглядати admin orders', () => {
    const context = createExecutionContext(adminOrdersController, 'findAll', {
      userId: 1,
      email: 'user@example.com',
      role: 'USER',
    });

    expect(() => rolesGuard.canActivate(context as never)).toThrow(
      ForbiddenException,
    );
  });

  it('адмін може оновити статус замовлення, а whitelist прибирає зайві поля', async () => {
    const context = createExecutionContext(
      adminOrdersController,
      'updateStatus',
      {
        userId: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    );

    expect(rolesGuard.canActivate(context as never)).toBe(true);

    const dto = (await validationPipe.transform(
      {
        status: 'SHIPPED',
        extraField: 'remove-me',
      },
      {
        type: 'body',
        metatype: UpdateOrderStatusDto,
      },
    )) as UpdateOrderStatusDto;

    expect(dto).toEqual({
      status: OrderStatus.SHIPPED,
    });
  });

  it('CreateOrderDto whitelist-перетворення залишає лише підтримувані поля замовлення', async () => {
    const dto = (await validationPipe.transform(
      {
        customerName: 'User',
        customerPhone: '+380671234567',
        deliveryAddress: 'Kyiv',
        note: 'door code 123',
        items: [
          {
            plantId: '7',
            quantity: '2',
            extra: 'remove-me',
          },
        ],
        extraField: 'remove-me',
      },
      {
        type: 'body',
        metatype: CreateOrderDto,
      },
    )) as CreateOrderDto;

    expect(dto).toEqual({
      customerName: 'User',
      customerPhone: '+380671234567',
      deliveryAddress: 'Kyiv',
      note: 'door code 123',
      items: [{ plantId: 7, quantity: 2 }],
    });
  });
});
