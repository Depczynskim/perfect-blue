-- ========================================
-- Migracja 009: Polityka INSERT dla payments
-- ========================================
-- Data: 2026-01-16
-- Opis: Pozwala użytkownikom tworzyć płatności dla siebie
-- ========================================

-- Użytkownik może tworzyć płatności tylko dla siebie
CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = payer_user_id);

-- Weryfikacja
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'payments';
