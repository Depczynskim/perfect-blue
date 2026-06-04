# Perfect Blue — Light Reflection Signature

Isolated branding / motion-design exploration. **Not connected to the Next.js app.**

## Purpose

Compare four text-focused light-reflection variants on the production header wordmark before implementation in `Header.tsx`.

## Open locally

```bash
cd /Users/bm/Desktop/Perfect_Blue/logo-test
python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

## Variants

| Variant | Technique | Feel | Production Timing |
|---------|-----------|------|-------------------|
| **A** — Wordmark Soft Reflection | Diagonal gradient sweep across full text | Ambient premium polish | ~55s, 45% opacity |
| **B** — Blue Word Glint ⭐ | Elliptical radial glint on "Blue" + subtle touch on "Perfect" | Natural Mediterranean accent | ~72s, 50% opacity |
| **C** — Broken Water Reflection | Multiple irregular offset bands (2–3 layers) | Organic water-light | ~68s, 40% opacity |
| **D** — Almost Static Sheen | Near-static luminous accent with tiny drift | Safest minimal motion | ~180s, 30% opacity |

⭐ **Recommended:** Variant B — most natural, premium, and Mediterranean feel

## Review mode vs production

**Current prototype (review mode):**
- Animation cycle: ~3 seconds
- Opacity: 45–100% (depending on variant)
- Purpose: Easy visual comparison

**Production recommendations:**
- Animation cycle: 45–120 seconds (rare, ambient)
- Opacity: 30–50% (reduce by 40–60%)
- Goal: Felt, not noticed

## Technical approach

### Text-focused reflection
- Applied via `::before` / `::after` pseudo-elements directly on `.logo-wordmark`
- Uses gradient backgrounds (linear/radial) that animate position
- No `background-clip: text` needed — overlays work cleanly
- Variant B splits "Perfect" and "Blue" into separate `<span class="logo-word">` elements

### Natural organic feel
- Diagonal angles (105–118deg) instead of horizontal sweep
- Multiple soft gradient stops (4–8 stops) for blended edges
- Radial gradients (Variant B) for elliptical glint
- Irregular multi-layer bands (Variant C) for broken water-light effect
- Subtle vertical micro-movement (±0.5px) for natural feel

### Performance
- Animates only `background-position`, `opacity`, and `transform` (translateY micro-shifts)
- Uses `will-change` hints where beneficial
- `pointer-events: none` on all reflection layers
- No layout shift (absolute positioning within relative parent)

## Production logo reference

From `src/components/layout/Header.tsx`:

- **Icon:** 32×32 px, `#2563eb` (`primary-600`), 8 px radius, white bold "PB" at 14 px
- **Wordmark:** Inter semibold 18 px, `#0f172a` (`slate-900`)
- **Spacing:** 8 px gap between icon and text
- **Header bar:** white background, `#e2e8f0` bottom border, 64 px height

## Accessibility

`prefers-reduced-motion: reduce` disables all animations (Variant D keeps static sheen only).

## Transfer to production

1. Add reflection styles from `styles.css` Variant B section to production CSS
2. Update `Header.tsx` wordmark markup to split "Perfect" and "Blue" into separate spans:
   ```tsx
   <span className="logo-wordmark">
     <span className="logo-word logo-word--perfect">Perfect</span>{' '}
     <span className="logo-word logo-word--blue">Blue</span>
   </span>
   ```
3. Adjust timing from `3s` to `72s` (or preferred production timing)
4. Reduce opacity by 50% (adjust CSS custom properties)
5. Test on various backgrounds and with different header states (sticky, scroll)

## Constraints

Do not import this folder into the app, add routes, or modify production components.
