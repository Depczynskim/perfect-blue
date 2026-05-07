-- ========================================
-- Migracja 008: Dane kontaktowe użytkownika
-- ========================================
-- Data: 2026-01-16
-- Opis: Dodaje pola kontaktowe do tabeli users
-- ========================================

-- Dodaj kolumny kontaktowe do tabeli users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Komentarze
COMMENT ON COLUMN public.users.phone IS 'Numer telefonu do kontaktu (wyświetlany po płatności)';
COMMENT ON COLUMN public.users.contact_email IS 'Email kontaktowy (jeśli inny niż email logowania)';

-- Weryfikacja
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
