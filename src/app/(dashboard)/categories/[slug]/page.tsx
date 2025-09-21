import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";

import { PostList } from "@/components/posts/PostList";
import { requireServerSession } from "@/lib/auth/session";
import { getCategoryBySlug } from "@/lib/services/categoryService";
import { listPosts } from "@/lib/services/postService";

type CategoryPageProps = {
  params: { slug: string };
  searchParams?: { q?: string; tag?: string };
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return {
      title: "カテゴリが見つかりません | anotoki",
    };
  }
  return {
    title: `${category.name} | anotoki`,
    description: `${category.name} に関する教訓一覧`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const session = await requireServerSession();
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { posts, nextCursor } = await listPosts(
    {
      limit: 10,
      category: category.slug,
      search: searchParams?.q,
      tag: searchParams?.tag,
    },
    session.user.id
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        {category.name}
      </Typography>
      {category.description && (
        <Typography variant="body2" color="text.secondary">
          {category.description}
        </Typography>
      )}
      <PostList
        initialPosts={posts}
        initialCursor={nextCursor}
        query={{
          category: category.slug,
          search: searchParams?.q ?? undefined,
          tag: searchParams?.tag ?? undefined,
        }}
      />
    </Box>
  );
}
