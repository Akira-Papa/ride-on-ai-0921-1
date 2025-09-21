import type { Metadata } from "next";
import { Merriweather, Roboto } from "next/font/google";
import { getServerSession } from "next-auth";

import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";
import { authOptions } from "@/lib/auth/options";
import { defaultLocale, getMessages } from "@/lib/i18n/config";

const headingFont = Merriweather({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-heading",
});

const bodyFont = Roboto({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "anotoki",
    template: "%s | anotoki",
  },
  description: "あの時の学びを共有する会員制コミュニティ",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const messages = await getMessages();

  return (
    <html lang="ja" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <AppProviders
          session={session}
          locale={defaultLocale}
          messages={messages}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
