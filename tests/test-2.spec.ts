import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5000/page/1');
  await page.getByRole('textbox', { name: 'Full Name *' }).click();
  await page.getByRole('textbox', { name: 'Full Name *' }).fill('Alice');
  await page.getByRole('textbox', { name: 'Full Name *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email *' }).fill('user@example.com');
  await page.getByRole('textbox', { name: 'Email *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Phone Number *' }).fill('+91 000000000');
  await page.getByRole('textbox', { name: 'Phone Number *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Phone Number *' }).click();
  await page.getByRole('textbox', { name: 'Phone Number *' }).click();
  await page.getByRole('textbox', { name: 'Phone Number *' }).fill('+91 00000');
  await page.getByRole('textbox', { name: 'Phone Number *' }).press('Tab');
  const error = await page.getByText('Enter a valid phone number.');
  expect(error).toBeVisible();
});