import { cache } from 'react';
import { createServerClient } from '@/lib/supabase';

export interface ListingDetailRow {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  transaction_type: string;
  property_type: string | null;
  size_m2: number | string | null;
  rooms: number | string | null;
  bathrooms: number | string | null;
  address_text: string | null;
  city: string | null;
  zone: string | null;
  location: unknown;
  status: string;
  created_at: string;
  owner_id: string;
}

export interface ListingDetailPhoto {
  id: string;
  display_url: string | null;
  thumb_url: string | null;
  order_index: number | null;
}

export const getListingDetailData = cache(async (id: string) => {
  const supabase = await createServerClient();

  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      id, title, description, price, currency, transaction_type, property_type, size_m2, rooms, bathrooms,
      address_text, city, zone, location, status, created_at, owner_id
    `)
    .eq('id', id)
    .single();

  if (error || !listing) {
    return null;
  }

  const { data: photos } = await supabase
    .from('listing_photos')
    .select('id, display_url, thumb_url, order_index')
    .eq('listing_id', id)
    .order('order_index', { ascending: true });

  return {
    listing: listing as ListingDetailRow,
    photos: (photos ?? []) as ListingDetailPhoto[],
  };
});
