# Homepage mockup handoff

**Purpose:** Let a new Cursor chat continue homepage mockup-matching without the full prior conversation.  
**Last updated:** 2026-06-05  
**Status:** **Not visually accepted.** Structural sections exist; desktop density and proportions still diverge from the mockup.

---

## 1. Current goal

Match the homepage more closely to:

`Homepage_Mockup/Homepage_Desired_Layout.png`

**Working mode: strict mockup-matching**, especially at **desktop 1440px**.

- Compare mockup vs screenshots with visual evidence before claiming progress.
- Avoid vague “close enough” or “MVP-ready” judgements when the user asks for mockup reproduction.
- Mobile improved in Batches 1–2; **desktop still looks weak** per latest user feedback:
  - too much empty vertical space
  - content feels too small/light on desktop
  - footer feels detached because of blank space above it
  - implementation exists structurally but does not yet reproduce the mockup’s desktop density and proportions

**Out of scope unless separately approved:** `Header.tsx`, listings, Supabase, Stripe, SEO routes, sitemap, robots, migrations, env files.

---

## 2. Files and responsibilities

| File / path | Responsibility |
|-------------|----------------|
| `src/app/[locale]/page.tsx` | Section composition, feature-card overlap (`md:-mt-24` / `lg:-mt-28`), vertical spacing between sections |
| `src/components/home/HomeHero.tsx` | Hero image, gradient overlay, hero text scale/position, hero CTAs |
| `src/components/home/HomeFeatures.tsx` | Feature cards: size, shadow, desktop centered layout, mobile icon-left layout |
| `src/components/home/HomeSellerCta.tsx` | Seller/renter CTA band; mobile text-link, desktop bordered button |
| `src/components/home/HomeFooter.tsx` | Footer layout, columns, tagline, links, social, © |
| `messages/*/home` | Copy only when explicitly needed — do not edit for layout-only batches |
| `Homepage_Mockup/COMPARISON.md` | Tracker/checklist (may be stale; verify against screenshots) |
| `screenshots/home/` | Local QA captures (gitignored) |

**Reference mockup folder:** `Homepage_Mockup/`  
**Local dev URL:** `http://localhost:3008/pl` (default locale `pl`)

**Stack:** Next.js 14 App Router, React, TypeScript, Tailwind, next-intl. Production: Vercel + Supabase.

---

## 3. Screenshot QA workflow

### Scripts (`package.json`)

```bash
npm run screenshot:home:desktop      # 1440×1000, full-page → screenshots/home/home-desktop-1440.png
npm run screenshot:home:mobile:375     # 375×812  → screenshots/home/home-mobile-375.png
npm run screenshot:home:mobile:390     # 390×844  → screenshots/home/home-mobile-390.png
npm run screenshot:home:mobile:414     # 414×896  → screenshots/home/home-mobile-414.png
npm run screenshot:home:all            # all four above
```

### Cursor references

- Mockup: `@Homepage_Mockup/Homepage_Desired_Layout.png`
- Screenshots: `@screenshots/home/home-desktop-1440.png`, `@screenshots/home/home-mobile-375.png`, etc.

### Notes

- `screenshots/` is in `.gitignore` — local QA artifacts only, not committed.
- Playwright runs via `npx` (not a project devDependency). First run may download Chromium (~300MB).
- Screenshots use `http://localhost:3008/pl` — dev server must be healthy first.

---

## 4. Operational lesson: dev server and screenshots

**Do not compare mockup vs screenshots taken from a stale or broken dev server.**

### Symptoms of bad captures

- Blank white PNGs (very small file size, e.g. &lt;10 KB)
- Next.js Server Error overlay (`Cannot find module './vendor-chunks/...'`)
- `curl http://localhost:3008/pl` returns **500**

### Common cause

Running `npm run build` while `next dev` is still running can leave stale `.next` vendor chunks. Subsequent screenshots may be invalid even if the terminal shows `✓ Ready`.

### Recovery procedure

```bash
# 1. Kill stale process on port 3008
lsof -ti:3008 | xargs kill -9

# 2. Clear caches
rm -rf .next node_modules/.cache

# 3. Restart dev server
cd /Users/bm/Desktop/Perfect_Blue
ulimit -n 10240 && npm run dev -- --port 3008

# 4. Confirm homepage before screenshots
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3008/pl
# Must return 200
```

Then run screenshot scripts. **Visually inspect** captures before any mockup comparison — confirm they show the real homepage, not errors or blank pages.

See also: `DEV_SERVER_GUIDE.md`

---

## 5. Good working model

1. **One small batch at a time** — single concern per batch (e.g. desktop hero scale, not hero + cards + footer together).
2. **Investigate first** — read mockup + screenshots + relevant component; report differences with evidence.
3. **Propose smallest change** — name exact files and classes; wait for user approval.
4. **Implement only approved batch** — stay within scoped files.
5. **`npm run build`** — verify TypeScript/build passes.
6. **Restart dev server if needed** — especially after build (see §4).
7. **Regenerate screenshots** — `npm run screenshot:home:all` or targeted script.
8. **Validate screenshot validity** — file sizes reasonable (~300KB+ mobile, ~900KB+ desktop full-page); no error overlays.
9. **Compare again** — mockup vs new screenshots; report what improved and what remains.
10. **Stop for user review** — do not auto-accept or chain batches.

