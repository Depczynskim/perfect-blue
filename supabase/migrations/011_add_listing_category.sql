-- ========================================
-- Migracja 011: Kategoria ogłoszenia
-- ========================================
-- Data: 2026-01-25
-- Opis: Dodaje kolumnę category do tabeli listings
-- ========================================

-- Dodaj kolumnę category
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'long_term_rent'
  CHECK (category IN ('long_term_rent', 'short_term_rent', 'sale'));

-- Komentarz
COMMENT ON COLUMN public.listings.category IS 'Kategoria ogłoszenia: long_term_rent, short_term_rent, sale';

-- Indeks dla filtrowania po kategorii
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings (category);

-- Indeks dla filtrowania po statusie i kategorii (często używane razem)
CREATE INDEX IF NOT EXISTS idx_listings_status_category ON public.listings (status, category);

-- Weryfikacja
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'listings'
AND column_name = 'category';
