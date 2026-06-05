# MOBILE_UX_PLAN.md

## Purpose

Perfect Blue is deployed to production (`https://perfectblue.es`). Mobile UX improvements will be handled **view by view**, not as a single app-wide redesign.

Where useful, validate on real devices against the live production site (and locally during development). Each view gets investigation first, then small approved implementation batches, with progress recorded in this document.

This plan complements `ARCHITECTURE.md` (stack, structure, deployment). If this document conflicts with code, **trust the code**.

---

## Working principles

* Work on **one view at a time**.
* **Investigation first**, implementation second.
* **No broad refactors** and no whole-app redesign in one pass.
* **Preserve desktop behaviour** unless a responsive issue requires an intentional adjustment.
* Keep changes **small and easy to review**.
* Follow the existing architecture from `ARCHITECTURE.md` (`src/app/[locale]/`, `src/components/{domain}/`, `src/lib/{domain}/`, Tailwind).
* **Trust code over docs.**
* Do **not** introduce new top-level folders under `src/`.
* Use the existing component / lib / app structure.
* Prefer **Tailwind responsive classes** and existing design patterns over new layout systems.
* Check **all affected locales** (`pl`, `en`, `es`, `de`, `ar`) where layout or copy length may change.
* Pay special attention to: long text, forms, buttons, image sizing, filters, and touch targets (≈44px minimum where practical).
* For **RTL Arabic (`ar`)**, note issues where relevant on the current view; do not fix RTL globally unless that view is in scope.

**Out of scope for mobile UX passes unless explicitly requested:** Supabase migrations, Stripe, auth provider config, messaging subscription env, SEO/metadata strategy, deployment/DNS/Vercel env.

---

## Mobile QA workflow

1. **Select one view** from the view order below.
2. **Cursor performs investigation only** (read code, infer responsive behaviour; optional production check on phone).
3. **Cursor reports:**
   * Relevant files / components
   * Current responsive behaviour
   * Mobile UX issues
   * Desktop regression risk
   * Proposed fix order (smallest, highest-impact first)
4. **User approves** the first small batch of changes.
5. **Cursor implements** only the approved batch.
6. Run **TypeScript check** if appropriate (`npm run build` or project typecheck script).
7. **Test** locally and on production / mobile after deployment.
8. **Update this document:** progress tracker, notes, decision log.

---

## View order

Initial proposed order (highest user impact first):

| # | View | Route |
|---|------|--------|
| 1 | Listings index | `/[locale]/listings` |
| 2 | Listing detail | `/[locale]/listings/[id]` |
| 3 | Add listing | `/[locale]/listings/new` |
| 4 | Edit listing | `/[locale]/listings/[id]/edit` |
| 5 | Messages list | `/[locale]/messages` |
| 6 | Message thread | `/[locale]/messages/[odbiorca]/[listing]` |
| 7 | Profile / My account | `/[locale]/profile` |
| 8 | Auth | `/[locale]/auth/login`, `/[locale]/auth/register` (+ password reset UI if present) |
| 9 | Header / navigation / language selector | Shared: `src/components/layout/` |
| 10 | Home | `/[locale]/` |

---

## Per-view checklist

Use for every view before marking implementation complete:

* [ ] Layout fits **320px, 375px, 390px, 414px** widths.
* [ ] No horizontal overflow / stray wide elements.
* [ ] Main CTA is easy to find.
* [ ] Buttons and links are comfortable **touch targets**.
* [ ] Forms are usable with **mobile keyboard** (types, focus, scroll).
* [ ] Inputs have enough spacing.
* [ ] Cards are readable.
* [ ] Images crop / scale correctly.
* [ ] Filters are usable on small screens.
* [ ] Empty / loading / error states are readable.
* [ ] Long text does not break layout.
* [ ] Sticky / fixed elements do not cover content.
* [ ] Locale strings do not overflow (spot-check **pl, en, es, de, ar**).
* [ ] Arabic / RTL issues noted if visible (fix only if this view is in scope).
* [ ] Desktop layout unchanged or **intentionally** adjusted (document in decision log).

---

## Progress tracker

