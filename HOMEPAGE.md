# Perfect Blue — Simplified Search & SEO Strategy

**Document purpose:** Strategic and implementation context for the next Perfect Blue homepage, listings-flow and SEO decisions.  
**Status:** Working strategy for MVP / early inventory growth.  
**Last updated:** 2026-06-02.  

---

## 1. Executive summary

Perfect Blue should not try to look like a large property portal before it has large-portal inventory.

The current MVP should stay simple, honest and conversion-focused:

- **Homepage:** clear positioning + two main CTAs.
- **Browse Listings page:** actual search/filter experience.
- **Map:** not on homepage in MVP.
- **Regions:** not on homepage in MVP.
- **SEO:** inventory-aware; do not publish thin city/zone/coast pages too early.
- **Languages:** all supported locales are first-class product paths.

The simplified direction is:

> **Perfect Blue helps users browse active property listings in Catalonia, without language barriers, from owners and agencies who are encouraged to respond.**

The homepage should explain this clearly and send users either to:

1. **Browse Listings** — for buyers/renters/searchers.
2. **Add Listing** — for owners/agencies.

The search bar should remain primarily on the **Listings / Browse Listings** page, where users already have active intent and where filters can be supported by real inventory.

---

## 2. Core product decision

### Previous idea

A search-first homepage with a large search bar, map preview, region discovery and later map-based exploration.

### Revised MVP decision

The homepage should be **CTA-led and positioning-led**, not search-input-led.

This means:

- No large homepage search bar in MVP.
- No map on homepage in MVP.
- No clickable region map in MVP.
- No broad regional discovery until inventory is much larger.
- The existing **Browse Listings** flow remains the primary place for search/filter controls.

### Reason

Perfect Blue is starting from a low-inventory position. Showing a map, regions or many landing-page choices too early risks communicating weakness:

- empty areas,
- low result counts,
- thin pages,
- false promise of broad coverage.

The MVP should instead communicate honesty and clarity:

> Here are the active places where we currently have listings. Browse them directly.

---

## 3. Homepage strategy

### Homepage role

The homepage is not the full search interface.

Its role is to:

1. Explain what Perfect Blue is.
2. Signal the product differentiator.
3. Build trust.
4. Send searchers to Browse Listings.
5. Send owners/agencies to Add Listing.

### Homepage should communicate

- Active property listings.
- Catalonia focus.
- Multilingual access.
- Simple browsing.
- Free listing creation.
- Responsive communication as a product value, without overpromising a mature response score too early.

### Homepage should avoid

- Leading with map search.
- Leading with payment/security claims while Stripe/subscriptions are not active in production.
- Looking like a large portal with full regional coverage before inventory supports it.
- Too many filters before the user reaches the listings page.

---

## 4. Recommended homepage structure for MVP

### Hero

Keep the current simple hero structure:

- large headline,
- short subheadline,
- primary CTA,
- secondary CTA.

Do **not** add a homepage search input in the first iteration.

### Suggested hero copy direction

#### Option A — clear and direct

**Headline:**

> Find active properties in Catalonia

**Subheadline:**

> Browse live property listings from owners and agencies. Simple search, multilingual access and clear communication.

#### Option B — closer to current brand line

**Headline:**

> Find your perfect place in Catalonia

**Subheadline:**

> Browse active property listings and connect with owners or agencies without language barriers.

#### Option C — stronger trust angle

**Headline:**

> Active property listings in Catalonia

**Subheadline:**

> A simple multilingual portal focused on live listings, clear communication and responsive owners.

### CTA hierarchy

Primary CTA:

> Browse Listings

Secondary CTA:

> Add Listing

Rationale:

- Most visitors will be searchers.
- Owners/agencies still need a visible path.
- The current two-CTA structure is good and should be preserved.

---

## 5. Homepage benefit cards

The current benefit cards should be refreshed to match the MVP reality.

### Current direction to avoid

