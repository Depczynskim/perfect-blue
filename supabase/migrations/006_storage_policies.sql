-- ========================================
-- Migracja 006: Polityki RLS dla Supabase Storage
-- ========================================
-- Data: 2026-01-10
-- Opis: Konfiguracja polityk bezpieczeństwa dla bucketu listing-photos
--
-- Jak uruchomić:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Wklej ten skrypt i uruchom (Run)
-- ========================================

-- ========================================
-- KROK 1: Upewnij się, że bucket istnieje i jest publiczny
-- ========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-photos', 
  'listing-photos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif'];

-- ========================================
-- KROK 2: Usuń istniejące polityki (jeśli są)
-- ========================================
DROP POLICY IF EXISTS "Public read access for listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing photos" ON storage.objects;

-- ========================================
-- KROK 3: Polityka SELECT - publiczny odczyt
-- ========================================
-- Każdy może oglądać zdjęcia (bucket jest publiczny)
CREATE POLICY "Public read access for listing photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'listing-photos');

-- ========================================
-- KROK 4: Polityka INSERT - upload dla zalogowanych
-- ========================================
-- Zalogowani użytkownicy mogą uploadować do folderu ze swoim user_id
-- Struktura ścieżki: {user_id}/{filename}
CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'listing-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- KROK 5: Polityka UPDATE - aktualizacja własnych plików
-- ========================================
CREATE POLICY "Users can update own listing photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'listing-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- KROK 6: Polityka DELETE - usuwanie własnych plików
-- ========================================
CREATE POLICY "Users can delete own listing photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'listing-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- WERYFIKACJA
-- ========================================
SELECT 
  policyname, 
  permissive, 
  cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%listing photos%';

