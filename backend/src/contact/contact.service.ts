import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { buildContactMessageTemplate } from '../mail/mail.templates';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

function trimOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

@Injectable()
export class ContactService {
  constructor(
    private readonly mailService: MailService,
    private readonly siteSettingsService: SiteSettingsService,
  ) {}

  async sendMessage(dto: CreateContactMessageDto) {
    const settings = await this.siteSettingsService.getPublicSettings();
    const template = buildContactMessageTemplate({
      siteName: settings.siteName,
      name: dto.name.trim(),
      email: dto.email.trim(),
      phone: trimOptional(dto.phone),
      subject: trimOptional(dto.subject),
      message: dto.message.trim(),
    });

    await this.mailService.sendMail({
      to: settings.contactEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    return {
      status: 'ok',
      message: 'Повідомлення надіслано. Ми відповімо на вказаний email.',
    };
  }
}
