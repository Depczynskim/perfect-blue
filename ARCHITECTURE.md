# ARCHITECTURE.md

**Purpose**: AI assistant startup context for working on this repository.
**Last updated**: 2026-05-07

**Source of truth hierarchy**:
1. Code in `src/`, `supabase/migrations/`, `scripts/`, `package.json`
2. `Road_Map.md` (planning/intentions), `PROGRESS.md` (historical log)
3. This file (technical snapshot)

**If documents conflict with code, trust the code.**

This file is for AI context, not human documentation.

---

## Project
Real estate listing portal for Catalonia region. Users post property listings for free; contacting listing owners happens via in-app messaging, and sending messages (for non-owners) requires a €5/month subscription via Stripe.

## Stack
- **Runtime**: Next.js 14 (App Router), React 18, TypeScript 5
- **Database**: Supabase (PostgreSQL + PostGIS for geospatial queries)
- **Storage**: Supabase Storage (`listing-photos` bucket)
- **Payments**: Stripe (subscriptions + webhooks)
- **i18n**: next-intl (5 locales: pl, en, es, ar, de)
- **Maps**: Leaflet + react-leaflet
- **Geocoding**: LocationIQ API (optional, with daily limit + cache)
- **Styling**: Tailwind CSS

## Business domains

### Listings
Property advertisements with location, price, category, photos.
- **Code**: `src/app/[locale]/listings/**`, `src/lib/listings/`, `src/components/listings/`
- **API**: `/api/listings`, `/api/listings/[id]`, `/api/listings/[id]/photos`
- **Tables**: `listings`, `listing_photos`
- **Migrations**: 002, 005, 007, 011, 012, 014
- **Dependencies**: Auth (owner_id), Cities (city_id), Storage (photos)

### Cities
Canonical list of municipalities (947 Catalonia municipalities from INE dataset).
- **Code**: `src/components/listings/CityCombobox.tsx`, `src/components/listings/CreateListingForm.tsx`
- **Scripts**: `scripts/import-cities.mjs`, `scripts/backfill-city.mjs`
- **Tables**: `cities`
- **Migrations**: 013, 014
- **RPC**: `create_pending_city()`, `get_active_listing_city_counts()`
- **Dependencies**: None (foundational)

### Auth
User authentication and profile management via Supabase Auth.
- **Code**: `src/app/[locale]/auth/**`, `src/components/auth/`, `src/lib/api/auth.ts`
- **Tables**: `users` (extends `auth.users`)
- **Migrations**: 002, 003 (trigger), 008 (legacy contact fields), 010 (subscription fields)
- **Dependencies**: None (foundational)

### Subscriptions
Monthly premium access (€5/month) for unlimited messaging.
- **Code**: `src/app/api/payments/**`, `src/app/api/webhooks/stripe/**`, `src/lib/stripe/`, `src/lib/api/subscription.ts`
- **Tables**: `users.is_paid`, `users.stripe_customer_id`, `users.stripe_subscription_id`, `users.subscription_status`
- **Migrations**: 010
- **Dependencies**: Auth (user_id)

### Messages
Conversation threads between users about specific listings.
- **Code**: `src/app/[locale]/messages/**`, `src/app/api/messages/**`, `src/components/listings/ContactButton.tsx`
- **Tables**: `messages`
- **Migrations**: 002, 004
- **Dependencies**: Auth (from_user_id, to_user_id), Listings (listing_id), Subscriptions (requires is_paid for non-owners)
- **Note**: current contact model is message-only (no phone/contact_email exposure in listing detail UI)

### Geocoding
Address-to-coordinates conversion with caching to reduce API costs.
- **Code**: `src/app/api/geocode/**`, `src/hooks/useGeocoding.ts`
- **Tables**: `geocoding_cache`
- **Migrations**: 002
- **Dependencies**: None (infrastructure)

### Image Processing
Client-side WebP conversion, resize, compression (display: 1600x1200, thumb: 600x450).
- **Code**: `src/lib/image/`, `src/components/listings/PhotoUpload.tsx`
- **Storage**: Supabase Storage bucket `listing-photos` (structure: `{user_id}/{uuid}_display.webp`, `{user_id}/{uuid}_thumb.webp`)
- **Migrations**: 005, 006, 007
- **Dependencies**: Auth (user_id for storage paths), Listings (listing_id)

## `src/` structure

