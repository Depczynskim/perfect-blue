-- ========================================
-- Migracja 017: MVP free messaging (RLS INSERT)
-- ========================================
-- Data: 2026-05-16
-- Opis: Relaksuje wyłącznie wymaganie users.is_paid w polityce messages_insert_valid.
--       Pozostałe zabezpieczenia z migracji 016 bez zmian.
--
-- Wymagania: 016_messages_hardening.sql
--
-- Temporary MVP free messaging policy. Paid messaging can be restored by recreating
-- this policy with users.is_paid checks from migration 016.
-- ========================================

DROP POLICY IF EXISTS "messages_insert_valid" ON public.messages;

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
      -- A. Pierwszy kontakt: nie-właściciel -> właściciel ogłoszenia
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
      )
      OR
      -- B. Odpowiedź: istniejąca konwersacja (dyad)
      (
        public.messages_has_existing_dyad(listing_id, auth.uid(), to_user_id)
      )
    )
  );
