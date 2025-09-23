import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { notFound } from 'next/navigation';

import { PostCard } from '@/components/posts/PostCard';
import type { PostListItem } from '@/lib/types/posts';

const samplePost: PostListItem = {
  id: 'post-card-h-1',
  title: 'リアクションテスト用投稿',
  lessonPreview: 'リアクションとタグナビゲーションの挙動をテストします。',
  tags: ['career', 'learning'],
  visibility: 'member',
  createdAt: new Date('2024-09-03T00:00:00.000Z').toISOString(),
  updatedAt: new Date('2024-09-03T00:00:00.000Z').toISOString(),
  category: {
    id: 'cat-h-1',
    name: 'キャリア',
    slug: 'career',
  },
  author: {
    id: 'author-h-1',
    name: 'Akira',
    image: null,
  },
  reactions: {
    likeCount: 5,
    bookmarkCount: 1,
    viewerHasLiked: false,
    viewerHasBookmarked: true,
  },
};

export default function PostCardHarness() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <Box sx={{ p: 4, maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        PostCard ハーネス
      </Typography>
      <PostCard post={samplePost} />
    </Box>
  );
}
