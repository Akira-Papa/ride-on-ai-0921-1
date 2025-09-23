import { expect, test } from '@playwright/test';

test.describe('Authentication and routing', () => {
  test('displays Google sign-in CTA', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: 'Googleアカウントでログイン' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Googleでログイン' })).toBeVisible();
  });

  test('renders login CTA on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Googleでログイン' })).toBeVisible();
  });

  test('shows session expired message when error parameter exists', async ({ page }) => {
    await page.goto('/login?error=SessionRequired');
    await expect(
      page.getByText('セッションの有効期限が切れました。再度ログインしてください。'),
    ).toBeVisible();
  });

  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects unauthenticated user from post creation to login', async ({ page }) => {
    await page.goto('/posts/new');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('returns 401 for unauthenticated session API request', async ({ request }) => {
    const response = await request.get('/api/categories');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  test('allows keyboard navigation to login button', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Googleでログイン' })).toBeFocused();
  });
});
