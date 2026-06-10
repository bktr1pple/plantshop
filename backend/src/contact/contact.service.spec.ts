import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let mailServiceMock: { sendMail: jest.Mock };
  let siteSettingsServiceMock: { getPublicSettings: jest.Mock };

  beforeEach(() => {
    mailServiceMock = { sendMail: jest.fn() };
    siteSettingsServiceMock = {
      getPublicSettings: jest.fn().mockResolvedValue({
        siteName: 'PlantShop',
        contactEmail: 'hello@plantshop.test',
      }),
    };

    service = new ContactService(
      mailServiceMock as never,
      siteSettingsServiceMock as never,
    );
  });

  it('sendMessage надсилає лист на email із SiteSettings', async () => {
    mailServiceMock.sendMail.mockResolvedValue(undefined);

    await expect(
      service.sendMessage({
        name: 'Олена',
        email: 'olena@example.com',
        phone: '+380501112233',
        subject: 'Консультація',
        message: 'Хочу отримати консультацію щодо підбору рослин.',
        captchaToken: 'captcha-token',
      }),
    ).resolves.toEqual({
      status: 'ok',
      message: 'Повідомлення надіслано. Ми відповімо на вказаний email.',
    });

    expect(siteSettingsServiceMock.getPublicSettings).toHaveBeenCalledTimes(1);
    expect(mailServiceMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'hello@plantshop.test',
        subject: 'PlantShop: Консультація',
      }),
    );
  });
});
