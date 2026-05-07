-- ============================================================
-- fix_cities_grants.sql
-- Purpose: Diagnose and fix missing SELECT privileges on
--          public.cities for the anon and authenticated roles.
--
-- Usage:
--   Supabase Dashboard → SQL Editor → paste and Run.
--   This file does NOT touch RLS policies.
-- ============================================================


-- ============================================================
-- STEP 1: Diagnostic — current privileges on public.cities
-- ============================================================
-- Run this first to see what is already granted.
-- If no rows appear for anon/authenticated, the GRANT is missing.

SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name   = 'cities'
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;


-- ============================================================
-- STEP 2: Grant USAGE on schema public (safe no-op if exists)
-- ============================================================
-- PostgREST requires USAGE on the schema in addition to table
-- privileges.  GRANT is idempotent — safe to run multiple times.

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;


-- ============================================================
-- STEP 3: Grant SELECT on public.cities
-- ============================================================

GRANT SELECT ON public.cities TO anon;
GRANT SELECT ON public.cities TO authenticated;


-- ============================================================
-- STEP 4: Verify — privileges after the grants
-- ============================================================

SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name   = 'cities'
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;


-- ============================================================
-- STEP 5: Confirm anon can actually SELECT through RLS
-- ============================================================
-- This impersonates the anon role and runs the same query the
-- frontend uses.  Expected: rows with status = 'approved'.
-- If it returns 0 rows, re-check the RLS policy.
-- If it throws "permission denied", STEP 3 did not take effect.

SET LOCAL ROLE anon;

SELECT id, name, comarca, status
FROM public.cities
WHERE status = 'approved'
ORDER BY name
LIMIT 10;

RESET ROLE;


-- ============================================================
-- STEP 6: Count sanity-check as anon
-- ============================================================

SET LOCAL ROLE anon;

SELECT COUNT(*) AS approved_visible_to_anon
FROM public.cities
WHERE status = 'approved';

RESET ROLE;
