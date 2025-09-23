import { expect, test } from '@playwright/test';

test.describe('PostList harness', () => {
  test('renders initial cards and completion message', async ({ page }) => {
    await page.goto('/test-harness/post-list');
    await expect(page.getByRole('heading', { name: 'PostList ハーネス' })).toBeVisible();
    await expect(page.getByText('ハーネス用投稿 1')).toBeVisible();
    await expect(page.getByText('ハーネス用投稿 2')).toBeVisible();
    await expect(page.getByText('すべての投稿を読み込みました')).toBeVisible();
  });

  test('loads more posts when sentinel enters viewport', async ({ page }) => {
    await page.route('**/api/posts?cursor=cursor-1&limit=10**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          posts: [
            {
              id: 'post-h-3',
              title: '追加読み込みされた投稿',
              lessonPreview: '無限スクロールで取得したデータ。',
              tags: [],
              visibility: 'member',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: { id: 'cat-x', name: 'テスト', slug: 'test' },
              author: { id: 'user-x', name: 'Tester', image: null },
              reactions: {
                likeCount: 0,
                bookmarkCount: 0,
                viewerHasLiked: false,
                viewerHasBookmarked: false,
              },
            },
          ],
          nextCursor: undefined,
        }),
      });
      await page.unroute('**/api/posts?cursor=cursor-1&limit=10**');
    });

    await page.goto('/test-harness/post-list');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByText('追加読み込みされた投稿')).toBeVisible();
    await expect(page.getByText('すべての投稿を読み込みました')).toBeVisible();
  });

  test('shows error toast and retries successfully after failure', async ({ page }) => {
    let callCount = 0;
    await page.route('**/api/posts?cursor=cursor-1&limit=10**', async (route) => {
      callCount += 1;
      if (callCount === 1) {
        await route.fulfill({ status: 500, body: 'error' });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          posts: [
            {
              id: 'post-h-4',
              title: '再試行で取得した投稿',
              lessonPreview: 'エラー後に読み込み成功。',
              tags: [],
              visibility: 'member',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: { id: 'cat-y', name: 'リトライ', slug: 'retry' },
              author: { id: 'user-y', name: 'RetryUser', image: null },
              reactions: {
                likeCount: 0,
                bookmarkCount: 0,
                viewerHasLiked: false,
                viewerHasBookmarked: false,
              },
            },
          ],
          nextCursor: undefined,
        }),
      });
      await page.unroute('**/api/posts?cursor=cursor-1&limit=10**');
    });

    await page.goto('/test-harness/post-list');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const alert = await page.getByRole('alert', {
      name: '投稿の取得に失敗しました',
    });
    await expect(alert).toBeVisible();
    const retryButton = page.getByRole('button', { name: '再試行' });
    await retryButton.click();

    await expect(page.getByText('再試行で取得した投稿')).toBeVisible();
    await expect(page.getByRole('alert')).toBeHidden({ timeout: 2000 });
  });
});

test.describe('PostCard harness', () => {
  test('navigates with tag filter', async ({ page }) => {
    await page.goto('/test-harness/post-card');
    await page.getByText('#career').click();
    await expect(page).toHaveURL(/tag=career/);
  });

  test('toggles like reaction successfully', async ({ page }) => {
    await page.route('**/api/posts/post-card-h-1/reactions?type=like**', async (route) => {
      await route.fulfill({ status: 201, body: '{}' });
      await page.unroute('**/api/posts/post-card-h-1/reactions?type=like**');
    });

    await page.goto('/test-harness/post-card');
    const likeButton = page.getByRole('button', { name: '共感' });
    await likeButton.click();
    await expect(page.getByText('6')).toBeVisible();
  });

  test('rolls back like count and shows error toast on failure', async ({ page }) => {
    await page.route('**/api/posts/post-card-h-1/reactions?type=like**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: '失敗しました' } }),
      });
      await page.unroute('**/api/posts/post-card-h-1/reactions?type=like**');
    });

    await page.goto('/test-harness/post-card');
    const likeButton = page.getByRole('button', { name: '共感' });
    await likeButton.click();

    await expect(page.getByRole('alert', { name: '予期せぬエラーが発生しました' })).toBeVisible();
    await expect(page.getByText('5')).toBeVisible();
  });

  test('removes bookmark when toggled off', async ({ page }) => {
    await page.route('**/api/posts/post-card-h-1/reactions?type=bookmark**', async (route) => {
      const method = route.request().method();
      if (method === 'DELETE') {
        await route.fulfill({ status: 204, body: '' });
      } else {
        await route.fulfill({ status: 201, body: '{}' });
      }
      await page.unroute('**/api/posts/post-card-h-1/reactions?type=bookmark**');
    });

    await page.goto('/test-harness/post-card');
    const bookmarkButton = page.getByRole('button', { name: 'あとで読む' });
    await bookmarkButton.click();
    await expect(page.getByText('0')).toBeVisible();
  });
});
