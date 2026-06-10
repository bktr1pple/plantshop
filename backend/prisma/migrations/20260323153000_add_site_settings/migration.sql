-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'PlantShop',
    `siteTagline` VARCHAR(191) NOT NULL DEFAULT 'PlantShop — турбота про ваш зелений простір',
    `heroTitleLine1` VARCHAR(191) NOT NULL DEFAULT 'Природа',
    `heroTitleLine2` VARCHAR(191) NOT NULL DEFAULT 'у сучасному',
    `heroTitleLine3` VARCHAR(191) NOT NULL DEFAULT 'дизайні',
    `heroSubtitle` TEXT NOT NULL,
    `heroPrimaryCtaLabel` VARCHAR(191) NOT NULL DEFAULT 'До каталогу',
    `heroPrimaryCtaHref` VARCHAR(191) NOT NULL DEFAULT '/plants',
    `contactIntro` TEXT NOT NULL,
    `footerDescription` TEXT NOT NULL,
    `footerCtaLabel` VARCHAR(191) NOT NULL DEFAULT 'Зв''язатися з нами',
    `footerCtaHref` VARCHAR(191) NOT NULL DEFAULT '/contact',
    `contactPhoneDisplay` VARCHAR(191) NOT NULL DEFAULT '+38 (067) 123-45-67',
    `contactPhoneHref` VARCHAR(191) NOT NULL DEFAULT 'tel:+380671234567',
    `contactEmail` VARCHAR(191) NOT NULL DEFAULT 'hello@plantshop.ua',
    `contactAddress` VARCHAR(191) NOT NULL DEFAULT 'м. Київ, вул. Зелена, 123',
    `showroomHours` TEXT NOT NULL,
    `messengerLabel` VARCHAR(191) NOT NULL DEFAULT 'Telegram / Viber',
    `messengerUrl` VARCHAR(191) NOT NULL DEFAULT '#',
    `facebookUrl` VARCHAR(191) NOT NULL DEFAULT 'https://facebook.com',
    `instagramUrl` VARCHAR(191) NOT NULL DEFAULT 'https://instagram.com',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed singleton settings row
INSERT INTO `SiteSettings` (
    `id`,
    `heroSubtitle`,
    `contactIntro`,
    `footerDescription`,
    `showroomHours`,
    `updatedAt`
) VALUES (
    1,
    'Ексклюзивні рослини, професійний догляд та авторські рішення для створення ідеального простору',
    'Маєте запитання щодо рослин, замовлення або догляду? Напишіть нам — і ми допоможемо підібрати ідеальні рослини саме для вашого простору.',
    'Створюємо зелені простори, які надихають. Преміальні рослини, професійний догляд та індивідуальний підхід до кожного клієнта.',
    'Пн–Пт: 09:00–18:00\nСб: 10:00–16:00',
    CURRENT_TIMESTAMP(3)
);
