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
  searchParams?: { q?: string; tag?: string };
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await requireServerSession();
  const { posts, nextCursor } = await listPosts(
    {
      limit: 10,
      search: searchParams?.q,
      tag: searchParams?.tag,
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
        query={{ search: searchParams?.q ?? undefined, tag: searchParams?.tag ?? undefined }}
      />
    </Box>
  );
}
