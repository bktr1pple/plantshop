import { expect, test } from '@playwright/test';
import { resetMockBackend, setSessionRole } from './helpers';

test.describe('Admin plants smoke flow', () => {
  test.beforeEach(async ({ request }) => {
    await resetMockBackend(request);
  });

  test('ADMIN може створити, відредагувати і видалити рослину', async ({
    page,
    context,
  }) => {
    const createdName = `E2E Monstera ${Date.now()}`;
    const updatedName = `${createdName} Updated`;

    await setSessionRole(context, 'admin');
    await page.goto('/admin/plants');

    await expect(page.getByText('Каталог рослин')).toBeVisible();

    await page.getByRole('button', { name: 'Додати рослину' }).click();
    await expect(
      page.getByRole('heading', { name: 'Нова рослина' }),
    ).toBeVisible();

    await page.getByPlaceholder('Monstera Deliciosa').fill(createdName);
    await page.getByPlaceholder('199.00').fill('321');
    await page
      .getByPlaceholder('Коротко опишіть рослину, її характер і переваги.')
      .fill('Smoke-flow рослина для E2E перевірки.');
    await page.getByRole('button', { name: 'Створити рослину' }).click();

    await expect(page.getByText(createdName).first()).toBeVisible();
    await expect(
      page.getByText(`Рослину "${createdName}" успішно створено.`),
    ).toBeVisible();

    const createdRow = page.locator('tr', { hasText: createdName });
    await createdRow.getByRole('button', { name: 'Редагувати' }).click();
    await expect(
      page.getByRole('heading', { name: 'Редагування рослини' }),
    ).toBeVisible();

    await page.getByPlaceholder('Monstera Deliciosa').fill(updatedName);
    await page.getByPlaceholder('199.00').fill('456');
    await page.getByRole('button', { name: 'Зберегти зміни' }).click();

    await expect(page.getByText(updatedName).first()).toBeVisible();
    await expect(
      page.getByText(`Рослину "${updatedName}" успішно оновлено.`),
    ).toBeVisible();

    const updatedRow = page.locator('tr', { hasText: updatedName });
    await updatedRow.getByRole('button', { name: 'Видалити' }).click();

    const confirmDialog = page.getByRole('dialog');
    await expect(
      confirmDialog.getByText('Видалити рослину?'),
    ).toBeVisible();
    await confirmDialog.getByRole('button', { name: 'Видалити' }).click();

    await expect(page.locator('tr', { hasText: updatedName })).toHaveCount(0);
    await expect(
      page.getByText(`Рослину "${updatedName}" видалено.`),
    ).toBeVisible();
  });
});
