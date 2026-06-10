import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

describe('Site settings DTO validation', () => {
  it('приймає локальні та HTTPS навігаційні URL', async () => {
    const dto = plainToInstance(UpdateSiteSettingsDto, {
      heroPrimaryCtaHref: '/plants?page=2',
      footerCtaHref: 'https://example.com/contact',
      messengerUrl: '#contacts',
      facebookUrl: 'https://facebook.com/plantshop',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([
    'javascript:alert(1)',
    '//evil.test/path',
    'data:text/html,test',
    'http://insecure.test',
  ])('відхиляє небезпечний CTA URL: %s', async (url) => {
    const dto = plainToInstance(UpdateSiteSettingsDto, {
      heroPrimaryCtaHref: url,
    });

    const errors = await validate(dto);

    expect(
      errors.some((error) => error.property === 'heroPrimaryCtaHref'),
    ).toBe(true);
  });
});
