import { SiteSettingsService } from './site-settings.service';

describe('SiteSettingsService', () => {
  let service: SiteSettingsService;
  let prismaMock: {
    siteSettings: {
      upsert: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      siteSettings: {
        upsert: jest.fn(),
      },
    };

    service = new SiteSettingsService(prismaMock as never);
  });

  it('getSettings повертає singleton через upsert', async () => {
    prismaMock.siteSettings.upsert.mockResolvedValue({ id: 1 });

    await expect(service.getSettings()).resolves.toEqual({ id: 1 });
    const [call] = prismaMock.siteSettings.upsert.mock.calls as Array<
      [
        {
          where: { id: number };
          update: Record<string, never>;
          create: { id: number; siteName: string; heroPrimaryCtaHref: string };
        },
      ]
    >;
    const args = call?.[0] as {
      where: { id: number };
      update: Record<string, never>;
      create: { id: number; siteName: string; heroPrimaryCtaHref: string };
    };

    expect(args.where).toEqual({ id: 1 });
    expect(args.update).toEqual({});
    expect(args.create).toMatchObject({
      id: 1,
      siteName: 'PlantShop',
      heroPrimaryCtaHref: '/plants',
    });
  });

  it('getPublicSettings використовує той самий singleton', async () => {
    const getSettingsSpy = jest
      .spyOn(service, 'getSettings')
      .mockResolvedValue({ id: 1, siteName: 'PlantShop' } as never);

    await expect(service.getPublicSettings()).resolves.toEqual({
      id: 1,
      siteName: 'PlantShop',
    });
    expect(getSettingsSpy).toHaveBeenCalled();
  });

  it('updateSettings оновлює singleton через upsert', async () => {
    prismaMock.siteSettings.upsert.mockResolvedValue({
      id: 1,
      siteName: 'Admin PlantShop',
    });

    await expect(
      service.updateSettings({
        siteName: 'Admin PlantShop',
      }),
    ).resolves.toEqual({
      id: 1,
      siteName: 'Admin PlantShop',
    });

    const [call] = prismaMock.siteSettings.upsert.mock.calls as Array<
      [
        {
          where: { id: number };
          update: { siteName: string };
          create: { id: number; siteName: string; footerCtaHref: string };
        },
      ]
    >;
    const args = call?.[0] as {
      where: { id: number };
      update: { siteName: string };
      create: { id: number; siteName: string; footerCtaHref: string };
    };

    expect(args.where).toEqual({ id: 1 });
    expect(args.update).toEqual({
      siteName: 'Admin PlantShop',
    });
    expect(args.create).toMatchObject({
      id: 1,
      siteName: 'Admin PlantShop',
      footerCtaHref: '/contact',
    });
  });
});
