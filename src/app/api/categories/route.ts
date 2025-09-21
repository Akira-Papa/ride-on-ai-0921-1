import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { listCategories } from "@/lib/services/categoryService";
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

  const categories = await listCategories();
  return jsonOk({ categories });
}
