import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateMeDto } from './dto/update-me.dto';

describe('Auth DTO validation', () => {
  it('LoginDto вимагає captchaToken', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: 'password123',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'captchaToken')).toBe(
      true,
    );
  });

  it('RegisterDto вимагає пароль довжиною не менше 6 символів', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'user@example.com',
      password: '12345',
      captchaToken: 'captcha-token',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('UpdateMeDto відхиляє невалідне значення profileVisibility', async () => {
    const dto = plainToInstance(UpdateMeDto, {
      profileVisibility: 'everyone',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'profileVisibility')).toBe(
      true,
    );
  });

  it('UpdateMeDto приймає валідні profile/settings поля', async () => {
    const dto = plainToInstance(UpdateMeDto, {
      name: 'User',
      phone: '+380671234567',
      address: 'Київ',
      bio: 'Люблю рослини',
      emailNotifications: true,
      orderUpdates: false,
      careReminders: true,
      promotional: false,
      profileVisibility: 'friends',
      dataSharing: false,
      personalizedAds: true,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
