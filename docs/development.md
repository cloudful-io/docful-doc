# Development

## Requirements

- Node.js 22.12 or later
- npm 10 or later

## Install and run

```sh
npm install
npm run dev
```

The local server starts at `http://localhost:4321`.

## Project commands

| Command                    | Purpose                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run lint`             | Check formatting with Prettier, including Astro files                                          |
| `npm run typecheck`        | Run Astro and TypeScript diagnostics                                                           |
| `npm test`                 | Run unit tests                                                                                 |
| `npm run test:e2e`         | Run Playwright tests in Chromium desktop/mobile and WebKit                                     |
| `npm run test:prefix`      | Exercise the `/docs/` base path in the local Astro server                                      |
| `npm run build`            | Build static output for hostname-root hosting                                                  |
| `npm run build:prefix`     | Build static output for `/docs/` path-prefix hosting                                           |
| `npm run preview`          | Preview the last production build locally                                                      |
| `npm run benchmark:search` | Measure MiniSearch construction, cold query, and warmed query p75 on synthetic corpora         |
| `npm run test:benchmark`   | Run 30 browser trials per Chromium desktop/mobile profile and report LCP, CLS, INP, search p75 |

Run `npx playwright install` once before browser tests if the Playwright browser binaries are not available. The default end-to-end suite covers Chromium desktop/mobile and WebKit. To include installed Firefox or Microsoft Edge, set `PLAYWRIGHT_FIREFOX=1` or `PLAYWRIGHT_EDGE=1` before `npm run test:e2e`. The browser benchmark uses a fresh context for each of 30 trials and reports desktop/mobile LCP, CLS, INP, and search-response p75 separately. Its current environment is an unthrottled local workstation and loopback dev server; do not treat those measurements as field results for a mid-range mobile device. See [the measured baseline](performance-baseline.md) and record comparable device/browser and CPU/network conditions when checking the PRD targets.

## Configuration and content

- Instance title, logo, and theme colors: `src/site.config.ts`.
- Deployment base path: `DOCFUL_BASE_PATH` environment variable. Omit it or use `/` for hostname-root hosting; set it to a path such as `/docs/` for path-prefix hosting.
- Wiki pages: `public/wiki/**/*.md`; see [the wiki content contract](content-contract.md).

Vercel builds with `npm run build` and serves the `dist` directory as a static site. In path-prefix mode, the host application's routing layer forwards the configured prefix to the Vercel deployment.
