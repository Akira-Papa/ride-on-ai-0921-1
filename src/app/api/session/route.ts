import { getServerAuthSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/utils/apiResponse";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return jsonError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return jsonOk({ user: session.user });
}
