import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";

export type AuthSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
} & Record<string, unknown>;

export async function getServerAuthSession(): Promise<AuthSession | null> {
  const session = (await getServerSession(authOptions)) as AuthSession | null;
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

export async function requireServerSession(): Promise<AuthSession> {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
