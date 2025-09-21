'use client';

import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { createEmotionCache } from '@/theme/createEmotionCache';

type EmotionCacheProviderProps = {
  children: ReactNode;
};

type EmotionCacheState = {
  cache: ReturnType<typeof createEmotionCache>;
  flush: () => string[];
};

export function EmotionCacheProvider({ children }: EmotionCacheProviderProps) {
  const [{ cache, flush }] = useState<EmotionCacheState>(() => {
    const emotionCache = createEmotionCache();
    emotionCache.compat = true;

    const prevInsert = emotionCache.insert;
    let inserted: string[] = [];

    emotionCache.insert = (
      ...args: Parameters<typeof emotionCache.insert>
    ): ReturnType<typeof emotionCache.insert> => {
      const [, serialized] = args;
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };

    return { cache: emotionCache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();

    if (names.length === 0) {
      return null;
    }

    const styles = names
      .map((name) => {
        const style = cache.inserted[name];
        return typeof style === 'string' ? style : '';
      })
      .join('');

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        key={cache.key}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
