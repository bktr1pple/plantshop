import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { getRequiredEnv } from '../config/env';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

interface RecaptchaVerifyResponse {
  success?: boolean;
}

const CONTACT_THROTTLE = { default: { ttl: 60_000, limit: 5 } } as const;
const recaptchaSecret = getRequiredEnv('RECAPTCHA_SECRET_KEY');

async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('secret', recaptchaSecret);
    params.append('response', token);

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      console.error(
        'Contact reCAPTCHA verification failed with status:',
        response.status,
      );
      return false;
    }

    const data = (await response.json()) as RecaptchaVerifyResponse;
    return data.success === true;
  } catch (error) {
    console.error('Contact reCAPTCHA verification error:', error);
    return false;
  }
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Throttle(CONTACT_THROTTLE)
  @Post()
  async create(@Body() dto: CreateContactMessageDto) {
    const captchaValid = await verifyCaptcha(dto.captchaToken);

    if (!captchaValid) {
      throw new BadRequestException({
        error: 'CAPTCHA_INVALID',
        message: 'Підтвердьте, що ви не робот, і спробуйте ще раз.',
      });
    }

    return this.contactService.sendMessage(dto);
  }
}
