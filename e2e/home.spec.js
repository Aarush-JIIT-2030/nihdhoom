import { test, expect } from '@playwright/test';

test('farmer journey shell renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('NIRDHOOM').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Book field clearance/i })).toBeVisible();
  await page.getByRole('button', { name: /My fields/i }).click();
  await expect(page.getByRole('heading', { name: /Field records/i })).toBeVisible();
  await page.getByRole('button', { name: /Book clearance/i }).click();
  await expect(page.getByRole('heading', { name: /Sell certainty/i })).toBeVisible();
});
