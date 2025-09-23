import { ThemeProvider } from '@mui/material/styles';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlProvider } from 'next-intl';
import { SessionProvider } from 'next-auth/react';
import { ReactElement } from 'react';

import { FeedbackProvider } from '@/components/feedback/FeedbackProvider';
import { theme } from '@/theme';
import { commonMessages } from '@/locales/ja/common';

const locale = 'ja';

type ProvidersProps = {
  children: React.ReactNode;
  session?: any;
};

function Providers({ children, session }: ProvidersProps) {
  const mockSession = session || {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return (
    <SessionProvider session={mockSession}>
      <NextIntlProvider locale={locale} messages={commonMessages}>
        <ThemeProvider theme={theme}>
          <FeedbackProvider>{children}</FeedbackProvider>
        </ThemeProvider>
      </NextIntlProvider>
    </SessionProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { session?: any },
) {
  const { session, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => <Providers session={session}>{children}</Providers>,
    ...renderOptions
  });
}

// Re-export everything from testing library
export * from '@testing-library/react';

// Test data factories
export const createMockPost = (overrides = {}) => ({
  id: '507f1f77bcf86cd799439011',
  title: 'テスト投稿',
  lesson: 'テストレッスン内容',
  situationalContext: 'テスト状況説明',
  lessonPreview: 'テストレッスン内容',
  tags: ['テスト', 'モック'],
  visibility: 'member' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  category: {
    id: '507f1f77bcf86cd799439012',
    name: 'テストカテゴリー',
    slug: 'test-category',
  },
  author: {
    id: 'test-user-id',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  },
  reactions: {
    likeCount: 5,
    bookmarkCount: 3,
    viewerHasLiked: false,
    viewerHasBookmarked: false,
  },
  ...overrides,
});

export const createMockCategory = (overrides = {}) => ({
  id: '507f1f77bcf86cd799439012',
  name: 'テストカテゴリー',
  slug: 'test-category',
  description: 'テストカテゴリーの説明',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  image: 'https://example.com/avatar.jpg',
  role: 'member' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  user: createMockUser(),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

// Mock API response helpers
export const mockApiResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const mockApiError = (message: string, status = 400) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Wait helpers for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock fetch for tests
export const setupMockFetch = () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;
  return mockFetch;
};

// Cleanup helpers
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};