---

## 6. Bad practices to avoid

- Do **not** mark the homepage as accepted just because all sections exist structurally.
- Do **not** use loose “MVP-ready” judgement when the user wants mockup reproduction.
- Do **not** compare invalid screenshots (blank, error overlay, 500 from server).
- Do **not** ignore large empty vertical gaps or weak desktop density.
- Do **not** let mobile improvements imply desktop is done — evaluate **1440px separately**.
- Do **not** do pixel-polish (shadows, 2px tweaks) before fixing major proportions and rhythm.
- Do **not** change `Header.tsx` unless separately approved.
- Do **not** touch listings, Supabase, Stripe, SEO routes, sitemap, robots, migrations, or env files.
- Do **not** commit unless the user explicitly asks.

---

## 7. Current state summary

### Infrastructure added

- Screenshot scripts in `package.json` (see §3).
- `screenshots/` added to `.gitignore`.

### Batch 1 — `HomeHero.tsx` (accepted)

- Mobile hero: centered text and CTAs.
- Desktop: removed/reduced downward `translate-y`; copy sits higher.
- Secondary hero CTA: outline-on-hero (transparent, white border, white text) at all breakpoints.
- **Mobile improved; desktop density still insufficient overall.**

### Batch 2 — `HomeSellerCta.tsx` (accepted)

- Mobile: left-aligned layout; CTA changed from heavy bordered button to blue text-link with arrow.
- Desktop: unchanged — horizontal row, bordered white button on the right.
- `rtl:rotate-180` on arrow for Arabic (`dir` set on `<html>`).

### Known desktop gaps (user feedback, not yet fixed)

- Excess empty vertical space between sections.
- Hero and body content feel **too small/light** relative to mockup at 1440px.
- Large gap before footer; footer feels **detached** from main content.
- Feature card overlap may need depth/size tuning.
- Seller CTA band may need tighter vertical rhythm relative to cards above and footer below.

### `COMPARISON.md` status

Tracker exists but may not reflect latest batches or desktop gaps. Update after the next approved batch, not as a substitute for screenshot comparison.

---

## 8. Recommended next task for new chat

**Title:** Strict desktop mockup comparison and Batch 3 investigation — desktop density / vertical rhythm.

**Prompt to paste:**

> Compare `@Homepage_Mockup/Homepage_Desired_Layout.png` with `@screenshots/home/home-desktop-1440.png` in strict mockup-matching mode. Do not edit code yet. Focus on desktop 1440 only. Report: hero height and text scale, hero text position, feature card size and overlap depth, spacing from feature cards to seller CTA, seller CTA band size/position, empty vertical space before footer, whether footer feels detached. Propose the smallest Batch 3 change and list exact files. Homepage is **not** visually accepted.

### Investigation focus (desktop 1440)

| Area | Questions |
|------|-----------|
| Hero | Is hero tall enough? Are H1/subtitle/description large and heavy enough? Is copy positioned like mockup? |
| Feature cards | Card height/padding/icon size? Overlap depth (~48–56px on md+)? Gap below cards? |
| Seller CTA | Band height, padding, illustration scale? Too much margin above/below? |
| Footer gap | What creates blank space above footer? Section `py-*` on `page.tsx` or components? |
| Overall rhythm | Does the page feel as dense and connected as the mockup desktop panel? |

### Likely files for Batch 3 (investigation only until approved)

- `src/app/[locale]/page.tsx` — section spacing, overlap container
- `src/components/home/HomeHero.tsx` — desktop heights, type scale
- `src/components/home/HomeFeatures.tsx` — card padding, icon size, grid gap
- `src/components/home/HomeSellerCta.tsx` — section/band padding

Do **not** start with `HomeFooter.tsx` unless investigation shows footer markup is the root cause; detached feeling may be excess margin in preceding sections.

---

## 9. Quick reference paths

```
/Users/bm/Desktop/Perfect_Blue/
├── Homepage_Mockup/
│   ├── Homepage_Desired_Layout.png   # reference mockup
│   ├── COMPARISON.md                 # checklist (verify vs screenshots)
│   └── HOMEPAGE_HANDOFF.md           # this file
├── screenshots/home/                 # gitignored QA captures
├── src/app/[locale]/page.tsx
└── src/components/home/
    ├── HomeHero.tsx
    ├── HomeFeatures.tsx
    ├── HomeSellerCta.tsx
    └── HomeFooter.tsx
```

**Related docs:** `ARCHITECTURE.md`, `MOBILE_UX_PLAN.md`, `DEV_SERVER_GUIDE.md`
