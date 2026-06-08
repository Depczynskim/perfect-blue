# Screenshot Workflow

Use this workflow whenever visual changes need to be verified against a mockup or a previous screenshot.

## Purpose

Produce reliable screenshots from a clean local dev server, then compare them visually before claiming that a UI change is correct.

This avoids comparing against stale builds, broken error pages, or screenshots from an old dev-server state.

## Standard Loop

1. Make the smallest approved UI change.
2. Run the project build.
3. Restart the dev server if the build touched compiled app code or if screenshots may be stale.
4. Confirm the page returns `200`.
5. Capture fresh screenshots.
6. Open and visually inspect the screenshots.
7. Compare against the mockup or previous accepted screenshot.
8. Report what changed, what improved, and what still differs.
9. Stop for user review unless the next change was already approved.

## Build

```bash
npm run build
```

If the build succeeds but prints a known unrelated warning, mention it in the report and continue only if the page still loads correctly.

## Restart Dev Server

Use this when screenshots may be stale, when the page returns `500`, or after running `npm run build` while `next dev` was already running.

```bash
lsof -ti:3008 | xargs kill -9 2>/dev/null || true
rm -rf .next node_modules/.cache
ulimit -n 10240 && npm run dev -- --port 3008
```

Wait until the dev server reports that it is ready.

## Verify Page Health

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3008/pl
```

The expected result is:

```bash
200
```

Do not use screenshots for comparison if the page returns `500`, shows a Next.js error overlay, or renders a blank page.

## Capture Screenshots

Homepage screenshot scripts:

```bash
npm run screenshot:home:desktop
npm run screenshot:home:mobile:375
npm run screenshot:home:mobile:390
npm run screenshot:home:mobile:414
npm run screenshot:home:all
```

Outputs:

```bash
screenshots/home/home-desktop-1440.png
screenshots/home/home-mobile-375.png
screenshots/home/home-mobile-390.png
screenshots/home/home-mobile-414.png
```

## Validate Screenshots

Open the generated screenshots before comparing.

Check that:

- The screenshot shows the real page, not an error overlay.
- The screenshot is not blank.
- The viewport matches the intended test size.
- The page language and route are correct.
- The screenshot is fresh after the latest code change.

For homepage mockup work, compare against:

```bash
Homepage_Mockup/Homepage_Desired_Layout.png
screenshots/home/home-desktop-1440.png
screenshots/home/home-mobile-375.png
```

## Report Format

Keep the report factual and visual:

- Files changed.
- Build result.
- Dev server health result.
- Screenshot commands run.
- Whether screenshots are valid.
- What visually improved.
- What still differs from the mockup.
- Whether mobile or desktop stayed unchanged, if that was required.

## Rules

- Do not compare invalid screenshots.
- Do not claim a visual match without opening the generated screenshot.
- Do not chain unrelated UI changes into one batch.
- Do not commit screenshots; `screenshots/` is local QA output.
- Do not commit unless explicitly asked.