- **Map Search** — not the core MVP homepage promise.
- **Secure Payments** — not ideal while Stripe/subscriptions are deferred in production.
- Generic claims that could fit any portal.

### Recommended benefit cards

#### Card 1 — Active Listings

**Title:**

> Active Listings

**Body:**

> Browse property listings that are live and easy to explore.

#### Card 2 — Multilingual Access

**Title:**

> Multilingual Access

**Body:**

> Use Perfect Blue in your preferred language and translate listing descriptions when needed.

#### Card 3 — Free to List

**Title:**

> Free to List

**Body:**

> Owners and agencies can add property listings for free during the MVP phase.

### Alternative trust card

If the product wants to emphasise responsiveness more strongly:

**Title:**

> Clear Communication

**Body:**

> Contact owners and agencies directly through the platform.

Use this instead of, or later alongside, **Free to List** depending on homepage audience balance.

---

## 6. Browse Listings strategy

The Browse Listings page is where search controls belong in the MVP.

The current pattern is correct:

- transaction filters,
- city/municipality search,
- active city suggestions,
- listing count,
- active inventory shown honestly.

### Why this works for low inventory

It does not pretend the portal has full regional coverage.

It shows users where listings actually exist:

- active city suggestions,
- counts per city,
- filtered result set,
- direct path to available properties.

This is better than homepage maps or broad region links when the portal is still growing.

### Recommended Browse Listings principle

> During early inventory growth, Perfect Blue should prioritise honest search entry over broad geographic discovery. The Browse Listings page should guide users to active inventory through transaction filters, city search and active-location suggestions.

---

## 7. Map strategy

### MVP decision

No map on the homepage.

No homepage map preview.

No clickable region map in MVP.

### Why

A map is only valuable when it has enough data to communicate coverage and choice.

With low inventory, a map risks showing:

- too few points,
- empty regions,
- weak coverage,
- a product that feels smaller than it is.

### Future map stage

Map-based discovery can return later when inventory is stronger.

Potential future stages:

1. **Listings page map mode** — list + map view.
2. **Clusters** — when many listings appear in the same areas.
3. **Search this area** — after pan/zoom.
4. **Clickable regions** — only after strong regional coverage.
5. **Draw area / multi-area search** — later advanced search feature.

### Inventory threshold for region maps

Clickable regions should wait until there are at least **several hundred active listings** and meaningful distribution across multiple areas.

Before that, region maps would create weak or empty experiences.

---

## 8. Region strategy

### MVP decision

No region-based homepage discovery.

Do not add large region modules such as:

- Costa Brava,
- Costa Daurada,
- Barcelona Province,
- Tarragona region,
- Girona region,
- Lleida region,
- map-based regional selection.

### Reason

At low inventory, region discovery creates an expectation that each region has meaningful results.

If users click a region and find zero or a handful of listings, trust drops.

### Future condition

Region modules can be considered when:

- inventory is large enough,
- multiple regions have stable active listings,
- there is enough demand to justify regional navigation,
- region pages will not be thin SEO pages.

---

## 9. Multilingual strategy

Perfect Blue is multilingual-first.

All supported locales should be treated as equally important product paths.

Current supported locales:

- Polish: `/pl/`
- English: `/en/`
- Spanish: `/es/`
- German: `/de/`
- Arabic: `/ar/`

### Key decision

Do not frame the product around a single language group.

The product differentiator is not only Polish access. The differentiator is:

> multilingual access without unnecessary language barriers.

### Free-text listing descriptions

Structured UI and listing fields should be localised through the application.

Free-text listing descriptions are not translated in-app in MVP.

Instead:

- the original description remains visible,
- users have a clear **Translate** action,
- the action opens Google Translate or a similar external translation path.

This is acceptable for MVP because:

- it avoids building a translation system too early,
- it preserves the owner/agent’s original text,
- it still gives users a practical path to understand descriptions.

### SEO implication

