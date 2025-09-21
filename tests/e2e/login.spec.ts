import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('displays Google sign-in CTA', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Googleアカウントでログイン' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Googleでログイン' })).toBeVisible();
  });

  test('renders login CTA on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Googleでログイン' })).toBeVisible();
  });
});
