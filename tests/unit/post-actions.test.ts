import { AppError } from '@/lib/utils/errors';
import {
  createPostAction,
  deletePostAction,
  updatePostAction,
} from '@/app/(dashboard)/posts/actions';
import { INITIAL_STATE } from '@/app/(dashboard)/posts/action-helpers';

jest.mock('@/lib/auth/session', () => ({
  requireServerSession: jest.fn(),
}));

jest.mock('@/lib/services/postService', () => ({
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const requireServerSession = jest.requireMock('@/lib/auth/session')
  .requireServerSession as jest.Mock;
const postService = jest.requireMock('@/lib/services/postService') as {
  createPost: jest.Mock;
  updatePost: jest.Mock;
  deletePost: jest.Mock;
};
const { revalidatePath } = jest.requireMock('next/cache') as {
  revalidatePath: jest.Mock;
};

describe('post server actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  describe('createPostAction', () => {
    const buildFormData = () => {
      const formData = new FormData();
      formData.append('title', '新しい投稿');
      formData.append('lesson', 'これは十分な長さのコンテンツです');
      formData.append('categoryId', 'cat-1');
      formData.append('tags', 'tag1');
      return formData;
    };

    it('returns success state and triggers revalidation on happy path', async () => {
      const formData = buildFormData();
      postService.createPost.mockResolvedValue({
        id: 'post-1',
        category: { slug: 'career' },
      });

      const result = await createPostAction(INITIAL_STATE, formData);

      expect(result).toEqual({
        status: 'success',
        message: 'feedback.postCreated',
        postId: 'post-1',
      });
      expect(postService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ title: '新しい投稿' }),
        'user-1',
      );
      expect(revalidatePath).toHaveBeenNthCalledWith(1, '/dashboard');
      expect(revalidatePath).toHaveBeenNthCalledWith(
        2,
        '/categories/career',
      );
      expect(revalidatePath).toHaveBeenNthCalledWith(3, '/posts/post-1');
    });

    it('returns validation errors when schema parsing fails', async () => {
      const formData = new FormData();
      formData.append('title', 'あ');
      formData.append('lesson', '短い');
      formData.append('categoryId', '');

      const result = await createPostAction(INITIAL_STATE, formData);

      expect(result.status).toBe('error');
      expect(result.errors?.title).toBeTruthy();
      expect(postService.createPost).not.toHaveBeenCalled();
    });

    it('maps domain errors to translated message', async () => {
      const formData = buildFormData();
      postService.createPost.mockRejectedValue(
        new AppError('FORBIDDEN', 'Not allowed', 403),
      );

      const result = await createPostAction(INITIAL_STATE, formData);

      expect(result).toEqual({
        status: 'error',
        message: 'errors.forbidden',
      });
    });

    it('falls back to generic error message on unexpected failure', async () => {
      const formData = buildFormData();
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      postService.createPost.mockRejectedValue(new Error('boom'));

      const result = await createPostAction(INITIAL_STATE, formData);

      expect(result).toEqual({
        status: 'error',
        message: 'feedback.errorGeneric',
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('updatePostAction', () => {
    const buildFormData = () => {
      const formData = new FormData();
      formData.append('id', 'post-1');
      formData.append('title', '更新後タイトル');
      formData.append('lesson', '更新後の十分な教訓テキスト');
      formData.append('categoryId', 'cat-1');
      return formData;
    };

    it('returns success when update service resolves', async () => {
      postService.updatePost.mockResolvedValue({
        id: 'post-1',
        category: { slug: 'career' },
      });

      const result = await updatePostAction(INITIAL_STATE, buildFormData());

      expect(result).toEqual({
        status: 'success',
        message: 'feedback.postUpdated',
        postId: 'post-1',
      });
    });

    it('returns validation errors when id is missing', async () => {
      const formData = buildFormData();
      formData.set('id', '');

      const result = await updatePostAction(INITIAL_STATE, formData);

      expect(result.status).toBe('error');
      expect(result.errors?.id).toBeTruthy();
      expect(postService.updatePost).not.toHaveBeenCalled();
    });

    it('maps domain errors to translation key', async () => {
      postService.updatePost.mockRejectedValue(
        new AppError('CATEGORY_NOT_FOUND', 'Not found', 404),
      );

      const result = await updatePostAction(INITIAL_STATE, buildFormData());

      expect(result).toEqual({
        status: 'error',
        message: 'errors.notFound',
      });
    });
  });

  describe('deletePostAction', () => {
    it('returns success when deletion succeeds', async () => {
      postService.deletePost.mockResolvedValue(undefined);

      const result = await deletePostAction('post-1');

      expect(result).toEqual({
        status: 'success',
        message: 'feedback.postDeleted',
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('maps domain errors for forbidden deletion', async () => {
      postService.deletePost.mockRejectedValue(
        new AppError('FORBIDDEN', 'Own only', 403),
      );

      const result = await deletePostAction('post-1');

      expect(result).toEqual({
        status: 'error',
        message: 'errors.forbidden',
      });
    });

    it('handles unexpected errors gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      postService.deletePost.mockRejectedValue(new Error('boom'));

      const result = await deletePostAction('post-1');

      expect(result).toEqual({
        status: 'error',
        message: 'feedback.errorGeneric',
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
