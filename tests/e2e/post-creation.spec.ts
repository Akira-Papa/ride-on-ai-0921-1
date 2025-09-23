import { test, expect, Page } from '@playwright/test';

// Mock authentication helper
async function mockAuth(page: Page) {
  // Set a mock authentication cookie
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
  ]);
}

test.describe('Post Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await mockAuth(page);

    // Mock the session API endpoint
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            image: 'https://example.com/avatar.jpg',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // Mock categories API
    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            { id: 'cat-1', name: 'キャリア', slug: 'career', description: 'キャリアに関する投稿' },
            { id: 'cat-2', name: '恋愛', slug: 'love', description: '恋愛に関する投稿' },
            { id: 'cat-3', name: '健康', slug: 'health', description: '健康に関する投稿' },
          ],
        }),
      });
    });
  });

  test('should create a new post successfully', async ({ page }) => {
    // Mock the create post API
    await page.route('**/api/posts', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-post-id',
            title: 'テスト投稿タイトル',
            lesson: 'これはテスト投稿の教訓内容です。',
            category: { id: 'cat-1', name: 'キャリア', slug: 'career' },
            author: { id: 'test-user-id', name: 'Test User' },
          }),
        });
      }
    });

    // Navigate to post creation page
    await page.goto('/posts/new');

    // Fill in the form
    await page.getByLabel('タイトル').fill('テスト投稿タイトル');
    await page.getByLabel('学んだこと・教訓').fill('これはテスト投稿の教訓内容です。最低20文字必要です。');
    await page.getByLabel('状況・背景（任意）').fill('テストの状況説明');

    // Select category
    await page.getByLabel('カテゴリー').click();
    await page.getByRole('option', { name: 'キャリア' }).click();

    // Add tags
    await page.getByLabel('タグ').fill('テスト');
    await page.keyboard.press('Enter');
    await page.getByLabel('タグ').fill('E2E');
    await page.keyboard.press('Enter');

    // Select visibility
    await page.getByLabel('公開設定').click();
    await page.getByRole('option', { name: 'メンバーに公開' }).click();

    // Submit the form
    await page.getByRole('button', { name: '投稿する' }).click();

    // Should redirect to the new post page
    await expect(page).toHaveURL('/posts/new-post-id');

    // Success message should be shown
    await expect(page.getByRole('alert')).toContainText('投稿を作成しました');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/posts/new');

    // Try to submit with empty form
    await page.getByRole('button', { name: '投稿する' }).click();

    // Should show validation errors
    await expect(page.getByText('タイトルは必須です')).toBeVisible();
    await expect(page.getByText('教訓は最低20文字必要です')).toBeVisible();
    await expect(page.getByText('カテゴリーを選択してください')).toBeVisible();
  });

  test('should enforce title length limits', async ({ page }) => {
    await page.goto('/posts/new');

    // Try title that's too short
    await page.getByLabel('タイトル').fill('短');
    await page.getByRole('button', { name: '投稿する' }).click();
    await expect(page.getByText('タイトルは3文字以上必要です')).toBeVisible();

    // Try title that's too long (over 120 characters)
    const longTitle = 'あ'.repeat(121);
    await page.getByLabel('タイトル').fill(longTitle);
    await expect(page.getByText('120 / 120')).toBeVisible();
  });

  test('should enforce lesson length limits', async ({ page }) => {
    await page.goto('/posts/new');

    // Try lesson that's too short
    await page.getByLabel('学んだこと・教訓').fill('短い内容');
    await page.getByRole('button', { name: '投稿する' }).click();
    await expect(page.getByText('教訓は最低10文字必要です')).toBeVisible();

    // Check character counter
    await page.getByLabel('学んだこと・教訓').fill('これは十分な長さの教訓内容です。');
    await expect(page.getByText(/\d+ \/ 2000/)).toBeVisible();
  });

  test('should limit tags to 5', async ({ page }) => {
    await page.goto('/posts/new');

    // Add 5 tags (maximum)
    for (let i = 1; i <= 5; i++) {
      await page.getByLabel('タグ').fill(`タグ${i}`);
      await page.keyboard.press('Enter');
    }

    // Try to add a 6th tag
    await page.getByLabel('タグ').fill('タグ6');
    await page.keyboard.press('Enter');

    // Should show error or prevent addition
    await expect(page.getByText('タグは最大5個まで')).toBeVisible();
  });

  test('should save draft and restore on navigation', async ({ page }) => {
    await page.goto('/posts/new');

    // Fill in form data
    await page.getByLabel('タイトル').fill('下書きテストタイトル');
    await page.getByLabel('学んだこと・教訓').fill('これは下書きの教訓内容です。保存されるはずです。');

    // Navigate away
    await page.goto('/dashboard');

    // Navigate back
    await page.goto('/posts/new');

    // Check if draft was restored
    await expect(page.getByLabel('タイトル')).toHaveValue('下書きテストタイトル');
    await expect(page.getByLabel('学んだこと・教訓')).toHaveValue('これは下書きの教訓内容です。保存されるはずです。');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/posts', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'サーバーエラー' },
          }),
        });
      }
    });

    await page.goto('/posts/new');

    // Fill valid form
    await page.getByLabel('タイトル').fill('テスト投稿');
    await page.getByLabel('学んだこと・教訓').fill('これは十分な長さの教訓内容です。');
    await page.getByLabel('カテゴリー').click();
    await page.getByRole('option', { name: 'キャリア' }).click();

    // Submit
    await page.getByRole('button', { name: '投稿する' }).click();

    // Should show error message
    await expect(page.getByRole('alert')).toContainText('エラーが発生しました');

    // Form should remain filled
    await expect(page.getByLabel('タイトル')).toHaveValue('テスト投稿');
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/posts/new');

    // Navigate through form with Tab key
    await page.keyboard.press('Tab'); // Focus on title
    await expect(page.getByLabel('タイトル')).toBeFocused();

    await page.keyboard.type('キーボードナビゲーションテスト');

    await page.keyboard.press('Tab'); // Focus on lesson
    await expect(page.getByLabel('学んだこと・教訓')).toBeFocused();

    await page.keyboard.type('これはキーボードで入力された教訓内容です。');

    await page.keyboard.press('Tab'); // Focus on situation
    await expect(page.getByLabel('状況・背景（任意）')).toBeFocused();

    await page.keyboard.press('Tab'); // Focus on category
    await page.keyboard.press('Tab'); // Focus on tags
    await page.keyboard.press('Tab'); // Focus on visibility
    await page.keyboard.press('Tab'); // Focus on submit button

    // Submit with Enter key
    await page.keyboard.press('Enter');
  });

  test('should show confirmation dialog when navigating away with unsaved changes', async ({ page }) => {
    await page.goto('/posts/new');

    // Fill in some data
    await page.getByLabel('タイトル').fill('未保存のタイトル');

    // Set up dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('変更が保存されていません');
      await dialog.dismiss(); // Stay on page
    });

    // Try to navigate away
    await page.getByRole('link', { name: 'Dashboard' }).click();

    // Should still be on the same page
    await expect(page).toHaveURL('/posts/new');
    await expect(page.getByLabel('タイトル')).toHaveValue('未保存のタイトル');
  });

  test('should handle concurrent form submissions', async ({ page }) => {
    let submissionCount = 0;
    await page.route('**/api/posts', async (route) => {
      if (route.request().method() === 'POST') {
        submissionCount++;
        if (submissionCount === 1) {
          // First request takes longer
          await page.waitForTimeout(1000);
        }
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: `post-${submissionCount}` }),
        });
      }
    });

    await page.goto('/posts/new');

    // Fill valid form
    await page.getByLabel('タイトル').fill('テスト投稿');
    await page.getByLabel('学んだこと・教訓').fill('これは十分な長さの教訓内容です。');
    await page.getByLabel('カテゴリー').click();
    await page.getByRole('option', { name: 'キャリア' }).click();

    // Double-click submit button (simulate accidental double submission)
    const submitButton = page.getByRole('button', { name: '投稿する' });
    await submitButton.dblclick();

    // Should only submit once
    expect(submissionCount).toBeLessThanOrEqual(1);

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled();
  });
});