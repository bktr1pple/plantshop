import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [MailModule, SiteSettingsModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
