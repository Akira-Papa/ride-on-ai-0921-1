import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { notFound } from 'next/navigation';

import { PostList } from '@/components/posts/PostList';
import type { PostListItem } from '@/lib/types/posts';

const staticPosts: PostListItem[] = [
  {
    id: 'post-h-1',
    title: 'ハーネス用投稿 1',
    lessonPreview: '初期データとして表示される投稿です。',
    tags: ['career'],
    visibility: 'member',
    createdAt: new Date('2024-09-01T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-09-01T00:00:00.000Z').toISOString(),
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
      likeCount: 2,
      bookmarkCount: 1,
      viewerHasLiked: false,
      viewerHasBookmarked: false,
    },
  },
  {
    id: 'post-h-2',
    title: 'ハーネス用投稿 2',
    lessonPreview: '無限スクロールのテストに利用する投稿です。',
    tags: ['learning'],
    visibility: 'member',
    createdAt: new Date('2024-09-02T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-09-02T00:00:00.000Z').toISOString(),
    category: {
      id: 'cat-h-2',
      name: '学び',
      slug: 'learning',
    },
    author: {
      id: 'author-h-2',
      name: 'Miki',
      image: null,
    },
    reactions: {
      likeCount: 0,
      bookmarkCount: 0,
      viewerHasLiked: false,
      viewerHasBookmarked: false,
    },
  },
];

export default function PostListHarness() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" component="h1">
        PostList ハーネス
      </Typography>
      <PostList
        initialPosts={staticPosts}
        initialCursor="cursor-1"
        query={{}}
      />
    </Box>
  );
}
