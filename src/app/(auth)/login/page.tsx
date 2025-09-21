import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { authOptions } from "@/lib/auth/options";

export const metadata: Metadata = {
  title: "ログイン | anotoki",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
