import { expect, test } from '@playwright/test';
import { resetMockBackend, setSessionRole } from './helpers';

test.describe('Admin access control', () => {
  test.beforeEach(async ({ request }) => {
    await resetMockBackend(request);
  });

  test('ADMIN може відкрити /admin і перейти по основних розділах shell', async ({
    page,
    context,
  }) => {
    await setSessionRole(context, 'admin');

    await page.goto('/admin');

    await expect(
      page.getByRole('heading', { name: 'Огляд' }),
    ).toBeVisible();
    await expect(page.getByText('Швидкі дії')).toBeVisible();

    await page.getByRole('link', { name: 'Рослини' }).click();
    await expect(page).toHaveURL(/\/admin\/plants$/);
    await expect(page.getByText('Каталог рослин')).toBeVisible();

    await page.getByRole('link', { name: 'Медіа' }).click();
    await expect(page).toHaveURL(/\/admin\/media$/);
    await expect(page.getByText('Медіатека', { exact: true })).toBeVisible();
    await expect(page.getByText('Медіатека порожня')).toBeVisible();

    await page.getByRole('link', { name: 'Налаштування' }).click();
    await expect(page).toHaveURL(/\/admin\/settings$/);
    await expect(page.getByText('Головна сторінка')).toBeVisible();
  });

  test('USER не може відкрити /admin і бачить /forbidden', async ({
    page,
    context,
  }) => {
    await setSessionRole(context, 'user');

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/forbidden$/);
  });

  test('анонімний користувач редіректиться з /admin у login flow', async ({
    page,
    context,
  }) => {
    await setSessionRole(context, 'anonymous');

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/\?auth=login/);
  });
});
