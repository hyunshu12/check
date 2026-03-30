# Final Performance Report

## Summary

This repo is a single-route React + Vite dashboard, so the audit focused on `/` as the homepage, dashboard, list/grid, and interaction-heavy route.

The biggest verified problem was not JavaScript size. The dominant cost was oversized gallery imagery: Lighthouse saw `9,308 KiB` on first load, with about `9,472,741` bytes of image transfer and an `8.78 MB` lead image becoming desktop LCP. A secondary issue was a render-blocking third-party font stylesheet chained through CSS `@import`. A third issue was avoidable render churn from a clock-driven root render.

## Before / After Metrics

### Route: `/` (mobile Lighthouse)

| Metric | Baseline | Final | Delta |
| --- | ---: | ---: | ---: |
| Performance score | 99 | 100 | +1 |
| FCP | 1.6 s | 1.3 s | -0.3 s |
| LCP | 1.6 s | 1.6 s | flat |
| Speed Index | 2.2 s | 1.3 s | -0.9 s |
| TBT | 0 ms | 0 ms | flat |
| CLS | 0 | 0.001 | +0.001 |
| TTI | 1.6 s | 1.6 s | flat |
| Total transfer | 9,308 KiB | 923 KiB | -8,385 KiB |

Main-thread breakdown on mobile:

- Script evaluation: `118.1 ms` -> `83.5 ms`
- Style and layout: `85.5 ms` -> `67.8 ms`
- Rendering: `37.8 ms` -> `15.8 ms`

### Route: `/` (desktop Lighthouse)

| Metric | Baseline | Final | Delta |
| --- | ---: | ---: | ---: |
| Performance score | 75 | 99 | +24 |
| FCP | 0.4 s | 0.3 s | -0.1 s |
| LCP | 7.8 s | 1.0 s | -6.8 s |
| Speed Index | 1.0 s | 0.4 s | -0.6 s |
| TBT | 0 ms | 0 ms | flat |
| CLS | 0 | 0 | flat |
| TTI | 7.8 s | 1.0 s | -6.8 s |
| Total transfer | 9,308 KiB | 923 KiB | -8,385 KiB |

Render-blocking resources:

- Baseline desktop: external Pretendard stylesheet blocked render with estimated `231 ms` savings available
- Final desktop: no Lighthouse render-blocking resources reported

## Fixes Implemented

### 1. Gallery image delivery optimization

Targeted symptom:
- Slow initial load
- Desktop LCP dominated by gallery imagery
- Oversized first-load network payload

Changes:
- Recompressed and downscaled 18 oversized gallery JPEGs in `public/images/`
- Kept stable image URLs to avoid runtime/path churn
- Added `decoding="async"` to gallery images
- Added `loading="lazy"` to preview thumbnails in [`src/components/Gallery.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/Gallery.tsx)

Measured result:
- `public/images/` shrank from about `47 MB` to about `2.8 MB`
- `dist/images/` shrank from about `55 MB` to about `3.1 MB`
- First-load transfer dropped from `9,308 KiB` to `917-923 KiB`
- Desktop LCP dropped from `7.8 s` to about `0.9-1.0 s`

### 2. Font loading cleanup

Targeted symptom:
- Render-blocking stylesheet chain
- External CSS discovered late through `@import`

Changes:
- Removed the Pretendard CSS `@import` from [`styles.css`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/styles.css)
- Added `preconnect` plus non-blocking `preload`/`stylesheet` handoff in [`index.html`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/index.html)

Measured result:
- Mobile Lighthouse render-blocking list dropped from the external font stylesheet plus app CSS to app CSS only
- Desktop Lighthouse reported no render-blocking resources in the final state
- Mobile FCP improved from `1.6 s` to `1.3 s`

### 3. Root rerender isolation

Targeted symptom:
- Whole dashboard rerendering every second
- Unnecessary work during idle and during modal/fullscreen state changes

Changes:
- Moved the ticking clock/schedule display into [`src/components/DashboardHero.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/DashboardHero.tsx)
- Removed `useClock()` ownership from [`src/App.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/App.tsx)
- Wrapped [`src/components/SeatGrid.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/SeatGrid.tsx) and [`src/components/Gallery.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/Gallery.tsx) in `memo` so modal/fullscreen state changes do not redraw them unnecessarily

Measured result:
- Mobile main-thread script evaluation improved from `118.1 ms` to `83.5 ms`
- Mobile style/layout improved from `85.5 ms` to `67.8 ms`
- Interaction guardrails are now in place through real-user vitals reporting

## Regression Protection Added

### Lighthouse CI

Files:
- [`.lighthouserc.json`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/.lighthouserc.json)
- [`.github/workflows/performance.yml`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/.github/workflows/performance.yml)

Assertions:
- `categories:performance >= 0.95`
- `largest-contentful-paint <= 1800 ms`
- `cumulative-layout-shift <= 0.1`
- `total-blocking-time <= 100 ms`

Verification:
- `npm run perf:lighthouse:ci` passed locally

### Bundle and asset budgets

Files:
- [`package.json`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/package.json)
- [`scripts/check-image-budget.mjs`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/scripts/check-image-budget.mjs)

Budgets:
- `react-vendor`: `160 KB`
- main app chunk: `25 KB`
- `web-vitals` async chunk: `15 KB`
- CSS: `20 KB`
- total gallery images in `dist/images`: `3 MB`
- max single gallery image: `450 KB`

Verification:
- `npm run perf:size` passed locally

### Real-user Web Vitals instrumentation

Files:
- [`src/lib/performance/webVitals.ts`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/lib/performance/webVitals.ts)
- [`src/main.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/main.tsx)
- [`README.md`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/README.md)

