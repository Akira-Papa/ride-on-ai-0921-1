import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { PostForm } from "@/components/posts/PostForm";
import { requireServerSession } from "@/lib/auth/session";
import { listCategories } from "@/lib/services/categoryService";

export const metadata: Metadata = {
  title: "新規投稿 | anotoki",
};

export default async function NewPostPage() {
  await requireServerSession();
  const categories = await listCategories();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        あの時の教訓を共有する
      </Typography>
      <PostForm
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        mode="create"
      />
    </Box>
  );
}
