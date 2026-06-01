import { test, expect } from '@playwright/test';

test('Negative Test 3 - Graduation Date Beyond Allowed Range', async ({ page }) => {
  await page.goto('http://localhost:5000/page/1');
  await page.getByRole('textbox', { name: 'Full Name *' }).click();
  await page.getByRole('textbox', { name: 'Full Name *' }).fill('Rahul Sharma');
  await page.getByRole('textbox', { name: 'Full Name *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email *' }).fill('rahul@example.com');
  await page.getByRole('textbox', { name: 'Email *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Phone Number *' }).fill('+91 8756568721');
  await page.getByRole('textbox', { name: 'Phone Number *' }).press('Tab');
  await page.getByLabel('University *').selectOption('Tech Institute');
  await page.getByRole('textbox', { name: 'Major/Degree *' }).click();
  await page.getByRole('textbox', { name: 'Major/Degree *' }).fill('Data Science');
  await page.getByRole('textbox', { name: 'Expected Graduation *' }).fill('2029-12-01');
  await page.getByRole('button', { name: 'Resume Upload *' })
    .setInputFiles('Rahul_S_RS_Design_Freelancer_Resume.pdf');
  const errorMsg = page.getByText(/Graduation date must be within the next 2 years/i);
  await expect(errorMsg).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
});