### `src/app/`
Next.js App Router pages and API routes.
- **`[locale]/`**: i18n-aware pages (home, listings, messages, auth, profile)
- **`api/`**: REST endpoints (listings, messages, payments, webhooks, geocode)
- **Should contain**: route handlers, page components, layout components
- **Should NOT contain**: business logic (move to `lib/`), reusable components (move to `components/`)
- **Type**: Next.js infrastructure

### `src/components/`
Reusable React components organized by domain.
- **`auth/`**: LoginForm, RegisterForm, LogoutButton
- **`layout/`**: Header, LanguageSelector
- **`listings/`**: CreateListingForm, PhotoUpload, LocationPicker, ListingGrid, ContactButton, etc.
- **Should contain**: presentational and interactive UI components
- **Should NOT contain**: API calls (use `lib/` utilities), direct DB queries
- **Type**: Shared UI code

### `src/lib/`
Business logic, utilities, and infrastructure organized by domain.
- **`api/`**: auth helpers, error classes, subscription checks
- **`supabase/`**: client factories (server/browser), types, middleware
- **`listings/`**: queries, normalization, location formatting
- **`stripe/`**: Stripe client singleton, config
- **`image/`**: client-side image processing (WebP, resize, compress)
- **`map/`**: location parsing (WKB/WKT/GeoJSON), icon utilities
- **`format/`**: price/date formatting with i18n
- **Should contain**: domain logic, data access, utilities
- **Should NOT contain**: React components
- **Type**: Domain + infrastructure code

### `src/hooks/`
React custom hooks.
- **`useGeocoding.ts`**: geocoding state management
- **Should contain**: reusable stateful logic for client components
- **Type**: Shared client-side code

### `src/middleware.ts`
Next.js middleware for i18n routing and Supabase session refresh.
- **Type**: Infrastructure

### `src/i18n.ts`
next-intl configuration (locales, locale names, message loading).
- **Type**: Infrastructure

## Working mode

**Consistency over reorganization**:
- Prefer consistency with current `src/components/`, `src/lib/`, `src/app/` structure
- Do NOT reorganize folders or introduce new top-level directories without explicit instruction
- Do NOT move files between folders unless there is a clear, stated reason
- Follow existing patterns: components by domain, lib utilities by domain, API routes by resource

**Current structure is component/lib based, not feature-based**:
- Components live in `src/components/{domain}/`
- Business logic lives in `src/lib/{domain}/`
- This may change in the future, but until instructed otherwise, maintain current layout

## Rules

### Code placement
- **New pages**: `src/app/[locale]/{domain}/page.tsx`
- **New API routes**: `src/app/api/{domain}/route.ts`
- **New components**: `src/components/{domain}/ComponentName.tsx` (use PascalCase)
- **New business logic**: `src/lib/{domain}/` (use kebab-case for files)
- **Database queries**: `src/lib/{domain}/queries.ts`
- **Types**: `src/lib/{domain}/types.ts` or `src/lib/supabase/types.ts` for DB types
- **Do NOT**: create new top-level folders in `src/` without explicit instruction

### Naming patterns (follow existing conventions)
- **Components**: PascalCase (e.g., `CreateListingForm.tsx`)
- **Lib files**: kebab-case (e.g., `normalization.ts`)
- **API routes**: `route.ts` (Next.js convention)
- **DB tables**: snake_case (e.g., `listing_photos`)
- **DB columns**: snake_case (e.g., `owner_id`, `is_paid`)
- **TypeScript types**: PascalCase (e.g., `ListingCategory`)
- **Consistency**: match existing file naming in the same folder

### Shared vs domain-specific
- **Shared**: `src/lib/supabase/`, `src/lib/api/`, `src/lib/format/`, `src/components/layout/`
- **Domain-specific**: `src/lib/listings/`, `src/components/listings/`, `src/lib/stripe/`

### Sensitive areas (do not change without clear reason)
- **`src/middleware.ts`**: i18n + Supabase session refresh order matters
- **`supabase/migrations/`**: immutable history; always create new migrations, never edit existing
- **`src/lib/supabase/middleware.ts`**: session token refresh logic
- **`src/app/api/webhooks/stripe/route.ts`**: uses service role key, bypasses RLS
- **`scripts/import-cities.mjs`**: slug collision logic, INE code handling
- **RLS policies**: defined in migrations; changes require new migrations, not edits
- **Folder structure**: do not move files between `src/components/`, `src/lib/`, `src/app/` without instruction

