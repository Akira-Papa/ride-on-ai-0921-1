"use server";

import { revalidatePath } from "next/cache";

import { requireServerSession } from "@/lib/auth/session";
import { createPost, deletePost, updatePost } from "@/lib/services/postService";
import { AppError } from "@/lib/utils/errors";
import { mapZodErrors, extractPostForm, mapAppErrorToMessage } from "./action-helpers";
import type { ActionState } from "./action-helpers";
import {
  createPostSchema,
  updatePostSchema,
} from "@/lib/validation/posts";

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
        message: mapAppErrorToMessage(error),
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
        message: mapAppErrorToMessage(error),
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
        message: mapAppErrorToMessage(error),
      };
    }
    console.error(error);
    return {
      status: "error",
      message: "feedback.errorGeneric",
    };
  }
}