| View | Status | Investigation date | Implementation date | Notes | Follow-up needed |
|------|--------|----------------------|---------------------|-------|------------------|
| Listings index (`/[locale]/listings`) | Done | 2026-05-29 | 2026-05-30 | Mobile 2×2 filters; card/city/empty-state Batch 1; **card map preview tap on location row** (Batch 2) | Listing titles on cards; loading/error UI; optional mobile label copy polish |
| Listing detail (`/[locale]/listings/[id]`) | In progress | 2026-05-30 | 2026-05-31 | Batches 1–5 shipped (compact line, hierarchy, action card, freshness line, **fixed contact bar + map layering**); builds passed; pushed `a0d21b8` | Manual QA; gallery; description/map padding |
| Add listing (`/[locale]/listings/new`) | Not started | | | | |
| Edit listing (`/[locale]/listings/[id]/edit`) | Not started | | | | |
| Messages list (`/[locale]/messages`) | Not started | | | | |
| Message thread (`/[locale]/messages/[odbiorca]/[listing]`) | Not started | | | | |
| Profile (`/[locale]/profile`) | Not started | | | | |
| Auth (login / register) | Not started | | | | |
| Header / nav / language selector | Done | 2026-05-28 | 2026-05-28 | Hamburger + panel below `lg`; language selector stays in top bar; desktop inline nav at `lg+` | LanguageSelector dropdown RTL (`end-0`) optional follow-up |
| Home (`/[locale]/`) | In progress | 2026-06-02 | 2026-06-04 | Mockup-driven redesign: photo hero, feature cards, seller CTA, white footer; overlap on `md+` only; see `Homepage_Mockup/COMPARISON.md` | Manual mobile QA (320–414px); mockup gaps: centered hero on mobile, seller CTA below fold check |

**Status values:** `Not started` · `Investigation done` · `In progress` · `Done` · `Blocked`

### Completed mobile pass summary (2026-05-28 – 2026-05-31)

**Header / navigation**

* Mobile hamburger menu below `lg` (1024px) with accessible panel (backdrop, Escape, link navigation).
* Language selector remains in the top bar only (not duplicated in the menu).
* Desktop inline navigation preserved unchanged at `lg+`.

**Listings index**

* Transaction filters: mobile **2×2 grid** with four direct short-label links (All, long rent, short rent, sale); URL-only active state; desktop four-option row unchanged at `md+`.
* **Batch 1 usability:** `min-h-11` filter chips; card price `break-words`; photo arrows visible on mobile; city clear button touch target + logical spacing; empty-state padding.
* **Batch 2 map preview:** On touch/coarse-pointer devices, tap full location row opens map overlay; dismiss via overlay tap, tap outside card, or Escape; desktop pin-hover unchanged; `ListingMap` `interactive={false}` in preview only.

**Listing detail**

* Mobile compact facts line replaces 2×2 property tiles below `lg`; desktop four-tile grid unchanged.
* Mobile order: gallery → H1 → Added on → action card (price → facts; owner edit only) → description → map; **fixed bottom contact bar** for non-owners.
* Action card: centered `text-3xl` price; rent price labels hidden on mobile; stronger centered facts line; **no inline ContactButton** for non-owners (single CTA in fixed bar).
* **`ListingDetailContact`:** one `ContactButton` mount via `useSyncExternalStore` — `placement="mobile-fixed"` (fixed bar, `variant="plain"`) or `placement="desktop-sidebar"` (default variant); owner view has no fixed bar.
* Fixed bar: opaque white, `z-50`, safe-area bottom padding, `max-h-[70vh] overflow-y-auto` for expanded message form; page `pb-28 lg:pb-0` so map/content scroll above bar.
* **Map layering:** listing-detail map wrapper (`listing-detail-map relative z-0 isolate`); scoped Leaflet z-index caps in `globals.css` so tiles/controls stay below fixed bar; header menu (`z-[60]`) and lightbox (`z-[2000]`) unchanged.
* “Added on” freshness line under H1 on mobile; bottom added-date card removed; desktop sticky sidebar and property tiles preserved.

### Home implementation summary (2026-06-02 – 2026-06-04)

**Reference mockup:** `Homepage_Mockup/Homepage_Desired_Layout.png` · **Tracker:** `Homepage_Mockup/COMPARISON.md`

**Workflow used:** small batches → `npm run build` → stop → user screenshots vs mockup (Agent does not see live browser).

