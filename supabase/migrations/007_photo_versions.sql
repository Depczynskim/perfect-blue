-- ========================================
-- Migracja 007: Wersje zdjęć (display + thumb)
-- ========================================
-- Data: 2026-01-10
-- Opis: Rozszerzenie tabeli listing_photos o osobne URL dla display i thumb
--
-- Jak uruchomić:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Wklej ten skrypt i uruchom (Run)
-- ========================================

-- ========================================
-- KROK 1: Dodaj nowe kolumny dla wersji zdjęć
-- ========================================
-- Dodajemy kolumny dla dwóch wersji:
-- - display: pełne zdjęcie do strony szczegółów
-- - thumb: miniatura do list/gridów

ALTER TABLE public.listing_photos 
ADD COLUMN IF NOT EXISTS display_path TEXT,
ADD COLUMN IF NOT EXISTS display_url TEXT,
ADD COLUMN IF NOT EXISTS thumb_path TEXT,
ADD COLUMN IF NOT EXISTS thumb_url TEXT;

-- ========================================
-- KROK 2: Migracja istniejących danych
-- ========================================
-- Kopiuje istniejące storage_path/public_url do display_* (domyślnie)
-- Istniejące zdjęcia będą używać tej samej wersji jako display i thumb

UPDATE public.listing_photos 
SET 
  display_path = storage_path,
  display_url = public_url,
  thumb_path = storage_path,
  thumb_url = public_url
WHERE display_path IS NULL AND storage_path IS NOT NULL;

-- ========================================
-- KROK 3: Komentarze do kolumn
-- ========================================
COMMENT ON COLUMN public.listing_photos.storage_path IS 'DEPRECATED - użyj display_path/thumb_path';
COMMENT ON COLUMN public.listing_photos.public_url IS 'DEPRECATED - użyj display_url/thumb_url';
COMMENT ON COLUMN public.listing_photos.display_path IS 'Ścieżka w Storage dla wersji display (pełne zdjęcie)';
COMMENT ON COLUMN public.listing_photos.display_url IS 'Publiczny URL wersji display';
COMMENT ON COLUMN public.listing_photos.thumb_path IS 'Ścieżka w Storage dla wersji thumb (miniatura)';
COMMENT ON COLUMN public.listing_photos.thumb_url IS 'Publiczny URL wersji thumb (miniatura)';

-- ========================================
-- WERYFIKACJA
-- ========================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listing_photos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

