-- ========================================
-- Migracja 012: City + Zone dla ogloszen
-- ========================================
-- Data: 2026-02-19
-- Opis:
--   - Dodaje kolumny city i zone do listings
--   - Dodaje indeksy pod filtrowanie city/category
--   - Dodaje funkcje RPC do city counts dla aktywnych ogloszen
-- ========================================

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zone TEXT;

COMMENT ON COLUMN public.listings.city IS 'Miasto/Municipio uzywane do filtrowania ogloszen';
COMMENT ON COLUMN public.listings.zone IS 'Strefa/dzielnica (opcjonalna), np. barrio';

CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_status_city ON public.listings (status, city);
CREATE INDEX IF NOT EXISTS idx_listings_status_city_category ON public.listings (status, city, category);

-- Zwraca liste miast z liczba aktywnych ogloszen.
-- Posortowane malejaco po liczbie, potem alfabetycznie.
CREATE OR REPLACE FUNCTION public.get_active_listing_city_counts()
RETURNS TABLE(city TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    l.city,
    COUNT(*)::BIGINT AS count
  FROM public.listings l
  WHERE l.status = 'active'
    AND l.city IS NOT NULL
    AND btrim(l.city) <> ''
  GROUP BY l.city
  ORDER BY count DESC, l.city ASC;
$$;

COMMENT ON FUNCTION public.get_active_listing_city_counts() IS
'Lista miast z licznikami aktywnych ogloszen (city, count).';

-- Weryfikacja
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'listings'
  AND column_name IN ('city', 'zone')
ORDER BY column_name;
