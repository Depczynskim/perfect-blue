-- ========================================
-- Migracja 005: Aktualizacja listing_photos na Supabase Storage
-- ========================================
-- Data: 2026-01-10
-- Opis: Zmiana z Cloudflare R2 na Supabase Storage
--       - Zamiana kolumny r2_key na storage_path + public_url
--
-- Jak uruchomić:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Wklej ten skrypt i uruchom (Run)
-- ========================================

-- Krok 1: Dodaj nowe kolumny
ALTER TABLE public.listing_photos 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS public_url TEXT;

-- Krok 2: Migracja istniejących danych (jeśli są)
-- Kopiuje r2_key do storage_path (dla ewentualnych istniejących rekordów)
UPDATE public.listing_photos 
SET storage_path = r2_key 
WHERE r2_key IS NOT NULL AND storage_path IS NULL;

-- Krok 3: Usuń starą kolumnę r2_key
ALTER TABLE public.listing_photos 
DROP COLUMN IF EXISTS r2_key;

-- Krok 4: Dodaj NOT NULL constraint dla nowych kolumn (opcjonalnie)
-- Zakomentowane - pozwala na migrację bez błędów
-- ALTER TABLE public.listing_photos ALTER COLUMN storage_path SET NOT NULL;
-- ALTER TABLE public.listing_photos ALTER COLUMN public_url SET NOT NULL;

-- Komentarz do tabeli
COMMENT ON TABLE public.listing_photos IS 'Zdjęcia ogłoszeń przechowywane w Supabase Storage';
COMMENT ON COLUMN public.listing_photos.storage_path IS 'Ścieżka pliku w Supabase Storage (bucket: listing-photos)';
COMMENT ON COLUMN public.listing_photos.public_url IS 'Publiczny URL do zdjęcia';

-- ========================================
-- Konfiguracja Supabase Storage Bucket
-- ========================================
-- UWAGA: Poniższe komendy należy wykonać przez Dashboard lub API
-- 
-- 1. Utwórz bucket:
--    - Nazwa: listing-photos
--    - Public: TAK (dla MVP)
--
-- 2. Lub użyj SQL (wymaga service_role):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('listing-photos', 'listing-photos', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- ========================================
-- Polityki Storage (RLS)
-- ========================================
-- Polityka: każdy może czytać publiczne zdjęcia
-- CREATE POLICY "Public read access" ON storage.objects
-- FOR SELECT USING (bucket_id = 'listing-photos');

-- Polityka: zalogowani użytkownicy mogą uploadować do swojego folderu
-- CREATE POLICY "Authenticated users can upload" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'listing-photos' 
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Polityka: użytkownicy mogą usuwać własne pliki
-- CREATE POLICY "Users can delete own files" ON storage.objects
-- FOR DELETE USING (
--   bucket_id = 'listing-photos' 
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- ========================================
-- WERYFIKACJA
-- ========================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listing_photos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

