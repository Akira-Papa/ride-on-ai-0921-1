import { NextRequest } from "next/server";
import { addReaction, removeReaction } from "@/lib/services/postService";
import { AppError } from "@/lib/utils/errors";
import { jsonCreated, jsonError, jsonNoContent } from "@/lib/utils/apiResponse";
import { reactionSchema } from "@/lib/validation/posts";
import { getServerAuthSession } from "@/lib/auth/session";
import type { AuthSession } from "@/lib/auth/session";

async function withAuth(): Promise<AuthSession> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    throw new AppError("UNAUTHORIZED", "Authentication required", 401);
  }
  return session;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await withAuth();
    const { id } = await params;
    const type = request.nextUrl.searchParams.get("type");
    const parsed = reactionSchema.safeParse({ postId: id, type });
    if (!parsed.success) {
      return jsonError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }
    await addReaction(parsed.data, session.user.id);
    return jsonCreated({ reaction: parsed.data });
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await withAuth();
    const { id } = await params;
    const type = request.nextUrl.searchParams.get("type");
    const parsed = reactionSchema.safeParse({ postId: id, type });
    if (!parsed.success) {
      return jsonError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }
    await removeReaction(parsed.data, session.user.id);
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
