-- ========================================
-- Migracja 013: Kanoniczna tabela miast (cities)
-- ========================================
-- Data: 2026-02-26
-- Opis:
--   - Tworzy public.cities jako źródło kanoniczne
--   - Dodaje indeksy pod filtrowanie
--   - Włącza RLS (publiczny odczyt tylko approved)
--   - Dodaje RPC do tworzenia miast pending (bez direct INSERT)
-- ========================================

CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ine_code INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  comarca_code INTEGER NOT NULL,
  comarca TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  autonomous_community TEXT NOT NULL DEFAULT 'Catalonia',
  status TEXT NOT NULL DEFAULT 'approved',
  is_active_region BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cities_status_check CHECK (status IN ('approved', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_cities_status ON public.cities (status);
CREATE INDEX IF NOT EXISTS idx_cities_is_active_region ON public.cities (is_active_region);
CREATE INDEX IF NOT EXISTS idx_cities_comarca ON public.cities (comarca);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities (slug);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities (name);

COMMENT ON TABLE public.cities IS 'Kanoniczna lista miast/municipis dla filtrowania i centroidów mapy';
COMMENT ON COLUMN public.cities.ine_code IS 'Kod INE municipality (unikalny)';
COMMENT ON COLUMN public.cities.slug IS 'Slug miasta do URL-i i filtrów';
COMMENT ON COLUMN public.cities.status IS 'Status miasta: approved | pending';

-- Sekwencja dla pending cities tworzonych przez użytkowników (ujemne pseudo-kody INE).
CREATE SEQUENCE IF NOT EXISTS public.pending_city_ine_code_seq
  INCREMENT BY -1
  MINVALUE -2147483648
  MAXVALUE -1
  START WITH -1
  CACHE 1;

-- Deterministyczny slugify fallback (bez zależności od unaccent).
CREATE OR REPLACE FUNCTION public.slugify_city_name(input_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  value TEXT;
BEGIN
  value := COALESCE(input_name, '');
  value := lower(btrim(value));

  -- Podstawowe mapowanie diakrytyków Latin/Catalan/Spanish.
  value := translate(
    value,
    'àáâäãåāăąçćčďèéêëēėęěìíîïīįłñńňòóôöõøōőŕřśšșťțùúûüūůűýÿźžż',
    'aaaaaaaaacccdeeeeeeeeiiiiiilnnnoooooooorrsssttuuuuuuuyyzzz'
  );

  -- Usunięcie apostrofów i backticków.
  value := regexp_replace(value, '[''`´]', '', 'g');
  -- Punctuation/special chars -> spacja, następnie spacje -> myślnik.
  value := regexp_replace(value, '[^a-z0-9\\s-]', ' ', 'g');
  value := regexp_replace(value, '\\s+', '-', 'g');
  value := regexp_replace(value, '-{2,}', '-', 'g');
  value := regexp_replace(value, '^-+|-+$', '', 'g');

  IF value = '' THEN
    RETURN 'city';
  END IF;

  RETURN value;
END;
$$;

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cities_select_approved" ON public.cities;
CREATE POLICY "cities_select_approved" ON public.cities
  FOR SELECT
  USING (status = 'approved');

-- Brak direct INSERT policy: pending city powstaje wyłącznie przez RPC.
CREATE OR REPLACE FUNCTION public.create_pending_city(
  p_name TEXT,
  p_comarca TEXT,
  p_comarca_code INTEGER,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_name TEXT;
  normalized_comarca TEXT;
  generated_ine INTEGER;
  base_slug TEXT;
  final_slug TEXT;
  new_city_id UUID;
BEGIN
  normalized_name := btrim(COALESCE(p_name, ''));
  normalized_comarca := btrim(COALESCE(p_comarca, ''));

  IF normalized_name = '' THEN
    RAISE EXCEPTION 'City name is required';
  END IF;

  IF normalized_comarca = '' THEN
    RAISE EXCEPTION 'Comarca is required';
  END IF;

  IF p_comarca_code IS NULL THEN
    RAISE EXCEPTION 'Comarca code is required';
  END IF;

  IF p_lat IS NULL OR p_lat < -90 OR p_lat > 90 THEN
    RAISE EXCEPTION 'Invalid latitude';
  END IF;

  IF p_lng IS NULL OR p_lng < -180 OR p_lng > 180 THEN
    RAISE EXCEPTION 'Invalid longitude';
  END IF;

  generated_ine := nextval('public.pending_city_ine_code_seq')::INTEGER;
  base_slug := public.slugify_city_name(normalized_name);
  final_slug := base_slug;

  IF EXISTS (SELECT 1 FROM public.cities c WHERE c.slug = final_slug) THEN
    final_slug := base_slug || '-' || abs(generated_ine)::TEXT;
  END IF;

  INSERT INTO public.cities (
    ine_code,
    name,
    slug,
    comarca_code,
    comarca,
    lat,
    lng,
    autonomous_community,
    status,
    is_active_region
  )
  VALUES (
    generated_ine,
    normalized_name,
    final_slug,
    p_comarca_code,
    normalized_comarca,
    p_lat,
    p_lng,
    'Catalonia',
    'pending',
    false
  )
  RETURNING id INTO new_city_id;

  RETURN new_city_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_pending_city(TEXT, TEXT, INTEGER, DOUBLE PRECISION, DOUBLE PRECISION) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_pending_city(TEXT, TEXT, INTEGER, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

COMMENT ON FUNCTION public.create_pending_city(TEXT, TEXT, INTEGER, DOUBLE PRECISION, DOUBLE PRECISION) IS
'Tworzy city z wymuszonym statusem pending (bez direct INSERT).';
