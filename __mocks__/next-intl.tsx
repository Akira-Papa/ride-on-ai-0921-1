import type { ReactNode } from 'react';

import { commonMessages } from '@/locales/ja/common';

type MessageTree = Record<string, unknown>;

function resolvePath(messages: MessageTree, path: string[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as MessageTree)) {
      return (acc as MessageTree)[key];
    }
    return undefined;
  }, messages);
}

type ProviderProps = {
  children: ReactNode;
  locale?: string;
  messages?: Record<string, unknown>;
};

export function useTranslations(namespace?: string) {
  return (key: string) => {
    const path = namespace ? `${namespace}.${key}` : key;
    const resolved = resolvePath(commonMessages, path.split('.'));
    if (typeof resolved === 'string') {
      return resolved;
    }
    return path;
  };
}

export function useFormatter() {
  return {
    number: (value: number) => value.toString(),
    dateTime: (value: Date | string) =>
      (value instanceof Date ? value : new Date(value)).toISOString(),
  };
}

export function useLocale() {
  return 'ja';
}

export function NextIntlProvider({ children }: ProviderProps) {
  return <>{children}</>;
}

export function NextIntlClientProvider({ children }: ProviderProps) {
  return <>{children}</>;
}

export default {
  useTranslations,
  useFormatter,
  useLocale,
  NextIntlProvider,
  NextIntlClientProvider,
};
