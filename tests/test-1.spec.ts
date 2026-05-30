import { test, expect } from '@playwright/test';

test('page1', async ({ page }) => {
  await page.goto('http://localhost:5000/page/1');
  await page.getByRole('textbox', { name: 'Full Name *' }).click();
  await page.getByRole('textbox', { name: 'Full Name *' }).fill('User 1');
  await page.getByRole('textbox', { name: 'Full Name *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email *' }).fill('user@example.com');
  await page.getByRole('textbox', { name: 'Email *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Phone Number *' }).fill('123456789');
  await page.getByRole('textbox', { name: 'Phone Number *' }).press('Tab');
  await page.getByLabel('University *').selectOption('State University');
  await page.getByRole('textbox', { name: 'Major/Degree *' }).click();
  await page.getByRole('textbox', { name: 'Major/Degree *' }).fill('CS');
  await page.getByRole('textbox', { name: 'Expected Graduation *' }).fill('2026-12-01');
  await page.locator('div').filter({ hasText: 'Next' }).nth(2).click();
  await page.getByRole('button', { name: 'Resume Upload *' }).click();
  await page.getByRole('button', { name: 'Resume Upload *' }).setInputFiles("C:\\Users\\Afnan\\Documents\\GitHub\\workshop_intern_app\\tests\\presentation.pdf");
  await page.locator('div').filter({ hasText: 'Next' }).nth(2).click();
  await page.getByLabel('University *').selectOption('Tech Institute');
  await page.getByRole('textbox', { name: 'Email *' }).click();
  await page.getByRole('textbox', { name: 'Phone Number *' }).click();
  await page.getByRole('textbox', { name: 'Phone Number *' }).fill('+91 123456789');
  await page.getByText('University *').click();
  await page.getByText('Phone Number *').click();
  await page.getByRole('button', { name: 'Next' }).click();
});

