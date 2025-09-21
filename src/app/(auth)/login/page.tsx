import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getServerAuthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "ログイン | anotoki",
};

export default async function LoginPage() {
  const session = await getServerAuthSession();
  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
