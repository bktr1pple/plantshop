import { expect, test, type Page } from '@playwright/test';
import {
  resetMockBackend,
  setMockBackendConfig,
  setSessionRole,
} from './helpers';

async function openCartWithFirstPlant(page: Page) {
  await page.goto('/plants');
  await expect(page.getByText('Монстера Деліціоза')).toBeVisible();

  await page.getByRole('button', { name: 'Add' }).first().click();
  await page.getByRole('button', { name: 'Shopping cart' }).click();

  await expect(page.getByRole('heading', { name: /Кошик/ })).toBeVisible();
}

async function createOrderFromCart(page: Page, note: string) {
  await openCartWithFirstPlant(page);
  await page
    .getByPlaceholder('Коментар до замовлення (необов’язково)')
    .fill(note);

  await page.getByRole('button', { name: 'Підтвердити замовлення' }).click();

  await expect(page.getByText('Замовлення створено')).toBeVisible();
  await page.waitForURL(/\/dashboard\/orders\?orderId=\d+$/);

  const orderId = Number(new URL(page.url()).searchParams.get('orderId'));
  expect(orderId).toBeGreaterThan(0);

  return orderId;
}

test.describe('User cabinet smoke flow', () => {
  test.beforeEach(async ({ request }) => {
    await resetMockBackend(request);
  });

  test('USER може пройти settings -> checkout -> orders -> dashboard -> logout', async ({
    page,
    context,
  }) => {
    const updatedPhone = '+380991234567';
    const checkoutNote = 'Потрібна акуратна доставка після 18:00';

    await setSessionRole(context, 'user');

    await page.goto('/dashboard');
    await expect(
      page.getByRole('heading', { name: /Вітаємо, Regular User/ }),
    ).toBeVisible();
    await expect(page.getByText('У вас ще немає замовлень')).toBeVisible();

    await page.goto('/dashboard/settings');
    await expect(
      page.getByRole('heading', { name: 'Налаштування профілю' }),
    ).toBeVisible();

    await page.getByPlaceholder('+380...').fill(updatedPhone);
    await page.getByRole('button', { name: 'Зберегти зміни' }).click();

    await expect(page.getByText('Налаштування збережено')).toBeVisible();

    await page.reload();
    await expect(page.getByPlaceholder('+380...')).toHaveValue(updatedPhone);

    const orderId = await createOrderFromCart(page, checkoutNote);

    await expect(
      page.getByRole('heading', { name: `Замовлення #${orderId}` }),
    ).toBeVisible();
    await expect(page.getByText(updatedPhone)).toBeVisible();
    await expect(page.getByText(checkoutNote)).toBeVisible();

    await page.goto(`/dashboard/orders/${orderId}`);
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/orders\\?orderId=${orderId}$`),
    );
    await expect(
      page.getByRole('heading', { name: `Замовлення #${orderId}` }),
    ).toBeVisible();

    await page.goto('/dashboard/orders/1');
    await expect(page.getByText('Order with id 1 not found')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: `Замовлення #${orderId}` }),
    ).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.getByText(`Замовлення #${orderId}`)).toBeVisible();
    await page.getByRole('button', { name: 'Відкрити деталі' }).click();
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/orders\\?orderId=${orderId}$`),
    );

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Вийти' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('USER не може відкрити /admin/orders і редіректиться в кабінет', async ({
    page,
    context,
  }) => {
    await setSessionRole(context, 'user');

    await page.goto('/admin/orders');

    await expect(page).toHaveURL(/\/dashboard(?:$|\?)/);
    await expect(page.getByText('Особистий кабінет')).toBeVisible();
  });

  test('анонімний checkout не фейкує order creation і веде в login flow', async ({
    page,
    context,
  }) => {
    await setSessionRole(context, 'anonymous');

    await openCartWithFirstPlant(page);
    await page.getByRole('button', { name: 'Увійти для оформлення' }).click();

    await expect(page).toHaveURL(/\/\?auth=login$/);
  });

  test('тимчасова недоступність auth backend веде на нейтральну auth-unavailable сторінку', async ({
    page,
    context,
    request,
  }) => {
    await setMockBackendConfig(request, { authUnavailable: true });
    await setSessionRole(context, 'user');

    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/auth-unavailable\?next=%2Fdashboard$/);
    await expect(
      page.getByRole('heading', { name: 'Не вдалося перевірити сесію' }),
    ).toBeVisible();
  });
});
