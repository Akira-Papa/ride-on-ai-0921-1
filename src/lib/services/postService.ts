import { Types } from "mongoose";

import { connectMongo } from "@/lib/db/mongoose";
import { CategoryModel } from "@/lib/models/Category";
import { PostModel, type PostDocument } from "@/lib/models/Post";
import { PostReactionModel } from "@/lib/models/PostReaction";
import { UserModel } from "@/lib/models/User";
import { AppError } from "@/lib/utils/errors";
import type {
  PostDetail,
  PostListItem,
  ReactionSummary,
} from "@/lib/types/posts";
import {
  type CreatePostInput,
  type PostsQueryInput,
  type ReactionInput,
  type UpdatePostInput,
} from "@/lib/validation/posts";

const DEFAULT_LIMIT = 10;

const emptyReactionSummary: ReactionSummary = {
  likeCount: 0,
  bookmarkCount: 0,
  viewerHasLiked: false,
  viewerHasBookmarked: false,
};

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid object id");
  }
  return new Types.ObjectId(id);
}

function toListItem(
  post: PostDocument,
  reactionSummary: ReactionSummary
): PostListItem {
  const category = post.categoryId as unknown as {
    _id: Types.ObjectId;
    name: string;
    slug: string;
  };
  const author = post.authorId as unknown as {
    _id: Types.ObjectId;
    name: string;
    image?: string | null;
  };

  return {
    id: post._id.toString(),
    title: post.title,
    lessonPreview: post.lesson.slice(0, 180),
    tags: post.tags ?? [],
    visibility: post.visibility as "member" | "private",
    createdAt: post.createdAt?.toISOString() ?? "",
    updatedAt: post.updatedAt?.toISOString() ?? "",
    category: {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
    },
    author: {
      id: author._id.toString(),
      name: author.name,
      image: author.image ?? null,
    },
    reactions: reactionSummary,
  };
}

async function summarizeReactions(
  postIds: Types.ObjectId[],
  userId: string
) {
  const viewerObjectId = toObjectId(userId);
  const [counts, viewer] = await Promise.all([
    PostReactionModel.aggregate([
      { $match: { postId: { $in: postIds } } },
      {
        $group: {
          _id: { postId: "$postId", type: "$type" },
          count: { $sum: 1 },
        },
      },
    ]),
    PostReactionModel.find({
      postId: { $in: postIds },
      userId: viewerObjectId,
    }).lean(),
  ]);

  const summary = new Map<string, ReactionSummary>();

  postIds.forEach((id) => {
    summary.set(id.toString(), { ...emptyReactionSummary });
  });

  counts.forEach((doc) => {
    const postId = doc._id.postId.toString();
    const existing = summary.get(postId);
    if (!existing) return;
    if (doc._id.type === "like") {
      existing.likeCount = doc.count;
    }
    if (doc._id.type === "bookmark") {
      existing.bookmarkCount = doc.count;
    }
  });

  viewer.forEach((reaction) => {
    const postId = reaction.postId.toString();
    const existing = summary.get(postId);
    if (!existing) return;
    if (reaction.type === "like") {
      existing.viewerHasLiked = true;
    }
    if (reaction.type === "bookmark") {
      existing.viewerHasBookmarked = true;
    }
  });

  return summary;
}

export async function createPost(
  input: CreatePostInput,
  userId: string
): Promise<PostDetail> {
  await connectMongo();
  const author = await UserModel.findById(userId).exec();
  if (!author) {
    throw new AppError("AUTHOR_NOT_FOUND", "Author not found", 404);
  }

  const category = await CategoryModel.findById(input.categoryId).exec();
  if (!category) {
    throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
  }

  const post = await PostModel.create({
    ...input,
    authorId: author._id,
    tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
  });

  await post.populate([
    { path: "authorId", select: "name image" },
    { path: "categoryId", select: "name slug" },
  ]);

  return {
    ...toListItem(post, { ...emptyReactionSummary }),
    lesson: post.lesson,
    situationalContext: post.situationalContext ?? undefined,
  };
}

