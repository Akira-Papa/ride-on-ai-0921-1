import type { Metadata } from "next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { PostList } from "@/components/posts/PostList";
import { requireServerSession } from "@/lib/auth/session";
import { listPosts } from "@/lib/services/postService";

export const metadata: Metadata = {
  title: "ダッシュボード | anotoki",
  description: "メンバーの最新の教訓を閲覧する",
};

type DashboardPageProps = {
  searchParams?: Promise<{ q?: string; tag?: string }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const session = await requireServerSession();
  const { posts, nextCursor } = await listPosts(
    {
      limit: 10,
      search: resolvedSearchParams?.q,
      tag: resolvedSearchParams?.tag,
    },
    session.user.id
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        最新の教訓
      </Typography>
      <PostList
        initialPosts={posts}
        initialCursor={nextCursor}
        query={{ search: resolvedSearchParams?.q ?? undefined, tag: resolvedSearchParams?.tag ?? undefined }}
      />
    </Box>
  );
}
