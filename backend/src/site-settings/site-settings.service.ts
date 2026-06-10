import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

const SETTINGS_ID = 1;

const defaultSettings = {
  siteName: 'PlantShop',
  siteTagline: 'PlantShop — турбота про ваш зелений простір',
  heroTitleLine1: 'Природа',
  heroTitleLine2: 'у сучасному',
  heroTitleLine3: 'дизайні',
  heroSubtitle:
    'Ексклюзивні рослини, професійний догляд та авторські рішення для створення ідеального простору',
  heroPrimaryCtaLabel: 'До каталогу',
  heroPrimaryCtaHref: '/plants',
  contactIntro:
    'Маєте запитання щодо рослин, замовлення або догляду? Напишіть нам — і ми допоможемо підібрати ідеальні рослини саме для вашого простору.',
  footerDescription:
    'Створюємо зелені простори, які надихають. Преміальні рослини, професійний догляд та індивідуальний підхід до кожного клієнта.',
  footerCtaLabel: "Зв'язатися з нами",
  footerCtaHref: '/contact',
  contactPhoneDisplay: '+38 (067) 123-45-67',
  contactPhoneHref: 'tel:+380671234567',
  contactEmail: 'hello@plantshop.ua',
  contactAddress: 'м. Київ, вул. Зелена, 123',
  showroomHours: 'Пн–Пт: 09:00–18:00\nСб: 10:00–16:00',
  messengerLabel: 'Telegram / Viber',
  messengerUrl: '#',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
};

function omitUndefinedFields(
  dto: UpdateSiteSettingsDto,
): Partial<UpdateSiteSettingsDto> {
  return Object.fromEntries(
    Object.entries(dto).filter(([, value]) => value !== undefined),
  );
}

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: {
        id: SETTINGS_ID,
        ...defaultSettings,
      },
    });
  }

  async getPublicSettings() {
    return this.getSettings();
  }

  async updateSettings(dto: UpdateSiteSettingsDto) {
    const definedDto = omitUndefinedFields(dto);

    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      update: definedDto,
      create: {
        id: SETTINGS_ID,
        ...defaultSettings,
        ...definedDto,
      },
    });
  }
}
