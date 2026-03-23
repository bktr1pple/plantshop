export interface SiteSettings {
  id?: number;
  siteName: string;
  siteTagline: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleLine3: string;
  heroSubtitle: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  contactIntro: string;
  footerDescription: string;
  footerCtaLabel: string;
  footerCtaHref: string;
  contactPhoneDisplay: string;
  contactPhoneHref: string;
  contactEmail: string;
  contactAddress: string;
  showroomHours: string;
  messengerLabel: string;
  messengerUrl: string;
  facebookUrl: string;
  instagramUrl: string;
}

export const defaultSiteSettings: SiteSettings = {
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

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
