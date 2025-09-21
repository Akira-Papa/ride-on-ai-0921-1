import Box from "@mui/material/Box";
import { notFound } from "next/navigation";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

import { PostDetailClient } from "@/components/posts/PostDetailClient";
import { requireServerSession } from "@/lib/auth/session";
import { getPostById } from "@/lib/services/postService";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const session = await requireServerSession();
  const { id } = await params;
  const post = await getPostById(id, session.user.id);

  if (!post) {
    notFound();
  }

  const parsedLesson = await marked.parse(post.lesson);
  const html = sanitizeHtml(parsedLesson, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });

  return (
    <Box>
      <PostDetailClient
        post={post}
        sanitizedLesson={html}
        isOwner={post.author.id === session.user.id}
      />
    </Box>
  );
}