### Database conventions
- **Geography**: Use PostGIS `GEOGRAPHY(Point, 4326)` type; insert as WKT `POINT(lng lat)`
- **RLS**: All tables have RLS enabled; service role key bypasses RLS (webhooks, scripts)
- **Timestamps**: Use `TIMESTAMPTZ` with `DEFAULT NOW()`
- **Foreign keys**: Use `ON DELETE CASCADE` for owned entities, `ON DELETE RESTRICT` for references

### Image handling
- **Client-side processing**: Always generate both `display` and `thumb` versions before upload
- **Storage paths**: `{user_id}/{uuid}_display.webp` and `{user_id}/{uuid}_thumb.webp`
- **DB columns**: `display_path`, `display_url`, `thumb_path`, `thumb_url` (not `storage_path`, `public_url` - deprecated)

## Domain dependencies

```
Auth (foundational)
  ↓
  ├─→ Subscriptions (extends users table)
  ├─→ Listings (owner_id)
  └─→ Image Processing (storage paths)

Cities (foundational)
  ↓
  └─→ Listings (city_id, filtering)

Listings
  ↓
  ├─→ Messages (listing_id)
  └─→ Image Processing (listing_id)

Subscriptions
  ↓
  └─→ Messages (requires is_paid for non-owners)

Geocoding (independent infrastructure)
```

## Current architecture vs future changes

**Current structure**: component/lib based (components by domain in `src/components/`, logic by domain in `src/lib/`).

**Possible future**: feature-based structure (each feature in its own folder with components + logic + API).

**Until explicitly instructed otherwise**: maintain current component/lib structure. Do not reorganize.

## Current project status

### Implemented (verified in code)
- User registration/login (Supabase Auth + email confirmation)
- Listing CRUD (create, read, update, delete with RLS)
- Photo upload (dual versions: display + thumb, Supabase Storage)
- City filtering (947 Catalonia municipalities, approved + pending statuses)
- Category filtering (long_term_rent, short_term_rent, sale)
- Map-based location selection (Leaflet)
- Geocoding with cache (LocationIQ, optional)
- Messaging between users (conversation threads per listing)
- Stripe subscription (€5/month, checkout + webhooks)
- Subscription-gated messaging (non-owners need is_paid=true)
- i18n (5 locales: pl, en, es, ar, de)
- Profile management (`display_name`, `preferred_locale`, login email read-only)
- Login redirect prefers `users.preferred_locale` when available

### Partial (code exists but incomplete)
- City backfill script exists but unclear if run in production
- Payments table exists but no UI for payment history
- contacts_access table exists but unused (subscription model replaced pay-per-contact)

### Planned (mentioned in migrations/docs but no code)
- None identified

### Unclear from code
- Whether LocationIQ is enabled in production (env var `LOCATIONIQ_ENABLED`)
- Whether city import script has been executed (947 cities expected)
- Whether Stripe webhook is configured in production

## AI working notes

### Files to read first
1. `src/lib/supabase/types.ts` - DB schema types
2. `src/middleware.ts` - i18n + auth session flow
3. `src/app/[locale]/listings/page.tsx` - main listing flow
4. `supabase/migrations/002_create_tables.sql` - core schema
5. `supabase/migrations/004_rls_policies.sql` - security model

### Folders that matter most
- `src/lib/listings/` - core domain logic
- `src/app/api/` - backend endpoints
- `supabase/migrations/` - schema source of truth
- `src/components/listings/` - main UI surface area

### Document roles
- **`Road_Map.md`**: planning, intentions, future features
- **`PROGRESS.md`**: historical log of changes and decisions
- **`ARCHITECTURE.md`**: current technical state (this file)
- **Code**: always the source of truth
- **Rule**: if documents conflict with code, trust code

### Key patterns
- All DB queries use RLS; service role key only in webhooks and scripts
- Client components use `createBrowserClient()`, server components use `createServerClient()`
- Images always processed client-side before upload (display + thumb)
- Cities have `approved` (visible) vs `pending` (user-submitted) status
- Subscription check: `users.is_paid` (boolean), not `contacts_access` table

## Modification policy

- Do not refactor architecture unless explicitly requested
- Do not move files between folders without instruction
- Do not introduce new folder structures
- Prefer small changes over structural changes
- Stability over ideal architecture

## AI workflow

When working on a feature:

1. Read ARCHITECTURE.md first
2. Read only relevant domain files
3. Avoid scanning entire repository unless necessary
4. Follow existing patterns in src/components, src/lib, src/app
