import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { jsonError, jsonOk } from "@/lib/utils/apiResponse";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return jsonError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return jsonOk({ user: session.user });
}