**Components (new / refactored):**

* `src/components/home/HomeHero.tsx` — full-width photo hero (`next/image`, mobile + desktop WebP), gradient overlay, `max-w-7xl` content grid
* `src/components/home/HomeFeatures.tsx` — three feature cards; **mobile:** icon left + text right (`flex-row`); **desktop (`md+`):** centered stack
* `src/components/home/HomeSellerCta.tsx` — seller/renter band → `/{locale}/listings/new`
* `src/components/home/HomeFooter.tsx` — white footer, tagline, link row, social icons, centered ©
* `src/app/[locale]/page.tsx` — composes sections; feature overlap via inner container `md:-mt-24 lg:-mt-28` (no section bg in overlap zone)

**Mobile-relevant behaviour (code):**

* Hero heights: `h-[420px]` → `sm:h-[440px]`; desktop taller at `md+`; separate mobile hero image (`public/images/home-hero-blue-coast-mobile.webp`)
* Hero CTAs: full-width stacked below `md`, `min-h-11`; side-by-side from `md+`
* Feature cards: **no** negative overlap on mobile (`pt-6` / `sm:pt-8` only)
* `main` has `overflow-x-hidden`
* Copy: `messages/*/home` (5 locales)

**Intentionally unchanged:**

* `Header.tsx` (mockup shows different nav / EN pill — deferred)
* Listing routes, Supabase, Stripe, SEO routes

**Screenshot review notes (2026-06-04, iPhone SE ~375px):**

* Hero readable; CTAs stacked; hamburger header OK
* Feature cards stack vertically; icon-left layout in code — verify on device after refresh
* Seller CTA band may sit below fold — scroll QA needed
* Footer: white bg aligned with mockup (was dark, corrected)

---

## Decision log

