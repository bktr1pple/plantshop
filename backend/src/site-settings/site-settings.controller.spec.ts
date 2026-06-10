import { SiteSettingsController } from './site-settings.controller';

describe('SiteSettingsController', () => {
  let controller: SiteSettingsController;
  let siteSettingsServiceMock: {
    getPublicSettings: jest.Mock;
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
  };

  beforeEach(() => {
    siteSettingsServiceMock = {
      getPublicSettings: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    };

    controller = new SiteSettingsController(siteSettingsServiceMock as never);
  });

  it('getPublicSettings повертає публічні налаштування', async () => {
    siteSettingsServiceMock.getPublicSettings.mockResolvedValue({ id: 1 });

    await expect(controller.getPublicSettings()).resolves.toEqual({ id: 1 });
    expect(siteSettingsServiceMock.getPublicSettings).toHaveBeenCalled();
  });

  it('getAdminSettings повертає повні налаштування', async () => {
    siteSettingsServiceMock.getSettings.mockResolvedValue({ id: 1 });

    await expect(controller.getAdminSettings()).resolves.toEqual({ id: 1 });
    expect(siteSettingsServiceMock.getSettings).toHaveBeenCalled();
  });

  it('updateSettings делегує оновлення сервісу', async () => {
    siteSettingsServiceMock.updateSettings.mockResolvedValue({
      id: 1,
      siteName: 'PlantShop Admin',
    });

    await expect(
      controller.updateSettings({ siteName: 'PlantShop Admin' }),
    ).resolves.toEqual({
      id: 1,
      siteName: 'PlantShop Admin',
    });
    expect(siteSettingsServiceMock.updateSettings).toHaveBeenCalledWith({
      siteName: 'PlantShop Admin',
    });
  });
});
