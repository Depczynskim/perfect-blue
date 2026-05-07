import { localeToIntl } from '@/i18n';

/**
 * Formatowanie cen z uwzględnieniem locale
 */
export function formatPrice(
  price: number,
  currency: string,
  locale: string
): string {
  const intlLocale = localeToIntl[locale as keyof typeof localeToIntl] || 'en-US';

  return new Intl.NumberFormat(intlLocale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formatowanie daty z uwzględnieniem locale
 */
export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const intlLocale = localeToIntl[locale as keyof typeof localeToIntl] || 'en-US';
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  return dateObj.toLocaleDateString(intlLocale, options || defaultOptions);
}

/**
 * Formatowanie daty z godziną
 */
export function formatDateTime(
  date: Date | string,
  locale: string
): string {
  return formatDate(date, locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
