import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { notFound, redirect } from "next/navigation";

import { PostForm } from "@/components/posts/PostForm";
import { requireServerSession } from "@/lib/auth/session";
import { listCategories } from "@/lib/services/categoryService";
import { getPostById } from "@/lib/services/postService";

export const metadata: Metadata = {
  title: "投稿を編集 | anotoki",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireServerSession();
  const { id } = await params;
  const post = await getPostById(id, session.user.id);

  if (!post) {
    notFound();
  }

  if (post.author.id !== session.user.id) {
    redirect(`/posts/${post.id}`);
  }

  const categories = await listCategories();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        {post.title} を編集
      </Typography>
      <PostForm
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        mode="edit"
        defaultValue={post}
      />
    </Box>
  );
}
