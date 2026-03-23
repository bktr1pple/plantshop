import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

describe('Orders DTO validation', () => {
  it('CreateOrderDto приймає валідний payload', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      customerName: 'Іван',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ, відділення 1',
      items: [{ plantId: 1, quantity: 2 }],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('CreateOrderDto відхиляє порожній items список', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      customerName: 'Іван',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ',
      items: [],
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'items')).toBe(true);
  });

  it('UpdateOrderStatusDto приймає лише валідні статуси', async () => {
    const validDto = plainToInstance(UpdateOrderStatusDto, {
      status: OrderStatus.SHIPPED,
    });
    const invalidDto = plainToInstance(UpdateOrderStatusDto, {
      status: 'DONE',
    });

    await expect(validate(validDto)).resolves.toHaveLength(0);
    const invalidErrors = await validate(invalidDto);
    expect(invalidErrors.some((error) => error.property === 'status')).toBe(
      true,
    );
  });
});
