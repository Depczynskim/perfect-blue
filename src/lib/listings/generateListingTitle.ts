import type { ListingTransactionType } from '@/lib/supabase/types';

const PROPERTY_TITLE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  room: 'Room',
  studio: 'Studio',
};

function formatSizeM2ForTitle(sizeM2: number): string {
  if (!Number.isFinite(sizeM2)) return '0 m²';
  if (Number.isInteger(sizeM2) || Math.abs(sizeM2 - Math.round(sizeM2)) < 1e-9) {
    return `${Math.round(sizeM2)} m²`;
  }
  return `${sizeM2} m²`;
}

/** Deterministic en-US grouping for SEO titles (e.g. 220,000). */
function formatPriceIntegerForTitle(price: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(price);
}

function formatPriceWithUnitForTitle(price: number, transactionType: ListingTransactionType): string {
  const n = formatPriceIntegerForTitle(price);
  switch (transactionType) {
    case 'sale':
      return `${n} EUR`;
    case 'rent_long':
      return `${n} EUR/month`;
    case 'rent_short':
      return `${n} EUR/night`;
  }
}

export function generateListingTitle(
  propertyType: string,
  city: string,
  sizeM2: number,
  price: number,
  transactionType: ListingTransactionType,
): string {
  const label = PROPERTY_TITLE_LABELS[propertyType] ?? propertyType;
  const pricePart = formatPriceWithUnitForTitle(price, transactionType);
  return `${label} in ${city} – ${formatSizeM2ForTitle(sizeM2)} – ${pricePart}`;
}
