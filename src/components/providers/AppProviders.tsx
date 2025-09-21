'use client';

import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { useState } from 'react';

import { FeedbackProvider } from '@/components/feedback/FeedbackProvider';
import type { Messages } from '@/lib/i18n/config';
import { createEmotionCache } from '@/theme/createEmotionCache';
import { theme } from '@/theme';

import type { ReactNode } from 'react';
import type { Session } from 'next-auth';

const clientEmotionCache = createEmotionCache();

type Props = {
  children: ReactNode;
  session: Session | null;
  locale: string;
  messages: Messages;
};

export function AppProviders({ children, session, locale, messages }: Props) {
  const [emotionCache] = useState(clientEmotionCache);

  return (
    <CacheProvider value={emotionCache}>
      <SessionProvider session={session}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <FeedbackProvider>{children}</FeedbackProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </SessionProvider>
    </CacheProvider>
  );
}
