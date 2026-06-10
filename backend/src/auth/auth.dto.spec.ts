import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyLoginChallengeDto } from './dto/verify-login-challenge.dto';

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

  it('RegisterDto нормалізує email і вимагає складний пароль мінімум 8 символів', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: ' USER@EXAMPLE.COM ',
      password: '12345',
      captchaToken: 'captcha-token',
    });

    const errors = await validate(dto);

    expect(dto.email).toBe('user@example.com');
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('VerifyEmailDto вимагає достатньо довгий токен', async () => {
    const dto = plainToInstance(VerifyEmailDto, {
      token: 'short',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'token')).toBe(true);
  });

  it('ResetPasswordDto вимагає токен та новий пароль', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'a'.repeat(32),
      newPassword: '12345',
      confirmPassword: '12345',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
  });

  it('ChangePasswordDto приймає валідні password-поля', async () => {
    const dto = plainToInstance(ChangePasswordDto, {
      currentPassword: 'old-password',
      newPassword: 'new-password1',
      confirmPassword: 'new-password1',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('VerifyLoginChallengeDto вимагає challengeId > 0 і 6-значний код', async () => {
    const dto = plainToInstance(VerifyLoginChallengeDto, {
      challengeId: '0',
      code: '12345',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'challengeId')).toBe(true);
    expect(errors.some((error) => error.property === 'code')).toBe(true);
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