All locales should have correct locale routing and future hreflang support.

If/when landing pages are added, they should exist only where there is enough inventory and should be localised appropriately.

---

## 10. SEO strategy — simplified and inventory-aware

### SEO principle

Do not create indexable pages faster than the inventory can support them.

The early SEO goal is not to generate thousands of URLs.

The early SEO goal is to make the existing high-value pages crawlable, clear and technically correct.

### Pages to prioritise now

| Page type | MVP SEO status | Notes |
|---|---|---|
| Homepage | Index | Clear brand/product positioning. |
| Active listing detail pages | Index | Already valuable when listing is live. |
| Inactive listing pages | Noindex / 404 / 410 depending on state | Avoid soft 404s and stale listing pages. |
| Browse Listings page | Indexable if content is useful | Should not create infinite filter URLs. |
| City pages | Infrastructure later | Publish only above inventory threshold. |
| Zone pages | Later | Avoid thin pages. |
| Coast-distance pages | Later | Only with enough listings and demand. |
| Filter combinations | Noindex | Avoid faceted navigation explosion. |

---

## 11. Inventory thresholds for SEO pages

Do not publish city/zone/coast landing pages simply because the route exists.

Use inventory thresholds.

Suggested starting thresholds:

| Page type | Minimum active inventory before indexation |
|---|---:|
| City page | 8–10 active listings |
| Zone / district page | 5–8 active listings |
| Coast-distance page | 8–12 active listings in the relevant geography |
| Region page | 25–50 active listings in the region |
| Specific filter page | Only after proven search demand and stable inventory |

These thresholds can be adjusted later based on Search Console data and real user behaviour.

### Important

It is acceptable to build page infrastructure before publishing pages publicly.

Recommended approach:

1. Build routing/templates carefully.
2. Keep low-inventory pages unlinked or `noindex`.
3. Publish only when inventory and content quality are strong enough.

---

## 12. Canonical and filters

### General rules

- Index only curated, useful pages.
- Do not index arbitrary filter combinations.
- Do not index sort orders.
- Do not allow crawl/index explosion from query parameters.
- Use canonical URLs carefully.

### Filter URL principle

Filters are primarily for users, not SEO, during the MVP.

Examples that should generally remain non-indexable early:

- price ranges,
- number of bedrooms,
- number of bathrooms,
- sort order,
- arbitrary combinations,
- response score ranges,
- map bounds.

### Future curated SEO pages

Potential future SEO pages may include:

- city pages,
- high-inventory region pages,
- selected coast-distance pages,
- selected transaction + city pages.

But only after inventory supports them.

---

## 13. Response / trust strategy

### Avoid premature numerical scoring

Do not launch a fake or over-precise response score before there is enough data.

A score like `87/100` is not meaningful when the platform has low message volume.

### Bootstrap trust model

Start with simple, explainable trust indicators:

- Active listing.
- Recently added.
- Recently updated.
- Owner/agency active recently.
- Verified by Perfect Blue, if manually checked.

### Later response metrics

When there is enough messaging data, consider:

- average response time,
- response rate,
- number of confirmed interactions,
- owner/agency activity recency,
- listing freshness.

Only then consider a combined response score.

### SEO decision

Trust/response filters should not become indexable SEO facets in the early stage.

They should remain UX filters or badges until demand and inventory justify curated pages.

---

## 14. Content strategy for MVP

### Homepage content

Focus on:

- active listings,
- Catalonia,
- multilingual browsing,
- free listing creation,
- direct communication,
- simplicity.

Avoid:

- broad claims of full coverage,
- map-first messaging,
- heavy payment/security messaging before payment features are active,
- region-heavy language before inventory exists.

### Listings page content

Focus on:

- active listing count,
- city/municipality search,
- transaction filters,
- visible available cities,
- clear empty states.

### Empty states

Empty states are important because inventory will be low early.

Good empty state principles:

