import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import {
  createPost,
  listPosts,
} from "@/lib/services/postService";
import { AppError } from "@/lib/utils/errors";
import { jsonCreated, jsonError, jsonOk } from "@/lib/utils/apiResponse";
import { createPostSchema, postsQuerySchema } from "@/lib/validation/posts";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return jsonError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = postsQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return jsonError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: parsed.error.issues[0]?.message ?? "Invalid query",
    });
  }

  const result = await listPosts(parsed.data, session.user.id);
  return jsonOk(result);
}

export async function POST(request: NextRequest) {
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
    const parsed = createPostSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const post = await createPost(parsed.data, session.user.id);
    return jsonCreated({ post });
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