export async function listPosts(
  query: PostsQueryInput,
  userId: string
): Promise<{ posts: PostListItem[]; nextCursor?: string }> {
  await connectMongo();

  const limit = query.limit ?? DEFAULT_LIMIT;
  const viewerObjectId = toObjectId(userId);
  const filter: Record<string, unknown> = {
    $or: [{ visibility: "member" }, { authorId: viewerObjectId }],
  };

  if (query.category) {
    const category = await CategoryModel.findOne({ slug: query.category }).exec();
    if (!category) {
      return { posts: [], nextCursor: undefined };
    }
    filter.categoryId = category._id;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.cursor) {
    filter._id = { $lt: toObjectId(query.cursor) };
  }

  const posts = await PostModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate("authorId", "name image")
    .populate("categoryId", "name slug")
    .exec();

  const hasNext = posts.length > limit;
  const sliced = hasNext ? posts.slice(0, limit) : posts;
  const postIds = sliced.map((post) => post._id);
  const reactionSummary = await summarizeReactions(postIds, userId);

  return {
    posts: sliced.map((post) =>
      toListItem(
        post,
        reactionSummary.get(post._id.toString()) ?? { ...emptyReactionSummary }
      )
    ),
    nextCursor: hasNext ? posts[limit]._id.toString() : undefined,
  };
}

export async function getPostById(
  id: string,
  userId: string
): Promise<PostDetail | null> {
  await connectMongo();
  const post = await PostModel.findById(id)
    .populate("authorId", "name image")
    .populate("categoryId", "name slug")
    .exec();

  if (!post) {
    return null;
  }

  const author = post.authorId as unknown as { _id: Types.ObjectId };

  if (post.visibility === "private" && author._id.toString() !== userId) {
    return null;
  }

  const reactionSummary = await summarizeReactions([post._id], userId);
  const summary = reactionSummary.get(post._id.toString()) ?? {
    ...emptyReactionSummary,
  };

  return {
    ...toListItem(post, summary),
    lesson: post.lesson,
    situationalContext: post.situationalContext ?? undefined,
  };
}

export async function updatePost(
  input: UpdatePostInput,
  userId: string
): Promise<PostDetail> {
  await connectMongo();
  const post = await PostModel.findById(input.id)
    .populate("authorId", "name image")
    .populate("categoryId", "name slug")
    .exec();

  if (!post) {
    throw new AppError("POST_NOT_FOUND", "Post not found", 404);
  }

  const author = post.authorId as unknown as { _id: Types.ObjectId };

  if (author._id.toString() !== userId) {
    throw new AppError("FORBIDDEN", "You do not own this post", 403);
  }

  const category = await CategoryModel.findById(input.categoryId).exec();
  if (!category) {
    throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
  }

  post.title = input.title;
  post.lesson = input.lesson;
  post.situationalContext = input.situationalContext ?? undefined;
  post.categoryId = category._id;
  post.tags = input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [];
  post.visibility = input.visibility;

  await post.save();
  await post.populate([
    { path: "authorId", select: "name image" },
    { path: "categoryId", select: "name slug" },
  ]);

  const reactionSummary = await summarizeReactions([post._id], userId);
  const summary = reactionSummary.get(post._id.toString()) ?? {
    ...emptyReactionSummary,
  };

  return {
    ...toListItem(post, summary),
    lesson: post.lesson,
    situationalContext: post.situationalContext ?? undefined,
  };
}

export async function deletePost(id: string, userId: string): Promise<void> {
  await connectMongo();
  const post = await PostModel.findById(id).exec();
  if (!post) {
    throw new AppError("POST_NOT_FOUND", "Post not found", 404);
  }
  if (post.authorId.toString() !== userId) {
    throw new AppError("FORBIDDEN", "You do not own this post", 403);
  }

  await Promise.all([
    PostModel.deleteOne({ _id: post._id }),
    PostReactionModel.deleteMany({ postId: post._id }),
  ]);
}

export async function addReaction(
  input: ReactionInput,
  userId: string
): Promise<void> {
  await connectMongo();
  const postObjectId = toObjectId(input.postId);
  const userObjectId = toObjectId(userId);
  await PostReactionModel.updateOne(
    {
      postId: postObjectId,
      userId: userObjectId,
      type: input.type,
    },
    {
      $setOnInsert: {
        postId: postObjectId,
        userId: userObjectId,
        type: input.type,
      },
    },
    { upsert: true }
  );
}

export async function removeReaction(
  input: ReactionInput,
  userId: string
): Promise<void> {
  await connectMongo();
  const postObjectId = toObjectId(input.postId);
  const userObjectId = toObjectId(userId);
  await PostReactionModel.deleteOne({
    postId: postObjectId,
    userId: userObjectId,
    type: input.type,
  });
}
