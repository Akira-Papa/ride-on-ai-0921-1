"use server";

import { revalidatePath } from "next/cache";

import { requireServerSession } from "@/lib/auth/session";
import { createPost, deletePost, updatePost } from "@/lib/services/postService";
import { AppError } from "@/lib/utils/errors";
import {
  createPostSchema,
  updatePostSchema,
} from "@/lib/validation/posts";

import type { ZodError } from "zod";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  postId?: string;
};

export const INITIAL_STATE: ActionState = { status: "idle" };

function mapZodErrors(error: ZodError): Record<string, string> {
  const flatten = error.flatten();
  const mapped: Record<string, string> = {};
  Object.entries(flatten.fieldErrors).forEach(([key, messages]) => {
    if (messages && messages.length > 0) {
      mapped[key] = messages[0];
    }
  });
  if (flatten.formErrors.length > 0) {
    mapped._form = flatten.formErrors[0];
  }
  return mapped;
}

function extractPostForm(formData: FormData) {
  return {
    title: formData.get("title")?.toString() ?? "",
    lesson: formData.get("lesson")?.toString() ?? "",
    situationalContext: formData.get("situationalContext")?.toString() ?? "",
    categoryId: formData.get("categoryId")?.toString() ?? "",
    tags: formData.getAll("tags").map((tag) => tag.toString()),
    visibility: formData.get("visibility")?.toString() ?? "member",
  };
}

export async function createPostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireServerSession();
    const parsed = createPostSchema.safeParse(extractPostForm(formData));

    if (!parsed.success) {
      return { status: "error", errors: mapZodErrors(parsed.error) };
    }

    const post = await createPost(parsed.data, session.user.id);
    revalidatePath("/dashboard");
    revalidatePath(`/categories/${post.category.slug}`);
    revalidatePath(`/posts/${post.id}`);

    return {
      status: "success",
      message: "feedback.postCreated",
      postId: post.id,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        status: "error",
        message: error.code,
      };
    }
    console.error(error);
    return {
      status: "error",
      message: "feedback.errorGeneric",
    };
  }
}

export async function updatePostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireServerSession();
    const parsed = updatePostSchema.safeParse({
      ...extractPostForm(formData),
      id: formData.get("id")?.toString() ?? "",
    });

    if (!parsed.success) {
      return { status: "error", errors: mapZodErrors(parsed.error) };
    }

    const post = await updatePost(parsed.data, session.user.id);
    revalidatePath("/dashboard");
    revalidatePath(`/categories/${post.category.slug}`);
    revalidatePath(`/posts/${post.id}`);

    return {
      status: "success",
      message: "feedback.postUpdated",
      postId: post.id,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        status: "error",
        message: error.code,
      };
    }
    console.error(error);
    return {
      status: "error",
      message: "feedback.errorGeneric",
    };
  }
}

export async function deletePostAction(postId: string): Promise<ActionState> {
  try {
    const session = await requireServerSession();
    await deletePost(postId, session.user.id);
    revalidatePath("/dashboard");
    return { status: "success", message: "feedback.postDeleted" };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        status: "error",
        message: error.code,
      };
    }
    console.error(error);
    return {
      status: "error",
      message: "feedback.errorGeneric",
    };
  }
}
