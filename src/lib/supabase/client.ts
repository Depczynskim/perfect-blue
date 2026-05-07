import { createBrowserClient } from '@supabase/ssr'

/**
 * Klient Supabase dla Client Components (przeglądarka)
 * Używaj w komponentach z "use client"
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

