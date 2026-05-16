import { expect, test } from '@playwright/test';

test('serves the public app shell', async ({ request }) => {
  const response = await request.get('/');
  expect(response.ok()).toBe(true);
  await expect(response.text()).resolves.toContain('<title>dexter-b.com</title>');
});
