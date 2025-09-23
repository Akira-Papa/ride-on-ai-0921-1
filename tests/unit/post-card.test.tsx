import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';

import { PostCard } from '@/components/posts/PostCard';
import type { PostListItem } from '@/lib/types/posts';
import { renderWithProviders } from './test-utils';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: jest.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

describe('PostCard', () => {
  const basePost: PostListItem = {
    id: 'post-1',
    title: 'タイトル',
    lessonPreview: '教訓プレビュー',
    tags: ['tag1', 'tag2'],
    visibility: 'member',
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    category: {
      id: 'cat-1',
      name: 'キャリア',
      slug: 'career',
    },
    author: {
      id: 'user-1',
      name: 'Author',
      image: null,
    },
    reactions: {
      likeCount: 0,
      bookmarkCount: 0,
      viewerHasLiked: false,
      viewerHasBookmarked: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (typeof global.fetch === 'function' && 'mockClear' in global.fetch) {
      (global.fetch as unknown as jest.Mock).mockClear();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).fetch;
  });

  it('navigates to dashboard with tag filter when tag chip is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostCard post={basePost} />);

    await user.click(screen.getByText('#tag1'));
    expect(pushMock).toHaveBeenCalledWith('/dashboard?tag=tag1');
  });

  it('increments like counter on successful reaction update', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<PostCard post={basePost} />);

    const likeButton = screen.getByRole('button', { name: '共感' });
    const likeCounter = likeButton.nextElementSibling as HTMLElement;
    await user.click(likeButton);

    await act(async () => {
      await Promise.resolve();
    });

    expect(likeCounter).toHaveTextContent('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts/post-1/reactions'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rolls back optimistic update and shows error on failure', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: '失敗' } }),
    });

    const user = userEvent.setup();
    renderWithProviders(<PostCard post={basePost} />);

    const likeButton = screen.getByRole('button', { name: '共感' });
    const likeCounter = likeButton.nextElementSibling as HTMLElement;
    await user.click(likeButton);

    await act(async () => {
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalled();
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent('予期せぬエラーが発生しました');
    expect(likeCounter).toHaveTextContent('0');

    consoleSpy.mockRestore();
  });
});
