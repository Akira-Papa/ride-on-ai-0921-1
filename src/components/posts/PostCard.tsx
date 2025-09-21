'use client';

import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Bookmark from '@mui/icons-material/Bookmark';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import AccessTime from '@mui/icons-material/AccessTime';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { useFeedback } from '@/components/feedback/FeedbackProvider';
import type { PostListItem } from '@/lib/types/posts';

async function updateReaction(
  postId: string,
  type: 'like' | 'bookmark',
  enable: boolean,
) {
  const response = await fetch(`/api/posts/${postId}/reactions`, {
    method: enable ? 'POST' : 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error?.message ?? 'Failed to update reaction');
  }
}

type PostCardProps = {
  post: PostListItem;
};

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reactions, setReactions] = useState(post.reactions);
  const feedback = useFeedback();
  const tPosts = useTranslations('posts');

  const handleNavigate = () => {
    router.push(`/posts/${post.id}`);
  };

  const handleToggleReaction = (type: 'like' | 'bookmark') => {
    const previous = reactions;
    const enable =
      type === 'like' ? !previous.viewerHasLiked : !previous.viewerHasBookmarked;
    const optimistic = {
      ...previous,
      likeCount:
        type === 'like'
          ? previous.likeCount + (enable ? 1 : -1)
          : previous.likeCount,
      bookmarkCount:
        type === 'bookmark'
          ? previous.bookmarkCount + (enable ? 1 : -1)
          : previous.bookmarkCount,
      viewerHasLiked: type === 'like' ? enable : previous.viewerHasLiked,
      viewerHasBookmarked:
        type === 'bookmark' ? enable : previous.viewerHasBookmarked,
    };

    setReactions(optimistic);
    startTransition(async () => {
      try {
        await updateReaction(post.id, type, enable);
        feedback.showSuccess(
          type === 'like'
            ? tPosts('reactions.like')
            : tPosts('reactions.bookmark'),
        );
      } catch (error) {
        console.error(error);
        feedback.showError('リアクションの更新に失敗しました');
        setReactions(previous);
      }
    });
  };

  return (
    <Card sx={{ backgroundColor: 'background.paper' }}>
      <CardHeader
        avatar={<Avatar src={post.author.image ?? undefined}>{post.author.name[0]}</Avatar>}
        title={post.title}
        subheader={
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTime fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
            <Chip label={post.category.name} size="small" color="primary" />
          </Stack>
        }
      />
      <CardActionArea onClick={handleNavigate} disabled={isPending}>
        <CardContent>
          <Typography variant="body1" color="text.primary" gutterBottom>
            {post.lessonPreview}...
          </Typography>
          {post.tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {post.tags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} size="small" />
              ))}
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          pr: 2,
          pb: 2,
        }}
      >
        <Tooltip title={tPosts('reactions.like')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              color={reactions.viewerHasLiked ? 'secondary' : 'default'}
              onClick={() => handleToggleReaction('like')}
              disabled={isPending}
              aria-label={tPosts('reactions.like')}
            >
              {reactions.viewerHasLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="caption">{reactions.likeCount}</Typography>
          </Box>
        </Tooltip>
        <Tooltip title={tPosts('reactions.bookmark')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              color={reactions.viewerHasBookmarked ? 'secondary' : 'default'}
              onClick={() => handleToggleReaction('bookmark')}
              disabled={isPending}
              aria-label={tPosts('reactions.bookmark')}
            >
              {reactions.viewerHasBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
            <Typography variant="caption">{reactions.bookmarkCount}</Typography>
          </Box>
        </Tooltip>
      </Box>
    </Card>
  );
}
