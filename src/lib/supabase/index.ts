// Re-eksport klientów Supabase
export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'

// Re-eksport typów
export * from './types'

/**
 * UWAGA: Użycie klientów Supabase
 * 
 * W CAŁYM PROJEKCIE używaj tych importów:
 * 
 * - Client Components (use client):
 *   import { createBrowserClient } from '@/lib/supabase'
 * 
 * - Server Components / API Routes:
 *   import { createServerClient } from '@/lib/supabase'
 * 
 * NIE używaj bezpośrednich importów z './client' lub './server'!
 */

