import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePlantDto } from './dto/create-plant.dto';

describe('Plants DTO validation', () => {
  it('приймає HTTPS і локальні зображення', async () => {
    const dto = plainToInstance(CreatePlantDto, {
      name: 'Туя Смарагд',
      price: 450,
      images: [
        '/uploads/plants/thuja.webp',
        'https://images.example.com/thuja.jpg',
      ],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('відхиляє нульову ціну, небезпечний URL і понад десять зображень', async () => {
    const dto = plainToInstance(CreatePlantDto, {
      name: 'Туя Смарагд',
      price: 0,
      images: [
        'javascript:alert(1)',
        ...Array.from(
          { length: 10 },
          (_, index) => `/uploads/plants/${index}.webp`,
        ),
      ],
    });

    const errors = await validate(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toEqual(expect.arrayContaining(['price', 'images']));
  });
});
