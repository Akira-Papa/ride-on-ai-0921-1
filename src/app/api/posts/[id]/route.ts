import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import {
  deletePost,
  getPostById,
  updatePost,
} from "@/lib/services/postService";
import { AppError } from "@/lib/utils/errors";
import { jsonError, jsonNoContent, jsonOk } from "@/lib/utils/apiResponse";
import { updatePostSchema } from "@/lib/validation/posts";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return jsonError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const post = await getPostById(params.id, session.user.id);
  if (!post) {
    return jsonError({
      status: 404,
      code: "NOT_FOUND",
      message: "Post not found",
    });
  }

  return jsonOk({ post });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return jsonError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  try {
    const payload = await request.json();
    const parsed = updatePostSchema.safeParse({ ...payload, id: params.id });
    if (!parsed.success) {
      return jsonError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }
    const post = await updatePost(parsed.data, session.user.id);
    return jsonOk({ post });
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError({
        status: error.status,
        code: error.code,
        message: error.message,
      });
    }
    if (error instanceof SyntaxError) {
      return jsonError({
        status: 400,
        code: "INVALID_JSON",
        message: "Invalid JSON body",
      });
    }
    console.error(error);
    return jsonError({
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected error",
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return jsonError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  try {
    await deletePost(params.id, session.user.id);
    return jsonNoContent();
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError({
        status: error.status,
        code: error.code,
        message: error.message,
      });
    }
    console.error(error);
    return jsonError({
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected error",
    });
  }
}
