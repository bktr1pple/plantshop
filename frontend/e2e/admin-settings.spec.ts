import { expect, test } from '@playwright/test';
import { resetMockBackend, setSessionRole } from './helpers';

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('Admin settings smoke flow', () => {
  test.beforeEach(async ({ request }) => {
    await resetMockBackend(request);
  });

  test('ADMIN може оновити settings і побачити їх на публічній сторінці', async ({
    page,
    context,
  }) => {
    const siteName = `PlantShop E2E ${Date.now()}`;
    const contactEmail = `admin-${Date.now()}@plantshop.test`;

    await setSessionRole(context, 'admin');
    await page.goto('/admin/settings');

    await expect(page.getByText('Головна сторінка')).toBeVisible();

    await page.getByPlaceholder('Назва сайту').fill(siteName);
    await page.getByPlaceholder('Email').fill(contactEmail);
    await page.getByRole('button', { name: 'Зберегти зміни' }).click();

    await expect(
      page.getByText('Налаштування збережено'),
    ).toBeVisible();

    await page.goto('/contact');

    await expect(page.getByText(contactEmail).first()).toBeVisible();
    await expect(
      page.getByText(
        new RegExp(`© \\d{4} ${escapeForRegExp(siteName)}\\. Всі права захищені\\.`),
      ),
    ).toBeVisible();
  });
});
