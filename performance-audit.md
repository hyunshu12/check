# Performance Audit

## Detected Stack

- Framework/runtime: React 18 SPA with TypeScript
- Build tool: Vite 5
- Routing: single-route application (`/`)
- Rendering mode: client-side rendering only
- Package manager: npm (`package-lock.json`)
- Deployment target: Cloudflare Pages via [`.github/workflows/deploy.yml`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/.github/workflows/deploy.yml)
- Existing telemetry: none
- Existing performance CI/tooling before this audit: none

## Critical User Journeys

Because this repo is a single-route app, the same page covers every user-critical journey:

1. Initial dashboard load
2. Scanning the seat grid and counts
3. Opening a student modal and updating movement state
4. Scanning the movement summary lanes
5. Viewing and navigating the gallery

## Likely Performance-Sensitive Components

- [`src/App.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/App.tsx): owns the clock state and renders the entire dashboard tree
- [`src/components/SeatGrid.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/SeatGrid.tsx): largest repeated DOM region
- [`src/components/MovementPanel.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/MovementPanel.tsx): derives grouped movement data on state changes
- [`src/components/Gallery.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/Gallery.tsx): image-heavy, timer-driven, and part of initial page load
- [`styles.css`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/styles.css): imports a remote font stylesheet via CSS `@import`

## Current Risks Before Changes

- The gallery assets dominate page weight. `public/images/` is about `47 MB` across 21 JPEGs, and Lighthouse observed `9,308 KiB` transferred on first load because the initial render pulls the main gallery image plus two additional preview images.
- The largest current image is extremely oversized for its display size. Lighthouse reports `/images/eb1.jpeg` at `8.78 MB`, with about `8.56 MB` avoidable due to oversizing and encoding.
- A render-blocking third-party font stylesheet is chained through CSS `@import`, which delays paint discovery and adds an external dependency on `cdn.jsdelivr.net`.
- The root `App` component owns a `useClock()` state that updates every second, which forces the full dashboard subtree to re-render on a timer even when the user is idle.
- The application currently has no Lighthouse CI, no bundle budget enforcement, and no real-user Core Web Vitals instrumentation, so regressions would be easy to miss.

## Baseline Findings And Bottlenecks

### 1. Oversized gallery images

- Evidence:
  - Mobile Lighthouse first-load payload: `9,308 KiB`
  - `resource-summary`: `9,472,741` bytes of image transfer out of `9,530,847` total bytes
  - `image-delivery-insight`: estimated savings `9,230 KiB`
  - `/images/eb1.jpeg`: `8,988,212` bytes transferred, `8,969,443` bytes estimated waste
  - Desktop LCP element is the gallery image in [`src/components/Gallery.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/Gallery.tsx)
- Affected route/component:
  - `/`
  - [`src/components/Gallery.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/Gallery.tsx)
  - `public/images/*`
- User-visible symptom:
  - Slow initial load on larger viewports
  - Wasteful bandwidth usage
  - Gallery competing with more important dashboard content for network priority
- Estimated impact:
  - High
- Recommended fix:
  - Replace oversized gallery assets with aggressively downscaled/compressed production variants
  - Ensure non-active gallery images are low-priority or lazy-loaded

### 2. Render-blocking font stylesheet

- Evidence:
  - Mobile Lighthouse `render-blocking-resources`: estimated savings `330 ms`
  - Blocking chain includes `https://cdn.jsdelivr.net/.../pretendard.css`
  - The font stylesheet is currently loaded through [`styles.css:1`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/styles.css#L1)
- Affected route/component:
  - `/`
  - [`styles.css`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/styles.css)
  - [`index.html`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/index.html)
- User-visible symptom:
  - Slower first paint and LCP discovery
  - Extra sensitivity to third-party network variance
- Estimated impact:
  - Medium
- Recommended fix:
  - Remove CSS `@import`
  - Discover the stylesheet earlier with HTML `<link>` tags and `preconnect`, or fall back to local/system fonts if the external dependency remains too costly

### 3. Whole-dashboard rerender every second

- Evidence:
  - [`src/App.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/App.tsx) calls `useClock()` and renders the entire dashboard tree from the same component
  - [`src/hooks/useClock.ts`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/hooks/useClock.ts) updates state every `1000 ms`
  - The seat grid, movement panel, gallery shell, and action controls all re-render with the root component
- Affected route/component:
  - `/`
  - [`src/App.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/App.tsx)
- User-visible symptom:
  - Unnecessary idle work
  - Higher risk of jank during user interactions on slower devices
  - Potential distortion of paint-related metrics because prominent text changes once per second
- Estimated impact:
  - Medium
- Recommended fix:
  - Isolate the live clock into a smaller component boundary so the rest of the dashboard does not rerender every second

### 4. Secondary gallery content is loaded eagerly

- Evidence:
  - First-load network requests include `/images/eb1.jpeg`, `/images/eb2.jpeg`, and `/images/eb3.jpeg`
  - The gallery mounts immediately and renders preview thumbnails during first paint
- Affected route/component:
  - `/`
  - [`src/components/Gallery.tsx`](/Users/hyeonsyu/Documents/02_Work/02_DevelopeProject/04_check/src/components/Gallery.tsx)
- User-visible symptom:
  - Important dashboard content shares bandwidth with secondary image content
  - Slower route completion on constrained networks
- Estimated impact:
  - Medium to high
- Recommended fix:
  - Keep the gallery shell visible, but delay or de-prioritize non-active gallery images
  - Make thumbnail images lazy and async-decoded

## Baseline Artifacts

- Lighthouse mobile report: `performance/baseline/lighthouse-home-mobile.report.json`
- Lighthouse desktop report: `performance/baseline/lighthouse-home-desktop.report.json`
- Human-readable baseline summary: `performance/baseline/README.md`
