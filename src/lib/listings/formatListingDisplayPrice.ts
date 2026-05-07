import { formatPrice } from '@/lib/format';
import type { ListingTransactionType } from '@/lib/supabase/types';

/** Localized fragments appended after the amount (e.g. " / month"). */
export interface ListingPriceDisplaySuffixes {
  perMonth: string;
  perNight: string;
}

export function formatListingDisplayPrice(options: {
  price: number;
  currency: string;
  locale: string;
  transactionType: ListingTransactionType;
  suffixes: ListingPriceDisplaySuffixes;
}): string {
  const { price, currency, locale, transactionType, suffixes } = options;
  const amount = formatPrice(price, currency, locale);
  const base = currency === 'EUR' ? `${amount} €` : `${amount} ${currency}`;

  switch (transactionType) {
    case 'rent_long':
      return `${base}${suffixes.perMonth}`;
    case 'rent_short':
      return `${base}${suffixes.perNight}`;
    case 'sale':
      return base;
  }
}
