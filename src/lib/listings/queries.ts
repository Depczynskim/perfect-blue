import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingTransactionType } from '@/lib/supabase/types';
import type { CityCount, ListingCardItem, ListingListFilters, ListingListItem } from './types';
import { normalizeLocationInput } from './normalization';

const VALID_TRANSACTION_TYPES: ListingTransactionType[] = ['sale', 'rent_long', 'rent_short'];
const DEFAULT_LIMIT = 20;

const LEGACY_CATEGORY_TO_TRANSACTION: Record<string, ListingTransactionType> = {
  long_term_rent: 'rent_long',
  short_term_rent: 'rent_short',
  sale: 'sale',
};

function isValidTransactionType(value: unknown): value is ListingTransactionType {
  return typeof value === 'string' && VALID_TRANSACTION_TYPES.includes(value as ListingTransactionType);
}

function clampLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(100, limit));
}

export async function getActiveCityCounts(supabase: SupabaseClient): Promise<CityCount[]> {
  const { data, error } = await supabase.rpc('get_active_listing_city_counts');

  if (error) {
    throw new Error(`Failed to fetch city counts: ${error.message}`);
  }

  return (data || [])
    .map((row: { city: string | null; count: number | string | null }) => ({
      city: row.city ?? '',
      count: Number(row.count ?? 0),
    }))
    .filter((row: CityCount) => row.city.trim().length > 0 && row.count > 0);
}

export function resolveSelectedCity(cityCounts: CityCount[], requestedCity?: string) {
  const normalizedRequested = normalizeLocationInput(requestedCity);
  const allCities = new Set(cityCounts.map((item) => item.city));
  const topCity = cityCounts[0]?.city ?? null;

  if (normalizedRequested && allCities.has(normalizedRequested)) {
    return normalizedRequested;
  }

  return topCity;
}

export async function getActiveListings(
  supabase: SupabaseClient,
  filters: ListingListFilters
): Promise<ListingCardItem[]> {
  const limit = clampLimit(filters.limit);
  const selectedCity = normalizeLocationInput(filters.city);
  const selectedTransaction = isValidTransactionType(filters.transactionType)
    ? filters.transactionType
    : undefined;

  let query = supabase
    .from('listings')
    .select(
      `
      id, title, description, price, currency, transaction_type, property_type, size_m2, rooms, bathrooms, address_text, city, zone, location, created_at,
      listing_photos (id, thumb_url, order_index)
    `
    )
    .eq('status', 'active');

  if (selectedTransaction) {
    query = query.eq('transaction_type', selectedTransaction);
  }

  if (selectedCity) {
    query = query.eq('city', selectedCity);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);

  if (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }

  return (data || []).map((listing: ListingListItem) => {
    const photos = listing.listing_photos || [];
    const sortedPhotos = [...photos].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    return {
      ...listing,
      thumbnailUrl: sortedPhotos[0]?.thumb_url || null,
      photoUrls: sortedPhotos.map((p) => p.thumb_url).filter((u): u is string => !!u),
    };
  });
}

export function parseTransactionTypeFilter(value: unknown): ListingTransactionType | undefined {
  if (value == null || typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim();
  const resolved = LEGACY_CATEGORY_TO_TRANSACTION[normalized] ?? normalized;
  return isValidTransactionType(resolved) ? resolved : undefined;
}

/** @deprecated Use parseTransactionTypeFilter; kept for URL param `category` compatibility */
export function parseCategoryFilter(value: unknown): ListingTransactionType | undefined {
  return parseTransactionTypeFilter(value);
}
