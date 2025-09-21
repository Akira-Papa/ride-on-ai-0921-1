'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';

import { FeedbackProvider } from '@/components/feedback/FeedbackProvider';
import { EmotionCacheProvider } from '@/components/providers/EmotionCacheProvider';
import type { Messages } from '@/lib/i18n/config';
import { defaultTimeZone } from '@/lib/i18n/config';
import { theme } from '@/theme';

import type { ReactNode } from 'react';
import type { Session } from 'next-auth';

type Props = {
  children: ReactNode;
  session: Session | null;
  locale: string;
  messages: Messages;
};

export function AppProviders({ children, session, locale, messages }: Props) {
  return (
    <EmotionCacheProvider>
      <SessionProvider session={session}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone={defaultTimeZone}
        >
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <FeedbackProvider>{children}</FeedbackProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </SessionProvider>
    </EmotionCacheProvider>
  );
}
