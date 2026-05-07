/**
 * Typy bazy danych Supabase
 * 
 * Po utworzeniu tabel w Supabase, wygeneruj typy automatycznie:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts
 * 
 * Na razie definiujemy podstawowe typy ręcznie.
 */

export type ListingStatus = 'active' | 'hidden' | 'rented' | 'sold'
export type ListingTransactionType = 'sale' | 'rent_long' | 'rent_short'
export type ListingPropertyType = 'apartment' | 'house' | 'room' | 'studio'
export type Currency = 'PLN' | 'EUR' | 'USD' | 'GBP'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed'
export type PaymentProvider = 'stripe'

export type UserPreferredLocale = 'pl' | 'en' | 'es' | 'de' | 'ar'

export interface User {
  id: string
  is_paid: boolean
  created_at: string
  display_name?: string | null
  preferred_locale?: UserPreferredLocale
  updated_at?: string | null
}

export interface Listing {
  id: string
  owner_id: string
  title: string
  description: string | null
  price: number
  currency: 'EUR'
  transaction_type: ListingTransactionType
  property_type: ListingPropertyType
  size_m2: number
  rooms: number
  bathrooms: number
  address_text: string | null
  city: string | null
  zone: string | null
  location: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat]
  } | null
  status: ListingStatus
  created_at: string
  expires_at: string | null
}

export interface ListingPhoto {
  id: string
  listing_id: string
  display_path: string
  display_url: string
  thumb_path: string
  thumb_url: string
  order_index: number
  created_at: string
}

export interface Message {
  id: string
  from_user_id: string
  to_user_id: string
  listing_id: string
  body: string
  is_read: boolean
  created_at: string
}

export interface Payment {
  id: string
  payer_user_id: string
  listing_id: string
  amount: number
  currency: string
  provider: PaymentProvider
  provider_payment_id: string | null
  status: PaymentStatus
  created_at: string
}

export interface ContactAccess {
  id: string
  payer_user_id: string
  listing_id: string
  granted_at: string
}

export interface GeocodingCache {
  id: string
  input_address_normalized: string
  lat: number
  lng: number
  created_at: string
}

