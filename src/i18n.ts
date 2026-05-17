import { getRequestConfig } from 'next-intl/server';
import type { RequestConfig } from 'next-intl/server';

// Dostępne języki
export const locales = ['pl', 'en', 'es', 'ar', 'de'] as const;
export type Locale = (typeof locales)[number];

// Domyślny język
export const defaultLocale: Locale = 'pl';

// Nazwy języków do wyświetlenia
export const localeNames: Record<Locale, string> = {
  pl: 'Polski',
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  de: 'Deutsch',
};

// Mapowanie locale na format Intl (używane w formatowaniu dat i liczb)
export const localeToIntl: Record<Locale, string> = {
  pl: 'pl-PL',
  en: 'en-US',
  es: 'es-ES',
  ar: 'ar-SA',
  de: 'de-DE',
};

export default getRequestConfig(async ({
  locale,
  requestLocale,
}): Promise<RequestConfig> => {
  // `requestLocale` is the `[locale]` segment; it can be any single path segment
  // (e.g. /favicon.ico) and must not be used to load message JSON unless it is real.
  const raw = locale ?? (await requestLocale);
  const resolved: Locale =
    raw != null && locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale;

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
