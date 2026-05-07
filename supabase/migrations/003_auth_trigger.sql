-- ========================================
-- Migracja 003: Trigger tworzenia profilu użytkownika
-- ========================================
-- Data: 2026-01-02
-- Opis: Automatycznie tworzy rekord w public.users po rejestracji
--
-- Wymagania: Najpierw uruchom 002_create_tables.sql
--
-- Jak uruchomić:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Wklej ten skrypt i uruchom (Run)
-- ========================================

-- Funkcja wywoływana po utworzeniu nowego użytkownika w auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, is_paid, created_at)
  VALUES (NEW.id, FALSE, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger wykonujący funkcję po INSERT do auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Weryfikacja
SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

