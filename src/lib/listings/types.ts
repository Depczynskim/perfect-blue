import type { ListingPropertyType, ListingTransactionType } from '@/lib/supabase/types';

export interface ListingListFilters {
  transactionType?: ListingTransactionType;
  city?: string;
  limit?: number;
}

export interface CityCount {
  city: string;
  count: number;
}

export interface ListingListItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  transaction_type: ListingTransactionType;
  property_type: ListingPropertyType | null;
  /** PostgREST may return string for NUMERIC */
  size_m2: number | string | null;
  rooms: number | string | null;
  bathrooms: number | string | null;
  address_text: string | null;
  city: string | null;
  zone: string | null;
  location?: unknown;
  created_at: string;
  listing_photos:
    | Array<{ id: string; thumb_url: string | null; order_index: number | null }>
    | null;
}

export interface ListingCardItem extends Omit<ListingListItem, 'listing_photos'> {
  thumbnailUrl: string | null;
  photoUrls: string[];
}
