-- ========================================
-- Migracja 010: Pola subskrypcji
-- ========================================
-- Data: 2026-01-16
-- Opis: Dodaje pola do obsługi subskrypcji Stripe
-- ========================================

-- Dodaj kolumny subskrypcji do tabeli users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' 
  CHECK (subscription_status IN ('inactive', 'active', 'canceled', 'past_due'));

-- Komentarze
COMMENT ON COLUMN public.users.stripe_customer_id IS 'ID klienta w Stripe';
COMMENT ON COLUMN public.users.stripe_subscription_id IS 'ID aktywnej subskrypcji w Stripe';
COMMENT ON COLUMN public.users.subscription_status IS 'Status subskrypcji: inactive, active, canceled, past_due';

-- Indeks dla szybkiego wyszukiwania po stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users (stripe_customer_id);

-- Weryfikacja
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
