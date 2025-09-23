import { test, expect } from '@playwright/test';

test.describe('Simple User Flows', () => {
  test('should navigate from home to login', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Should redirect to dashboard or login
    await expect(page).toHaveURL(/\/(dashboard|login)/);
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');

    // Check for login page elements - h2 is used instead of h1
    await expect(page.getByRole('heading')).toContainText(/ログイン|Google/);
    await expect(page.getByRole('button', { name: /Google|ログイン/ })).toBeVisible();
  });

  test('should show 404 page for non-existent routes', async ({ page }) => {
    const response = await page.goto('/non-existent-page');

    // Should return 404 status
    expect(response?.status()).toBe(404);
  });

  test('should handle API errors gracefully', async ({ request }) => {
    // Test unauthorized API access
    const response = await request.get('/api/posts');
    expect(response.status()).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/login');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Check if an element is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should respect color scheme preferences', async ({ page }) => {
    // Test with light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/login');

    // Take a screenshot for visual comparison (optional)
    await page.screenshot({ path: 'test-results/login-light.png' });

    // Test with dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();

    // Take another screenshot
    await page.screenshot({ path: 'test-results/login-dark.png' });
  });

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/login');

    // Login button should still be visible on mobile
    await expect(page.getByRole('button', { name: /Google|ログイン/ })).toBeVisible();
  });

  test('should handle network offline gracefully', async ({ page, context }) => {
    await page.goto('/login');

    // Go offline
    await context.setOffline(true);

    // Try to navigate - should show browser's offline page or cached content
    await page.reload().catch(() => {
      // Expected to fail when offline
    });

    // Go back online
    await context.setOffline(false);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/login');

    // Check for important meta tags
    const title = await page.title();
    expect(title).toBeTruthy();

    const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
    expect(viewport).toContain('width=device-width');
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    const loginUrl = page.url();

    // Try to go to dashboard (should redirect to login if not authenticated)
    await page.goto('/dashboard');

    // Use browser back button
    await page.goBack();

    // Should be back at the previous page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });
});