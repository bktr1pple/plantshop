import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OrderStatus } from '../generated/prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

function hasValidationErrorForProperty(
  errors: Awaited<ReturnType<typeof validate>>,
  property: string,
): boolean {
  return errors.some(
    (error) =>
      error.property === property ||
      error.children?.some((child) => child.property === property) ||
      error.children?.some((child) =>
        child.children?.some(
          (nestedChild) => nestedChild.property === property,
        ),
      ),
  );
}

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

  it('CreateOrderDto відхиляє required поля, що складаються лише з пробілів', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      customerName: '   ',
      customerPhone: '   ',
      deliveryAddress: '   ',
      note: '   ',
      items: [{ plantId: 1, quantity: 1 }],
    });

    const errors = await validate(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toEqual(
      expect.arrayContaining([
        'customerName',
        'customerPhone',
        'deliveryAddress',
      ]),
    );
    expect(dto.note).toBeUndefined();
  });

  it('CreateOrderDto відхиляє некоректний формат телефону', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      customerName: 'Іван',
      customerPhone: 'not-a-phone',
      deliveryAddress: 'Київ',
      items: [{ plantId: 1, quantity: 1 }],
    });

    const errors = await validate(dto);

    expect(hasValidationErrorForProperty(errors, 'customerPhone')).toBe(true);
  });

  it('CreateOrderDto відхиляє надмірну кількість одного товару', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      customerName: 'Іван',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ',
      items: [{ plantId: 1, quantity: 1001 }],
    });

    const errors = await validate(dto);

    expect(hasValidationErrorForProperty(errors, 'quantity')).toBe(true);
  });

  it('CreateOrderDto відхиляє дублікати plantId', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      customerName: 'Іван',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ',
      items: [
        { plantId: 1, quantity: 1 },
        { plantId: 1, quantity: 2 },
      ],
    });

    const errors = await validate(dto);

    expect(hasValidationErrorForProperty(errors, 'items')).toBe(true);
  });

  it('CreateOrderDto обмежує замовлення п’ятдесятьма позиціями', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      customerName: 'Іван',
      customerPhone: '+380671234567',
      deliveryAddress: 'Київ',
      items: Array.from({ length: 51 }, (_, index) => ({
        plantId: index + 1,
        quantity: 1,
      })),
    });

    const errors = await validate(dto);

    expect(hasValidationErrorForProperty(errors, 'items')).toBe(true);
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
