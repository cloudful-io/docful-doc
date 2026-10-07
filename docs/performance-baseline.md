# Performance baseline

These are reproducible local reference measurements, not production or field results. They were collected on an Apple Silicon Mac (Darwin arm64) with Chromium 153.0.8010.12, an unthrottled workstation CPU, and an unthrottled loopback Astro development server. Browser page-load measurements use 30 fresh contexts per viewport. Percentiles use the nearest-rank p75.

## Browser baseline

| Profile |   Viewport | LCP p75 | CLS p75 | INP p75 | Search response p75 |
| ------- | ---------: | ------: | ------: | ------: | ------------------: |
| Desktop | 1365 × 900 |  212 ms |   0.000 |   96 ms |              268 ms |
| Mobile  |  390 × 844 |  212 ms |   0.000 |   96 ms |              266 ms |

Search response measures from entering a query to the rendered result count appearing. It includes normal browser and local development-server overhead.

## Search corpus benchmark

`npm run benchmark:search` generates Markdown-like synthetic documents and measures MiniSearch directly in Node.js. The baseline corpus is 500 pages with 5 MB of body text; the stress corpus is 2,000 pages with 20 MB of body text.

| Corpus                      | Index build | Cold first query | Warmed query response p75 (50 queries) |
| --------------------------- | ----------: | ---------------: | -------------------------------------: |
| Baseline: 500 pages / 5 MB  |    388.5 ms |           4.0 ms |                                 0.9 ms |
| Stress: 2,000 pages / 20 MB |    883.1 ms |           1.7 ms |                                 2.4 ms |

These values are a point-in-time reference and will vary with hardware, browser version, operating system, and background load. Re-run both commands when changing rendering or search code; use the same conditions for comparisons. Field performance on representative hosting and mobile devices remains to be measured.