| Date | View | Decision | Reason |
|------|------|----------|--------|
| 2026-05-28 | Header / nav / language selector | Mobile hamburger menu below `lg` (1024px); inline desktop nav unchanged at `lg+` | Fixes 375–414px crowding without changing desktop layout; safest breakpoint per investigation |
| 2026-05-28 | Listings index (`/[locale]/listings`) | Mobile transaction filters: two-level All / Rent / Sale with Long-term / Short-term sub-row | Avoids horizontal scrolling and clarifies rent types; desktop keeps four-option row at `md+` |
| 2026-05-29 | Listings index (`/[locale]/listings`) | Batch 1: `min-h-11` chips; card price wrap; mobile photo arrows; city clear touch/RTL spacing; empty-state padding | Mobile usability without listing titles or loading/error UI |
| 2026-05-29 | Listings index (`/[locale]/listings`) | `rentExploring` suppresses All/Sale active styling while Rent submenu open; `closeRentSubmenu` on All/Sale click | Fixes confusing dual-primary highlight and stale active state after choosing All/Sale |
| 2026-05-29 | Listings index (`/[locale]/listings`) | Replaced two-level mobile Rent filter with four direct short-label links in a 2×2 grid | URL state + local `rentExpanded` caused unstable UX; Option D audit recommendation |
| 2026-05-30 | Listings index (`/[locale]/listings`) | Batch 2: mobile tap on full location row opens card map preview; overlay tap/outside/Escape dismiss; desktop hover on pin unchanged | Touch devices had no hover path; div+click handler inside Link (no nested button); `pointer-events-auto` on touch overlay blocks accidental navigation |
| 2026-05-30 | Listing detail (`/[locale]/listings/[id]`) | Batch 1: below `lg`, replace 2×2 property summary tiles with compact metadata line (`House · 150 m² · 5 rooms · …`); desktop four-tile grid unchanged via `hidden lg:grid` | Reduces vertical bulk on mobile/tablet; mirrors listing card details line; reuses `listings.card` plural keys; no new translations |
| 2026-05-30 | Listing detail (`/[locale]/listings/[id]`) | Batch 2: mobile action card after H1 (price → compact line → CTA); `hidden lg:block` desktop sidebar; desktop-only property tiles; mobile added date after map; smaller H1 (`text-2xl lg:text-3xl`) | Fixes mobile hierarchy so price/contact appear before description/map; desktop sticky sidebar and tiles unchanged |
| 2026-05-30 | Listing detail (`/[locale]/listings/[id]`) | Batch 3: mobile action card refinement — centered `text-3xl` price; hide rent price labels on mobile; stronger facts line; `ContactButton variant="plain"` (no inner bordered card); lighter owner banner | Removes card-in-card feel; desktop sidebar ContactButton default unchanged |
| 2026-05-30 | Listing detail (`/[locale]/listings/[id]`) | Batch 4: mobile “Added on” moved under H1 as subtle freshness line; removed bottom mobile added-date card; desktop sidebar unchanged | Surfaces listing freshness early without competing with price/CTA |
| 2026-05-31 | Listing detail (`/[locale]/listings/[id]`) | Batch 5: `ListingDetailContact` — single `ContactButton` mount; fixed bottom bar on mobile for non-owners; inline CTA removed from action card; `pb-28 lg:pb-0` | Eliminates duplicate “Write message” CTAs; contact state stays in one component instance |
| 2026-05-31 | Listing detail (`/[locale]/listings/[id]`) | Batch 5 (layering): `.listing-detail-map` + scoped Leaflet z-index caps; fixed bar `z-50` | Prevents Leaflet panes/controls (default z-index 400–1000) from painting over the fixed contact bar while scrolling |
| 2026-06-04 | Home (`/[locale]/`) | Mockup-driven homepage redesign in small batches; user screenshot verification after each batch | Align live home with `Homepage_Mockup/Homepage_Desired_Layout.png` without Header / backend / SEO changes |
| 2026-06-04 | Home (`/[locale]/`) | Photo hero via `HomeHero` + local WebP (`public/images/home-hero-blue-coast-*.webp`); `next/image` with `priority` | Mediterranean brand hero; LCP-friendly static assets |
| 2026-06-04 | Home (`/[locale]/`) | Feature-card overlap on `md+` only: inner container `md:-mt-24 lg:-mt-28`; transparent overlap zone (no `bg-slate-50` on pull-up section) | Match mockup “floating” cards on hero image; avoid grey band over sea/sky |
| 2026-06-04 | Home (`/[locale]/`) | Hero + feature + footer content in shared `max-w-7xl px-4 sm:px-6 lg:px-8` grid | Align with header logo column; fix text hugging viewport edge on desktop |
| 2026-06-04 | Home (`/[locale]/`) | Footer: white background, dark text, © under center link row (`HomeFooter.tsx`) | Match mockup; replaces interim dark footer |
| 2026-06-04 | Home (`/[locale]/`) | Header unchanged; mockup centered nav / EN pill deferred | Prior scope constraint; separate pass if approved |

---

## Current first task

### Primary: Home mobile QA (`/[locale]/`)

**Status:** In progress — implementation shipped **2026-06-04**; per-view checklist **not** complete.

**Next step:** Manual QA on production/local at **320, 375, 390, 414** px (and spot-check `ar` RTL):

* Hero: mobile image crop, text readability, stacked CTAs (`min-h-11`), no horizontal overflow
* Feature cards: icon-left + text on mobile; no overlap cramming; long locale strings (`de`, `pl`, `ar`)
* Seller CTA: visible after scroll; button tappable; layout on narrow width
* Footer: white bg, three-column / stacked mobile, link row readable
* Desktop `md+`: card overlap on hero, grid alignment — regression check only

**Entry points:**

* `src/app/[locale]/page.tsx`
* `src/components/home/` — `HomeHero`, `HomeFeatures`, `HomeSellerCta`, `HomeFooter`
* `messages/*/home`
* `Homepage_Mockup/Homepage_Desired_Layout.png`
* `Homepage_Mockup/COMPARISON.md`

Mark Home **Done** only after per-view checklist above passes (or document intentional mockup deviations).

### Also open: Listing detail manual QA

**`/[locale]/listings/[id]`** — **In progress** (batches 1–5 shipped; manual QA still pending from 2026-05-31).

* Gallery, description/map padding follow-ups before **Done**
* After listing detail **Done** → **`/[locale]/listings/new`** (investigation only)

**Listing detail entry points:** `src/app/[locale]/listings/[id]/page.tsx`, `ListingDetailContact.tsx`, `globals.css` (`.listing-detail-map`), `messages/*/listingDetail`
