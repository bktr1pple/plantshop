import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
});
