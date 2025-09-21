import { AppError, isAppError } from "@/lib/utils/errors";
import { jsonError } from "@/lib/utils/apiResponse";

export function handleRouteError(error: unknown) {
  if (isAppError(error)) {
    return jsonError({
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof Error) {
    return jsonError({
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }

  return jsonError({
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Unexpected error",
  });
}

export function ensure(condition: unknown, error: AppError): asserts condition {
  if (!condition) {
    throw error;
  }
}
