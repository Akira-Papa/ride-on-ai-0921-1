import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { requireServerSession } from "@/lib/auth/session";
import { listCategories } from "@/lib/services/categoryService";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireServerSession();
  const categories = await listCategories();

  return (
    <AppShell user={session.user} categories={categories}>
      {children}
    </AppShell>
  );
}
