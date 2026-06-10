import { BadRequestException } from '@nestjs/common';
import { ContactController } from './contact.controller';

describe('ContactController', () => {
  let controller: ContactController;
  let contactServiceMock: { sendMessage: jest.Mock };
  let originalFetch: typeof global.fetch;

  const dto = {
    name: 'Олена',
    email: 'olena@example.com',
    phone: '+380501112233',
    subject: 'Консультація',
    message: 'Хочу отримати консультацію щодо підбору рослин.',
    captchaToken: 'captcha-token',
  };

  beforeEach(() => {
    originalFetch = global.fetch;
    contactServiceMock = {
      sendMessage: jest.fn().mockResolvedValue({
        status: 'ok',
        message: 'Повідомлення надіслано.',
      }),
    };
    controller = new ContactController(contactServiceMock as never);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('create перевіряє captcha і делегує відправлення сервісу', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    }) as never;

    await expect(controller.create(dto)).resolves.toEqual({
      status: 'ok',
      message: 'Повідомлення надіслано.',
    });
    expect(contactServiceMock.sendMessage).toHaveBeenCalledWith(dto);
  });

  it('create відхиляє звернення з невалідною captcha', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: false }),
    }) as never;

    await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    expect(contactServiceMock.sendMessage).not.toHaveBeenCalled();
  });
});
