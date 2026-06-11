import { devices, expect, test } from '@playwright/test';
import { resetMockBackend } from './helpers';

const mobileViewport = devices['Pixel 7'].viewport;

test.describe('Mobile viewport smoke flow', () => {
  test.use({ viewport: mobileViewport });

  test.beforeEach(async ({ request }) => {
    await resetMockBackend(request);
  });

  test('головна сторінка рендериться і мобільне меню працює', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('link', { name: /PlantShop/i }).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Відкрити меню' }).click();
    await expect(
      page.getByRole('link', { name: 'Ландшафтний дизайн' }).first(),
    ).toBeVisible();
  });

  test('каталог рослин показує позиції і реальний пошук на мобільному', async ({
    page,
  }) => {
    await page.goto('/plants');

    await expect(
      page.getByRole('heading', { name: 'Каталог рослин PlantShop' }),
    ).toBeVisible();
    await expect(page.getByText('Монстера Деліціоза').first()).toBeVisible();

    await page.goto(`/plants?search=${encodeURIComponent('Фікус')}`);

    await expect(
      page.getByText('Результати пошуку за запитом «Фікус»: 1'),
    ).toBeVisible();
    await expect(page.getByText('Фікус Лірата').first()).toBeVisible();
    await expect(page.getByText('Монстера Деліціоза')).toHaveCount(0);

    await page.getByRole('link', { name: 'Скинути пошук' }).click();
    await expect(page.getByText('Монстера Деліціоза').first()).toBeVisible();
  });

  test('пошук без збігів показує чесний порожній стан', async ({ page }) => {
    await page.goto(`/plants?search=${encodeURIComponent('неіснуюча')}`);

    await expect(page.getByText('Рослини не знайдено')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Переглянути весь каталог' }),
    ).toBeVisible();
  });
});
