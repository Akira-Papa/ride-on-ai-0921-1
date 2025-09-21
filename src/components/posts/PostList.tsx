'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useEffect, useRef, useState, useCallback } from 'react';

import { EmptyState } from '@/components/posts/EmptyState';
import { PostCard } from '@/components/posts/PostCard';
import { PostSkeleton } from '@/components/posts/PostSkeleton';
import { useFeedback } from '@/components/feedback/FeedbackProvider';
import type { PostListItem } from '@/lib/types/posts';
import { useTranslations } from 'next-intl';

const BATCH_SIZE = 10;

type PostListProps = {
  initialPosts: PostListItem[];
  initialCursor?: string;
  query?: Record<string, string | undefined>;
};

type ApiResponse = {
  posts: PostListItem[];
  nextCursor?: string;
};

export function PostList({ initialPosts, initialCursor, query = {} }: PostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialCursor);
  const [isFetching, setIsFetching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const feedback = useFeedback();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tStatus = useTranslations('statuses');

  const fetchMore = useCallback(async () => {
    if (!nextCursor || isFetching) return;
    setIsFetching(true);
    setHasError(false);
    try {
      const params = new URLSearchParams();
      params.set('cursor', nextCursor);
      params.set('limit', String(BATCH_SIZE));
      Object.entries(query).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch more posts');
      }
      const data = (await response.json()) as ApiResponse;
      setPosts((prev) => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error(error);
      setHasError(true);
      feedback.showError(tStatus('loadError'));
    } finally {
      setIsFetching(false);
    }
  }, [nextCursor, isFetching, query, feedback, tStatus]);

  useEffect(() => {
    setPosts(initialPosts);
    setNextCursor(initialCursor);
  }, [initialPosts, initialCursor]);

  useEffect(() => {
    if (!sentinelRef.current || !nextCursor) {
      return;
    }
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fetchMore();
        }
      });
    });
    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [fetchMore, nextCursor]);

  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {nextCursor && <Box ref={sentinelRef} sx={{ height: 1 }} />}
      {isFetching &&
        Array.from({ length: 2 }).map((_, index) => <PostSkeleton key={index} />)}
      {hasError && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Button onClick={fetchMore} variant="outlined">
            {tStatus('retry')}
          </Button>
        </Box>
      )}
      {!nextCursor && !isFetching && (
        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
          {tStatus('allLoaded')}
        </Box>
      )}
    </Stack>
  );
}
