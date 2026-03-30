# Baseline Measurements

## Environment

- Date: 2026-03-30
- Machine/browser: local macOS environment with Google Chrome `146.0.7680.165`
- Build command: `npm run build`
- Preview command: `npm run preview -- --host 127.0.0.1 --strictPort`
- Lighthouse desktop command:
  - `./node_modules/.bin/lighthouse http://127.0.0.1:4173/ --preset=desktop --chrome-path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --output=json --output=html --output-path=performance/baseline/lighthouse-home-desktop`
- Lighthouse mobile command:
  - `./node_modules/.bin/lighthouse http://127.0.0.1:4173/ --chrome-path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --output=json --output=html --output-path=performance/baseline/lighthouse-home-mobile`

## Route Coverage

This app currently exposes a single production route, `/`, which contains the homepage, dashboard, list/grid, movement interactions, and gallery.

## Build Output

- `dist/assets/react-vendor-nf7bT_Uh.js`: `138 KB` (`45.26 KB` gzip from Vite output)
- `dist/assets/index-CCsCTU9S.js`: `19 KB` (`6.64 KB` gzip from Vite output)
- `dist/assets/index-DdWDsSzn.css`: `13 KB` (`3.32 KB` gzip from Vite output)
- `public/images/`: `47 MB` across `21` JPEGs

## Lighthouse Summary

| Profile | Perf score | FCP | LCP | Speed Index | TBT | CLS | TTI |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 99 | 1.6 s | 1.6 s | 2.2 s | 0 ms | 0 | 1.6 s |
| Desktop | 75 | 0.4 s | 7.8 s | 1.0 s | 0 ms | 0 | 7.8 s |

## Notable Baseline Evidence

- First-load network transfer on mobile: `9,308 KiB`
- Image transfer on mobile: `9,472,741` bytes out of `9,530,847` total bytes
- Image delivery savings estimated by Lighthouse: `9,230 KiB`
- Render-blocking savings estimated by Lighthouse: `330 ms`
- Desktop LCP element: the main gallery image
- Mobile LCP element: the live clock text

## Largest First-Load Requests

| Resource | Type | Transfer |
| --- | --- | ---: |
| `/images/eb1.jpeg` | Image | 8777.8 KB |
| `/images/eb2.jpeg` | Image | 239.5 KB |
| `/images/eb3.jpeg` | Image | 233.4 KB |
| `/assets/react-vendor-nf7bT_Uh.js` | Script | 44.6 KB |
| `/assets/index-CCsCTU9S.js` | Script | 7.0 KB |
| `/assets/index-DdWDsSzn.css` | Stylesheet | 3.6 KB |

## Main-Thread Breakdown

### Mobile

- Other: `151.4 ms`
- Script evaluation: `118.1 ms`
- Style and layout: `85.5 ms`
- Rendering: `37.8 ms`

### Desktop

- Other: `21.8 ms`
- Script evaluation: `15.0 ms`
- Style and layout: `11.9 ms`
- Rendering: `3.6 ms`

## Assumptions And Limits

- This baseline measures the single production route only because the application is a single-page dashboard.
- Lighthouse did not provide a stable INP value for these CLI runs, so interaction latency is inferred from code structure and load-trace evidence for the baseline phase.
- No real-user telemetry existed before the audit, so baseline Core Web Vitals are lab-only at this point.
