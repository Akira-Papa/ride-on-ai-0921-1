import { Types } from 'mongoose';

import {
  addReaction,
  createPost,
  deletePost,
  getPostById,
  listPosts,
  removeReaction,
  updatePost,
} from '@/lib/services/postService';

jest.mock('@/lib/db/mongoose', () => ({
  connectMongo: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/models/User', () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock('@/lib/models/Category', () => ({
  CategoryModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock('@/lib/models/Post', () => ({
  PostModel: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.mock('@/lib/models/PostReaction', () => ({
  PostReactionModel: {
    aggregate: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

const userModel = jest.requireMock('@/lib/models/User')
  .UserModel as unknown as {
  findById: jest.Mock;
};

const categoryModel = jest.requireMock('@/lib/models/Category')
  .CategoryModel as unknown as {
  find: jest.Mock;
  findById: jest.Mock;
  findOne: jest.Mock;
  updateOne: jest.Mock;
};

const postModel = jest.requireMock('@/lib/models/Post')
  .PostModel as unknown as {
  create: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
  deleteOne: jest.Mock;
};

const postReactionModel = jest.requireMock('@/lib/models/PostReaction')
  .PostReactionModel as unknown as {
  aggregate: jest.Mock;
  find: jest.Mock;
  updateOne: jest.Mock;
  deleteOne: jest.Mock;
  deleteMany: jest.Mock;
};

describe('postService', () => {
  const userId = new Types.ObjectId();
  const categoryId = new Types.ObjectId();
  const postId = new Types.ObjectId();

  const authorDoc = { _id: userId, name: 'Author', image: 'avatar.png' };
  const categoryDoc = { _id: categoryId, name: 'キャリア', slug: 'career' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockExec<T>(value: T) {
    return { exec: jest.fn().mockResolvedValue(value) };
  }

  describe('createPost', () => {
    it('creates a post and returns a detail payload', async () => {
      userModel.findById.mockReturnValue(mockExec(authorDoc));
      categoryModel.findById.mockReturnValue(mockExec(categoryDoc));

      const createdDoc = {
        _id: postId,
        title: 'タイトル',
        lesson: 'これは十分な長さの教訓テキストです',
        situationalContext: undefined,
        tags: ['tag1', 'tag2'],
        visibility: 'member',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T01:00:00Z'),
        categoryId: categoryDoc,
        authorId: authorDoc,
        populate: jest.fn().mockResolvedValue(undefined),
      };
      postModel.create.mockResolvedValue(createdDoc);

      const result = await createPost(
        {
          title: 'タイトル',
          lesson: 'これは十分な長さの教訓テキストです',
          situationalContext: undefined,
          categoryId: categoryDoc._id.toString(),
          tags: ['tag1', 'tag2', ''],
          visibility: 'member',
        },
        userId.toString(),
      );

      expect(result).toMatchObject({
        id: postId.toString(),
        title: 'タイトル',
        category: { slug: 'career' },
        author: { name: 'Author' },
        reactions: {
          likeCount: 0,
          viewerHasLiked: false,
        },
      });
      expect(postModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['tag1', 'tag2'] }),
      );
      expect(createdDoc.populate).toHaveBeenCalled();
    });

    it('throws AppError when author does not exist', async () => {
      userModel.findById.mockReturnValue(mockExec(null));

      await expect(
        createPost(
          {
            title: 'タイトル',
            lesson: 'これは十分な長さの教訓テキストです',
            categoryId: categoryId.toString(),
            tags: [],
            visibility: 'member',
          },
          userId.toString(),
        ),
      ).rejects.toMatchObject({ code: 'AUTHOR_NOT_FOUND' });
    });

    it('throws AppError when category is missing', async () => {
      userModel.findById.mockReturnValue(mockExec(authorDoc));
      categoryModel.findById.mockReturnValue(mockExec(null));

      await expect(
        createPost(
          {
            title: 'タイトル',
            lesson: 'これは十分な長さの教訓テキストです',
            categoryId: categoryId.toString(),
            tags: [],
            visibility: 'member',
          },
          userId.toString(),
        ),
      ).rejects.toMatchObject({ code: 'CATEGORY_NOT_FOUND' });
    });
  });

  describe('listPosts', () => {
    function setupListMocks(docs: Array<Record<string, unknown>>) {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(docs),
      };
      postModel.find.mockReturnValue(chain);
      return chain;
    }

    it('returns posts with mapped reaction summary', async () => {
      categoryModel.findOne.mockReturnValue(mockExec(categoryDoc));
      const reactionCounts = [
        {
          _id: { postId, type: 'like' },
          count: 3,
        },
        {
          _id: { postId, type: 'bookmark' },
          count: 2,
        },
      ];
      postReactionModel.aggregate.mockResolvedValue(reactionCounts);
      postReactionModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { postId, type: 'like' },
        ]),
      });

      const postDoc = {
        _id: postId,
        title: 'タイトル',
        lesson: '本文',
        tags: ['tag1'],
        visibility: 'member',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        categoryId: categoryDoc,
        authorId: authorDoc,
      };
      const chain = setupListMocks([postDoc]);

      const result = await listPosts(
        { limit: 5, category: 'career' },
        userId.toString(),
      );

      expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'career' });
      expect(chain.limit).toHaveBeenCalledWith(6);
      expect(result.posts[0]).toMatchObject({
        id: postId.toString(),
        reactions: {
          likeCount: 3,
          bookmarkCount: 2,
          viewerHasLiked: true,
          viewerHasBookmarked: false,
        },
      });
      expect(result.nextCursor).toBeUndefined();
    });

    it('returns empty result when category slug is unknown', async () => {
      categoryModel.findOne.mockReturnValue(mockExec(null));
      const result = await listPosts(
        { category: 'unknown' },
        userId.toString(),
      );
      expect(result).toEqual({ posts: [], nextCursor: undefined });
      expect(postModel.find).not.toHaveBeenCalled();
    });
  });

  describe('getPostById', () => {
    it('returns detail payload when viewer is allowed', async () => {
      postReactionModel.aggregate.mockResolvedValue([
        { _id: { postId, type: 'like' }, count: 1 },
      ]);
      postReactionModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ postId, type: 'bookmark' }]),
      });
      const doc = {
        _id: postId,
        title: 'タイトル',
        lesson: '本文',
        tags: [],
        visibility: 'member',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryId: categoryDoc,
        authorId: authorDoc,
      };
      postModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await getPostById(postId.toString(), userId.toString());
      expect(result).not.toBeNull();
      expect(result?.reactions.likeCount).toBe(1);
      expect(result?.reactions.viewerHasBookmarked).toBe(true);
    });

    it('returns null when post is private and viewer is not owner', async () => {
      const privateDoc = {
        _id: postId,
        title: 'タイトル',
        lesson: '本文',
        tags: [],
        visibility: 'private',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryId: categoryDoc,
        authorId: { _id: new Types.ObjectId(), name: 'Other' },
      } as const;

      postModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(privateDoc),
      });

      const result = await getPostById(postId.toString(), userId.toString());
      expect(result).toBeNull();
    });
  });

  describe('updatePost', () => {
    it('updates post fields and returns latest snapshot for owner', async () => {
      const postDoc = {
        _id: postId,
        title: '旧タイトル',
        lesson: '旧レッスン',
        situationalContext: undefined,
        tags: ['old'],
        visibility: 'member',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        categoryId: categoryDoc,
        authorId: authorDoc,
        save: jest.fn().mockResolvedValue(undefined),
        populate: jest.fn().mockImplementation(async () => {
          postDoc.categoryId = categoryDoc;
          postDoc.authorId = authorDoc;
          return postDoc;
        }),
      };
      postModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(postDoc),
      });
      categoryModel.findById.mockReturnValue(mockExec(categoryDoc));
      postReactionModel.aggregate.mockResolvedValue([]);
      postReactionModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await updatePost(
        {
          id: postId.toString(),
          title: '新タイトル',
          lesson: '新しい教訓',
          situationalContext: '文脈',
          categoryId: categoryId.toString(),
          tags: ['tag1', ''],
          visibility: 'private',
        },
        userId.toString(),
      );

      expect(postDoc.save).toHaveBeenCalled();
      expect(result).toMatchObject({
        title: '新タイトル',
        lesson: '新しい教訓',
        situationalContext: '文脈',
        visibility: 'private',
      });
      expect(postDoc.tags).toEqual(['tag1']);
    });

    it('throws when viewer does not own the post', async () => {
      const postDoc = {
        _id: postId,
        title: 'タイトル',
        lesson: '本文',
        tags: [],
        visibility: 'member',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryId: categoryDoc,
        authorId: { _id: new Types.ObjectId(), name: 'Other' },
        populate: jest.fn().mockResolvedValue(undefined),
        save: jest.fn(),
      };

      postModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(postDoc),
      });

      await expect(
        updatePost(
          {
            id: postId.toString(),
            title: '新タイトル',
            lesson: '新しい教訓',
            categoryId: categoryId.toString(),
            tags: [],
            visibility: 'member',
          },
          userId.toString(),
        ),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  describe('deletePost', () => {
    it('deletes post and related reactions when owner matches', async () => {
      const ownedPost = {
        _id: postId,
        authorId: userId,
      };
      postModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(ownedPost),
      });
      postReactionModel.deleteMany.mockResolvedValue(undefined);

      await deletePost(postId.toString(), userId.toString());

      expect(postModel.deleteOne).toHaveBeenCalledWith({ _id: postId });
      expect(postReactionModel.deleteMany).toHaveBeenCalledWith({ postId });
    });

    it('throws when post does not exist', async () => {
      postModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(deletePost(postId.toString(), userId.toString())).rejects.toMatchObject({
        code: 'POST_NOT_FOUND',
      });
    });
  });

  describe('reactions', () => {
    it('adds reaction with upsert', async () => {
      postReactionModel.updateOne.mockResolvedValue(undefined);
      await addReaction(
        { postId: postId.toString(), type: 'like' },
        userId.toString(),
      );

      const callArgs = postReactionModel.updateOne.mock.calls[0][0];
      expect(callArgs.postId.toString()).toEqual(postId.toString());
      expect(callArgs.userId.toString()).toEqual(userId.toString());
      expect(callArgs.type).toEqual('like');
      expect(postReactionModel.updateOne.mock.calls[0][2]).toMatchObject({
        upsert: true,
      });
    });

    it('removes reaction for given composite key', async () => {
      postReactionModel.deleteOne.mockResolvedValue(undefined);
      await removeReaction(
        { postId: postId.toString(), type: 'bookmark' },
        userId.toString(),
      );

      const deleteCallArgs = postReactionModel.deleteOne.mock.calls[0][0];
      expect(deleteCallArgs.postId.toString()).toEqual(postId.toString());
      expect(deleteCallArgs.userId.toString()).toEqual(userId.toString());
      expect(deleteCallArgs.type).toEqual('bookmark');
    });
  });
});
