import { expect, test } from '@playwright/test';

const login = async (page) => {
  await page.route('**/api/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Authentication successful',
        user: { username: 'dexterb', role: 'guardian' },
      }),
    });
  });

  await page.goto('/login');
  await page.getByPlaceholder('Username').fill('dexterb');
  await page.getByPlaceholder('Passcode').fill('guardian-pass');
  await page.getByRole('button', { name: /initiate handshake/i }).click();
  await expect(page).toHaveURL(/\/bats$/);
};

const fillRequiredBatsFields = async (page) => {
  await page.getByPlaceholder('e.g. Samsung 55 UHD').fill('Studio Display');
  await page.locator('select[name="categoryPageId"]').selectOption('cat1');
};

const openNewAssetForm = async (page) => {
  await page.getByRole('link', { name: /add bats asset/i }).click();
  await expect(page).toHaveURL(/\/bats\/new$/);
};

test('serves the public app shell and renders home without manifest data', async ({ page }) => {
  await page.route('**/api/manifest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.goto('/');

  await expect(page).toHaveTitle(/dexter-b\.com/i);
  await expect(page.getByRole('heading', { name: 'Dexter B' }).last()).toBeVisible();
  await expect(page.getByText('No active Spotlight gear detected.')).toBeVisible();
});

test('redirects direct BATS visits to login', async ({ page }) => {
  await page.goto('/bats');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'RESTRICTED SECTOR' })).toBeVisible();
});

test('logs in and completes the BATS mock sync flow', async ({ page }) => {
  await page.route('**/api/bats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await login(page);
  await openNewAssetForm(page);
  await fillRequiredBatsFields(page);

  await expect(page.getByRole('button', { name: /save bats/i })).toBeEnabled();
  await page.getByRole('button', { name: /save bats/i }).click();

  await expect(page.getByText('BM-VIS-002')).toBeVisible();
  await expect(page.getByText('Baffle ID Assigned')).toBeVisible();
});

test('sends canonical BATS live payload and handles success', async ({ page }) => {
  let capturedBody;

  await page.route('**/api/bats', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    capturedBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ page_id: 'notion-page-1234' }),
    });
  });

  await login(page);
  await openNewAssetForm(page);

  await page.locator('header button').click();
  await page.getByRole('button', { name: 'LIVE' }).click();
  await fillRequiredBatsFields(page);
  await page.locator('select[name="locationPageId"]').selectOption('loc1');
  await page.locator('input[name="serialNumber"]').fill('PRIVATE-SERIAL');
  await page.locator('input[name="unitPrice"]').fill('1999.99');
  await page.locator('textarea[name="notes"]').fill('Internal note');
  await page.getByRole('button', { name: /save bats/i }).click();

  await expect(page.getByText('NODE-1234')).toBeVisible();
  expect(capturedBody).toEqual({
    assetData: {
      name: 'Studio Display',
      categoryPageId: 'cat1',
      locationPageId: 'loc1',
      assetClass: 'Expensed (Section 179)',
      status: 'Available',
      primaryUser: 'DexterB',
      syncStatus: 'Draft',
      serialNumber: 'PRIVATE-SERIAL',
      unitPrice: 1999.99,
      notes: 'Internal note',
    },
  });
});
