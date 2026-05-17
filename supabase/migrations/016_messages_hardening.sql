-- ========================================
-- Migracja 016: Hardening wiadomości (RLS + constraints)
-- ========================================
-- Data: 2026-05-16
-- Opis: Ogranicza treść wiadomości, blokuje UPDATE poza is_read,
--       zaostrza INSERT RLS (pierwszy kontakt + odpowiedź w istniejącej konwersacji).
--       Sprawdzenie istniejącej konwersacji przez SECURITY DEFINER (bez rekurencji RLS).
--
-- Wymagania: 002_create_tables.sql, 004_rls_policies.sql, 010_subscription_fields.sql
--
-- Uwaga: Przed zastosowaniem sprawdź, czy w tabeli messages nie ma wierszy z pustym
-- body lub długością > 3000 (ADD CONSTRAINT może wtedy się nie powieść).
-- ========================================

-- ========================================
-- 1. Ograniczenia na kolumnie body
-- ========================================
ALTER TABLE public.messages
  ADD CONSTRAINT messages_body_nonempty
    CHECK (char_length(trim(body)) > 0),
  ADD CONSTRAINT messages_body_max_length
    CHECK (char_length(body) <= 3000);

-- ========================================
-- 2. UPDATE: tylko is_read może się zmienić
-- ========================================
CREATE OR REPLACE FUNCTION public.messages_restrict_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.from_user_id IS DISTINCT FROM OLD.from_user_id
     OR NEW.to_user_id IS DISTINCT FROM OLD.to_user_id
     OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
     OR NEW.body IS DISTINCT FROM OLD.body
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Only is_read may be updated on messages';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_before_update_restrict ON public.messages;

CREATE TRIGGER messages_before_update_restrict
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.messages_restrict_update();

-- ========================================
-- 3. Helper: istniejąca konwersacja (bez rekurencji RLS w polityce INSERT)
-- ========================================
CREATE OR REPLACE FUNCTION public.messages_has_existing_dyad(
  p_listing_id uuid,
  p_user_a uuid,
  p_user_b uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    auth.uid() IN (p_user_a, p_user_b)
    AND EXISTS (
      SELECT 1
      FROM public.messages m
      WHERE m.listing_id = p_listing_id
        AND (
          (m.from_user_id = p_user_a AND m.to_user_id = p_user_b)
          OR (m.from_user_id = p_user_b AND m.to_user_id = p_user_a)
        )
    );
$$;

REVOKE ALL ON FUNCTION public.messages_has_existing_dyad(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.messages_has_existing_dyad(uuid, uuid, uuid) TO authenticated;

-- ========================================
-- 4. INSERT RLS: pierwszy kontakt lub odpowiedź w istniejącej konwersacji
-- ========================================
DROP POLICY IF EXISTS "messages_insert_authenticated" ON public.messages;

CREATE POLICY "messages_insert_valid" ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id
    AND from_user_id <> to_user_id
    AND EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_id
    )
    AND (
      -- A. Pierwszy kontakt: płatny nie-właściciel -> właściciel ogłoszenia
      (
        to_user_id = (
          SELECT l.owner_id
          FROM public.listings l
          WHERE l.id = listing_id
        )
        AND auth.uid() <> (
          SELECT l.owner_id
          FROM public.listings l
          WHERE l.id = listing_id
        )
        AND EXISTS (
          SELECT 1
          FROM public.users u
          WHERE u.id = auth.uid()
            AND u.is_paid = true
        )
      )
      OR
      -- B. Odpowiedź: istniejąca konwersacja; nadawca to właściciel lub płatny użytkownik
      (
        public.messages_has_existing_dyad(listing_id, auth.uid(), to_user_id)
        AND (
          auth.uid() = (
            SELECT l.owner_id
            FROM public.listings l
            WHERE l.id = listing_id
          )
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND u.is_paid = true
          )
        )
      )
    )
  );
