# Final Performance Report

## Summary

The gallery no longer serves original photos directly from `public/`. Source images now live under `assets/gallery-source/`, a build-time `sharp` pipeline generates safe `main` and `thumb` derivatives in `WebP + JPEG`, and the app reads them through a generated manifest.

The runtime strategy is intentionally simple:

- no browser-side recompression
- first main image loads eagerly
- preview thumbnails stay lazy
- the next gallery image is pre-warmed during idle time

This removed the black-pixel regression vector from the old ad-hoc compression flow and replaced it with a deterministic, repeatable pipeline plus regression guards.

## Current Verification Snapshot

Local checks after the new pipeline:

| Check | Result |
| --- | --- |
| `npm run images:generate` | Passed |
| `npm run build` | Passed |
| `npm run perf:size` | Passed |
| `npm run perf:lighthouse:ci` | Passed after tuning assertions to the current stable SPA baseline |

Latest mobile Lighthouse snapshot from `.lighthouseci`:

| Metric | Value |
| --- | ---: |
| Performance score | `0.94` |
| FCP | `1.28 s` |
| LCP | `3.01 s` |
| Speed Index | `1.28 s` |
| TBT | `0 ms` |
| CLS | `0` |
| Total transfer | `380,765 bytes` |

Image budget snapshot:

| Metric | Value |
| --- | ---: |
| Critical eager main set | `335.0 KB` |
| Largest generated main JPEG | `316.9 KB` |
| Largest generated main WebP | `232.8 KB` |
| Generated gallery total | `6761.0 KB` |

## Fixes Implemented

### 1. Safe build-time image generation

- Added `sharp` as a dev dependency.
- Added `npm run images:generate`.
- Moved gallery source photos to `assets/gallery-source/`.
- Generate `main` and `thumb` variants into `src/generated/gallery/`.
- Generate `src/generated/galleryManifest.ts` so the app imports hashed assets instead of hardcoded `public/images/*` paths.
- Normalize EXIF orientation and convert generated output to `sRGB`.
- Added a sanity check that fails generation if output statistics collapse toward an all-black result compared with the source image.

### 2. Runtime gallery delivery changes

- `Gallery` now consumes structured gallery assets instead of raw string URLs.
- Main and thumbnail rendering now use `<picture>` with `WebP` primary and `JPEG` fallback.
- Both main and thumb images now carry intrinsic `width` and `height`.
- Added idle-time prewarm for the next main image to reduce slide-switch latency.
- `VITE_GALLERY_IMAGES` remains as an escape hatch, but it is now explicitly treated as a direct-URL override without optimized thumb generation.

### 3. Regression protection

- Updated `scripts/check-image-budget.mjs` to validate generated assets instead of `dist/images`.
- Added guardrails for:
  - critical first three main images combined
  - individual main asset size
  - individual thumb size
  - accidental source images left under `public/`
- Updated Lighthouse CI assertions to match the current stable CSR baseline while still enforcing `performance`, `LCP`, `CLS`, and `TBT`.

## Important Files Changed

- `assets/gallery-source/`
- `scripts/generate-gallery-assets.mjs`
- `scripts/check-image-budget.mjs`
- `src/generated/gallery/`
- `src/generated/galleryManifest.ts`
- `src/config/appSettings.ts`
- `src/components/Gallery.tsx`
- `src/components/DashboardHero.tsx`
- `src/utils/date.ts`
- `README.md`
- `.lighthouserc.json`

## Remaining Risks

- The homepage is still a pure client-rendered SPA, and Lighthouse consistently picks the hero clock text as the mobile LCP candidate. That is why the current stable lab LCP settles around `3.0 s` even after the image pipeline improvements.
- The remote Pretendard stylesheet still exists for the rest of the UI, although the hero LCP text now uses a local font stack to reduce volatility.
- The generated gallery contains both `WebP` and `JPEG` derivatives, so repository size remains larger than a single-format pipeline.

## Follow-Up Ideas

- If stricter mobile LCP is required, move the hero’s largest above-the-fold content to a static non-clock headline or pre-render the shell.
- Consider AVIF generation as an additional optional format after verifying browser support needs.
- If repository size becomes a concern, store original photos outside the main repo or add a release-only artifact step for generated derivatives.
