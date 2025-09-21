'use client';

import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Bookmark from '@mui/icons-material/Bookmark';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import AccessTime from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { deletePostAction } from '@/app/(dashboard)/posts/actions';
import { useFeedback } from '@/components/feedback/FeedbackProvider';
import type { PostDetail } from '@/lib/types/posts';

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
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? 'Failed to update reaction');
  }
}

type PostDetailClientProps = {
  post: PostDetail;
  sanitizedLesson: string;
  isOwner: boolean;
};

export function PostDetailClient({ post, sanitizedLesson, isOwner }: PostDetailClientProps) {
  const [reactions, setReactions] = useState(post.reactions);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const feedback = useFeedback();
  const tPosts = useTranslations('posts');
  const tFeedback = useTranslations('feedback');

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
      } catch (error) {
        console.error(error);
        feedback.showError(tFeedback('errorGeneric'));
        setReactions(previous);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePostAction(post.id);
      if (result.status === 'success') {
        feedback.showSuccess(tFeedback('postDeleted'));
        router.push('/dashboard');
        return;
      }
      feedback.showError(result.message ?? tFeedback('errorGeneric'));
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src={post.author.image ?? undefined}>{post.author.name[0]}</Avatar>
        <Box>
          <Typography variant="h4" gutterBottom>
            {post.title}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTime fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {new Date(post.createdAt).toLocaleString()}
              </Typography>
            </Stack>
            <Chip label={post.category.name} />
            {post.visibility === 'private' && (
              <Chip label={tPosts('visibilityPrivate')} color="secondary" />
            )}
          </Stack>
        </Box>
      </Stack>
      {post.tags.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {post.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} variant="outlined" />
          ))}
        </Stack>
      )}
      {post.situationalContext && (
        <Box sx={{ backgroundColor: 'rgba(90,62,133,0.15)', borderRadius: 3, p: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {tPosts('contextLabel')}
          </Typography>
          <Typography variant="body2">{post.situationalContext}</Typography>
        </Box>
      )}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          p: { xs: 2, md: 4 },
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: sanitizedLesson }} />
      </Box>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color={reactions.viewerHasLiked ? 'secondary' : 'default'}
            onClick={() => handleToggleReaction('like')}
            disabled={isPending}
            aria-label={tPosts('reactions.like')}
          >
            {reactions.viewerHasLiked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Typography variant="body2">{reactions.likeCount}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color={reactions.viewerHasBookmarked ? 'secondary' : 'default'}
            onClick={() => handleToggleReaction('bookmark')}
            disabled={isPending}
            aria-label={tPosts('reactions.bookmark')}
          >
            {reactions.viewerHasBookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
          <Typography variant="body2">{reactions.bookmarkCount}</Typography>
        </Box>
        {isOwner && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => router.push(`/posts/${post.id}/edit`)}
            >
              {tPosts('edit')}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
              disabled={isPending}
            >
              {tPosts('delete')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