- be honest,
- suggest nearby active places,
- invite users to browse all listings,
- invite owners/agencies to add a listing,
- do not make the portal feel broken.

Example:

> No active listings found for this search yet. Try another city or browse all active listings.

---

## 15. Analytics and measurement

Track whether the simplified homepage is doing its job.

### Homepage events

- click_browse_listings
- click_add_listing
- click_language_selector
- click_homepage_benefit_link, if benefit cards become clickable

### Listings events

- view_item_list
- select_transaction_filter
- search_city
- select_city_suggestion
- clear_city_filter
- select_listing_card
- view_item
- generate_lead / contact_owner / send_message

### SEO monitoring

Use Search Console to monitor:

- homepage impressions/clicks,
- listing detail impressions/clicks,
- queries by locale,
- indexed pages,
- excluded pages,
- soft 404s,
- pages discovered but not indexed.

---

## 16. Implementation roadmap

### Stage 0 — Finish current mobile work

- Complete listing detail manual QA.
- Confirm mobile states across supported locales.
- Update `MOBILE_UX_PLAN.md` after completion.

### Stage 1 — Homepage content refresh

Scope:

- No redesign.
- No homepage search bar.
- No map.
- No region module.

Tasks:

- Update hero headline/subheadline.
- Keep `Browse Listings` as primary CTA.
- Keep `Add Listing` as secondary CTA.
- Replace benefit cards with MVP-aligned messaging.
- Remove or de-emphasise map-first copy.
- Remove or avoid payment/security copy that does not reflect MVP launch mode.

### Stage 2 — Browse Listings refinement

Scope:

- Improve the existing search/filter flow.
- Keep city search and active city suggestions.
- Improve copy and empty states if needed.
- Make sure low inventory feels intentional, not broken.

### Stage 3 — SEO technical consolidation

Scope:

- Review homepage metadata.
- Review locale metadata.
- Review listing metadata and sitemap behaviour.
- Plan future canonical/hreflang work.
- Prevent filter URL indexation issues.

### Stage 4 — Inventory-aware landing page infrastructure

Scope:

- Design route model for future city/region/coast pages.
- Do not mass-publish pages.
- Add thresholds for indexation.
- Add noindex/unpublished behaviour for thin pages.

### Stage 5 — Future discovery features

Only when inventory supports it:

- region navigation,
- map mode,
- map clusters,
- clickable regions,
- draw area,
- coast-distance pages.

---

## 17. Cursor / AI implementation guidance

When asking Cursor or another AI assistant to continue this work, use this document as the strategic source of truth.

### Safe first prompt

```text
Read SEARCH_FIRST_STRATEGY.md, ARCHITECTURE.md and MOBILE_UX_PLAN.md.

Do homepage investigation only.
Do not change code.
Do not add a homepage search bar.
Do not add a map.
Do not add region navigation.

Report:
1. Current homepage files/components.
2. Current copy and CTA structure.
3. Which text conflicts with the simplified strategy.
4. Proposed copy changes for hero and benefit cards.
5. Desktop and mobile regression risks.
6. Smallest safe implementation batch.
```

### First implementation prompt

```text
Implement only the approved homepage content refresh.

Rules:
- No layout redesign.
- No homepage search bar.
- No map.
- No region module.
- Preserve Browse Listings as primary CTA.
- Preserve Add Listing as secondary CTA.
- Replace map/payment-heavy benefit copy with MVP-aligned messaging: active listings, multilingual access, free to list / clear communication.
- Update all supported locale message files consistently.
- Do not touch Supabase, Stripe, migrations, auth or deployment config.
- Run the project typecheck/build command used in this repo and report the result.
```

---

## 18. Final strategic principle

Perfect Blue should not pretend to be Idealista on day one.

The early product should be smaller, clearer and more trustworthy:

> **Show real active inventory. Explain the multilingual value. Make browsing simple. Help owners add listings. Add maps, regions and SEO scale only when the inventory can support them.**
