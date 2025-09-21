import { commonMessages } from "@/locales/ja/common";

export type Messages = typeof commonMessages;

export const defaultLocale = "ja";
export const defaultTimeZone = "Asia/Tokyo";

export async function getMessages(): Promise<Messages> {
  return commonMessages;
}
