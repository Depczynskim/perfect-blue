-- ========================================
-- Migracja 001: Włączenie PostGIS
-- ========================================
-- Data: 2026-01-02
-- Opis: Włącza rozszerzenie PostGIS dla obsługi danych geograficznych
--
-- Jak uruchomić:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Wklej ten skrypt i uruchom (Run)
-- ========================================

-- Włączenie rozszerzenia PostGIS
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Weryfikacja instalacji
SELECT 
    extname AS extension_name,
    extversion AS version
FROM pg_extension 
WHERE extname = 'postgis';

-- Test: sprawdzenie czy funkcje geograficzne działają
SELECT ST_AsText(ST_MakePoint(21.0122, 52.2297)) AS warsaw_point;
-- Powinno zwrócić: POINT(21.0122 52.2297)

