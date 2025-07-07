import { getRequestConfig } from 'next-intl/server'

export const languages = ['es', 'en', 'de'] as const;

export const defaultLocale = 'es';

export type Locale = typeof languages[number];

export async function getMessages(locale: string) {
    const messages = (await import(`@/messages/${locale}.json`)).default
    return messages
  }