Coverage:
- `LCP`
- `INP`
- `CLS`

Behavior:
- Sends to `VITE_WEB_VITALS_ENDPOINT` via `sendBeacon`, with `fetch(..., { keepalive: true })` fallback
- Includes route path and attribution payload
- Falls back to console logging plus a `window` `web-vitals:metric` custom event when no endpoint is configured

## Exact Files Changed

- `.github/workflows/performance.yml`
- `.lighthouserc.json`
- `README.md`
- `index.html`
- `package.json`
- `performance-audit.md`
- `performance/baseline/README.md`
- `performance/baseline/lighthouse-home-desktop.report.html`
- `performance/baseline/lighthouse-home-desktop.report.json`
- `performance/baseline/lighthouse-home-mobile.report.html`
- `performance/baseline/lighthouse-home-mobile.report.json`
- `performance/final/lighthouse-home-desktop.report.html`
- `performance/final/lighthouse-home-desktop.report.json`
- `performance/final/lighthouse-home-mobile.report.html`
- `performance/final/lighthouse-home-mobile.report.json`
- `performance/final-report.md`
- `scripts/check-image-budget.mjs`
- `src/App.tsx`
- `src/components/DashboardHero.tsx`
- `src/components/Gallery.tsx`
- `src/components/SeatGrid.tsx`
- `src/lib/performance/webVitals.ts`
- `src/main.tsx`
- `styles.css`
- `public/images/eb1.jpeg`
- `public/images/eb4.jpeg`
- `public/images/eb5.jpeg`
- `public/images/eb6.jpeg`
- `public/images/eb7.jpeg`
- `public/images/eb8.jpeg`
- `public/images/eb9.jpeg`
- `public/images/eb10.jpeg`
- `public/images/eb11.jpeg`
- `public/images/eb12.jpeg`
- `public/images/eb13.jpeg`
- `public/images/eb14.jpeg`
- `public/images/eb15.jpeg`
- `public/images/eb16.jpeg`
- `public/images/eb17.jpeg`
- `public/images/eb18.jpeg`
- `public/images/eb20.jpeg`
- `public/images/eb21.jpeg`

## Remaining Risks

- The gallery still ships JPEGs. Moving to AVIF/WebP with `<picture>` sources would likely reduce the remaining image transfer further.
- The page still makes a favicon request that is not part of this performance pass.
- Mobile LCP is now acceptable, but it still lands on dynamic hero content rather than a fully static above-the-fold element.
- This is a static SPA, so TTFB is mostly outside the frontend codebase except for deployment/platform behavior.

## Follow-Up Ideas Not Yet Implemented

- Add AVIF/WebP derivatives and `<picture>` sources for the gallery while keeping JPEG fallback.
- Add a scripted interaction benchmark for modal open, student state changes, and gallery navigation to complement the current load-focused Lighthouse coverage.
- If the student list grows materially beyond the current size, revisit virtualization or segmented rendering for the seat grid.
- Consider self-hosting the font or moving fully to the existing local/system Korean fallback stack to remove the third-party dependency entirely.

## Assumptions And Environment Limits

- Only one production route exists, so route-level measurements all map to `/`.
- Final lab numbers were captured locally with Google Chrome `146.0.7680.165`.
- Real-user metrics cannot be validated end-to-end without a configured `VITE_WEB_VITALS_ENDPOINT`, so local verification used the console/event fallback.
- Local verification also produced `.lighthouseci/` and checkpoint artifacts; they are measurement byproducts rather than primary deliverables.
