-- ========================================
-- Migracja 004: Row Level Security (RLS)
-- ========================================
-- Data: 2026-01-02
-- Opis: Konfiguracja polityk bezpieczeństwa dla wszystkich tabel
--
-- Wymagania: Najpierw uruchom 002_create_tables.sql i 003_auth_trigger.sql
--
-- Jak uruchomić:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Wklej ten skrypt i uruchom (Run)
-- ========================================

-- ========================================
-- TABELA: users
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Użytkownik widzi tylko swój profil
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Użytkownik może aktualizować tylko swój profil
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profil tworzony automatycznie przez trigger (nie przez użytkownika)
-- Brak polityki INSERT dla użytkowników

-- ========================================
-- TABELA: listings
-- ========================================
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Każdy może przeglądać aktywne ogłoszenia (publiczne)
CREATE POLICY "listings_select_public" ON public.listings
  FOR SELECT
  USING (status = 'active');

-- Właściciel widzi wszystkie swoje ogłoszenia (w tym ukryte)
CREATE POLICY "listings_select_own" ON public.listings
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Zalogowany użytkownik może dodać ogłoszenie
CREATE POLICY "listings_insert_authenticated" ON public.listings
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Właściciel może edytować swoje ogłoszenia
CREATE POLICY "listings_update_own" ON public.listings
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Właściciel może usuwać swoje ogłoszenia
CREATE POLICY "listings_delete_own" ON public.listings
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ========================================
-- TABELA: listing_photos
-- ========================================
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;

-- Każdy może przeglądać zdjęcia aktywnych ogłoszeń
CREATE POLICY "listing_photos_select_public" ON public.listing_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = listing_photos.listing_id 
      AND (status = 'active' OR owner_id = auth.uid())
    )
  );

-- Właściciel ogłoszenia może dodawać zdjęcia
CREATE POLICY "listing_photos_insert_owner" ON public.listing_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = listing_photos.listing_id 
      AND owner_id = auth.uid()
    )
  );

-- Właściciel ogłoszenia może aktualizować zdjęcia (kolejność)
CREATE POLICY "listing_photos_update_owner" ON public.listing_photos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = listing_photos.listing_id 
      AND owner_id = auth.uid()
    )
  );

-- Właściciel ogłoszenia może usuwać zdjęcia
CREATE POLICY "listing_photos_delete_owner" ON public.listing_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = listing_photos.listing_id 
      AND owner_id = auth.uid()
    )
  );

-- ========================================
-- TABELA: messages
-- ========================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Użytkownik widzi wiadomości wysłane do niego lub przez niego
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Użytkownik może wysyłać wiadomości (tylko jako nadawca)
-- Dodatkowa walidacja dostępu (contacts_access) w aplikacji
CREATE POLICY "messages_insert_authenticated" ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Odbiorca może oznaczać wiadomości jako przeczytane
CREATE POLICY "messages_update_recipient" ON public.messages
  FOR UPDATE
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

-- ========================================
-- TABELA: payments
-- ========================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Użytkownik widzi tylko swoje płatności
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT
  USING (auth.uid() = payer_user_id);

-- Płatności tworzone przez system (webhook Stripe), nie przez użytkownika
-- Service Role Key omija RLS

-- ========================================
-- TABELA: contacts_access
-- ========================================
ALTER TABLE public.contacts_access ENABLE ROW LEVEL SECURITY;

-- Użytkownik widzi do których ogłoszeń ma dostęp
CREATE POLICY "contacts_access_select_payer" ON public.contacts_access
  FOR SELECT
  USING (auth.uid() = payer_user_id);

-- Właściciel ogłoszenia widzi kto wykupił dostęp
CREATE POLICY "contacts_access_select_owner" ON public.contacts_access
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = contacts_access.listing_id 
      AND owner_id = auth.uid()
    )
  );

-- Dostęp nadawany przez system (webhook Stripe)
-- Service Role Key omija RLS

-- ========================================
-- TABELA: geocoding_cache
-- ========================================
ALTER TABLE public.geocoding_cache ENABLE ROW LEVEL SECURITY;

-- Cache tylko do odczytu dla zalogowanych (używany przez backend)
CREATE POLICY "geocoding_cache_select_authenticated" ON public.geocoding_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Wpisy dodawane przez backend z Service Role Key
-- Service Role Key omija RLS

-- ========================================
-- WERYFIKACJA
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

