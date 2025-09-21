import { z } from "zod";

enum VisibilityEnum {
  MEMBER = "member",
  PRIVATE = "private",
}

export const visibilitySchema = z.nativeEnum(VisibilityEnum);

const tagSchema = z
  .string()
  .min(1, "tag.min")
  .max(30, "tag.max")
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, "tag.min");

const basePostSchema = z.object({
  title: z
    .string()
    .min(3, "title.min")
    .max(120, "title.max")
    .transform((value) => value.trim()),
  lesson: z
    .string()
    .min(10, "lesson.min")
    .max(2000, "lesson.max")
    .transform((value) => value.trim()),
  situationalContext: z
    .string()
    .max(1000, "context.max")
    .transform((value) => value.trim())
    .optional()
    .or(z.literal("").transform(() => undefined)),
  categoryId: z.string().min(1, "category.required"),
  tags: z.array(tagSchema).max(5, "tags.max").default([]),
  visibility: visibilitySchema.default(VisibilityEnum.MEMBER),
});

export const createPostSchema = basePostSchema;
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = basePostSchema.extend({
  id: z.string().min(1, "id.required"),
});
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const postsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => Number.isInteger(value) && value > 0 && value <= 50, {
      message: "limit.range",
    })
    .optional(),
});
export type PostsQueryInput = z.infer<typeof postsQuerySchema>;

export const reactionSchema = z.object({
  postId: z.string().min(1, "post.required"),
  type: z.enum(["like", "bookmark"], {
    errorMap: () => ({ message: "reaction.invalid" }),
  }),
});
export type ReactionInput = z.infer<typeof reactionSchema>;
