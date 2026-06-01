import { test, expect } from '@playwright/test';

test('Negative Test 1 - Invalid Resume Format', async ({ page }) => {
  await page.goto('http://localhost:5000/page/1');

  await page.getByRole('textbox', { name: 'Full Name *' }).click();
  await page.getByRole('textbox', { name: 'Full Name *' }).fill('Rishab Singh');
  await page.getByRole('textbox', { name: 'Full Name *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email *' }).fill('rish@example.com');
  await page.getByRole('textbox', { name: 'Email *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Phone Number *' }).fill('+91 8745632189');
  await page.getByRole('textbox', { name: 'Phone Number *' }).press('Tab');
  await page.getByLabel('University *').selectOption('Tech Institute');
  await page.getByRole('textbox', { name: 'Major/Degree *' }).fill('Computer Science');
  await page.getByRole('textbox', { name: 'Major/Degree *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Expected Graduation *' }).fill('2027-12-01');
  await page.getByRole('button', { name: 'Resume Upload *' })
    .setInputFiles('resume_test.txt');
  const errorMsg = page.locator('text=Resume must be a PDF or Word document');
  await expect(errorMsg).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();  
});