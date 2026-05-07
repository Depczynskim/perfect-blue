-- ========================================
-- Migracja 002: Utworzenie tabel
-- ========================================
-- Data: 2026-01-02
-- Opis: Tworzy wszystkie tabele dla MVP portalu ogłoszeń
--
-- Wymagania: Najpierw uruchom 001_enable_postgis.sql
--
-- Jak uruchomić:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Wklej ten skrypt i uruchom (Run)
-- ========================================

-- ========================================
-- TABELA: users
-- ========================================
-- Rozszerzenie tabeli auth.users o dodatkowe pola aplikacji
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Komentarz do tabeli
COMMENT ON TABLE public.users IS 'Profile użytkowników powiązane z auth.users';

-- ========================================
-- TABELA: listings
-- ========================================
-- Ogłoszenia nieruchomości
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'PLN' CHECK (currency IN ('PLN', 'EUR', 'USD', 'GBP')),
    address_text TEXT,
    location GEOGRAPHY(Point, 4326),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'rented', 'sold')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Indeks GIST dla wyszukiwania geograficznego
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings USING GIST (location);

-- Indeks dla filtrowania po statusie i dacie
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON public.listings (status, created_at DESC);

-- Indeks dla właściciela
CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.listings (owner_id);

COMMENT ON TABLE public.listings IS 'Ogłoszenia nieruchomości';

-- ========================================
-- TABELA: listing_photos
-- ========================================
-- Zdjęcia przypisane do ogłoszeń (przechowywane w Cloudflare R2)
CREATE TABLE IF NOT EXISTS public.listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    r2_key TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks dla pobierania zdjęć ogłoszenia
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing ON public.listing_photos (listing_id, order_index);

COMMENT ON TABLE public.listing_photos IS 'Zdjęcia ogłoszeń przechowywane w Cloudflare R2';

-- ========================================
-- TABELA: messages
-- ========================================
-- Wiadomości między użytkownikami
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks dla skrzynki odbiorczej
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON public.messages (to_user_id, created_at DESC);

-- Indeks dla wysłanych wiadomości
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON public.messages (from_user_id, created_at DESC);

-- Indeks dla wiadomości w kontekście ogłoszenia
CREATE INDEX IF NOT EXISTS idx_messages_listing ON public.messages (listing_id, created_at DESC);

COMMENT ON TABLE public.messages IS 'Wiadomości między użytkownikami w kontekście ogłoszeń';

-- ========================================
-- TABELA: payments
-- ========================================
-- Historia płatności (Pay-to-Contact)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'PLN',
    provider TEXT DEFAULT 'stripe' CHECK (provider IN ('stripe')),
    provider_payment_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks dla historii płatności użytkownika
CREATE INDEX IF NOT EXISTS idx_payments_payer ON public.payments (payer_user_id, created_at DESC);

-- Indeks dla wyszukiwania po provider_payment_id (webhook Stripe)
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON public.payments (provider_payment_id);

COMMENT ON TABLE public.payments IS 'Historia płatności Pay-to-Contact';

-- ========================================
-- TABELA: contacts_access
-- ========================================
-- Dostęp do kontaktu właściciela po opłaceniu
CREATE TABLE IF NOT EXISTS public.contacts_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(payer_user_id, listing_id)
);

-- Indeks dla sprawdzania dostępu
CREATE INDEX IF NOT EXISTS idx_contacts_access_payer_listing ON public.contacts_access (payer_user_id, listing_id);

COMMENT ON TABLE public.contacts_access IS 'Rejestr wykupionych dostępów do kontaktu właściciela';

-- ========================================
-- TABELA: geocoding_cache
-- ========================================
-- Cache wyników geokodowania (LocationIQ)
CREATE TABLE IF NOT EXISTS public.geocoding_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_address_normalized TEXT NOT NULL UNIQUE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks dla wyszukiwania po adresie
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_address ON public.geocoding_cache (input_address_normalized);

COMMENT ON TABLE public.geocoding_cache IS 'Cache wyników geokodowania dla oszczędności API';

-- ========================================
-- WERYFIKACJA
-- ========================================
-- Sprawdzenie utworzonych tabel
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

