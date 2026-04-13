# CTO Subsystem Brief: platform-next-dashboard
## 1. What This System Does
Serves the customer-facing platform dashboard via compiled Next.js artifacts (`platform/_next`, `dashboard.html`, `index.html`, `*.txt` RSC payloads) and static datasets (`cranegenius_opportunities.json`, `cranegenius_signals.json`, `cables.geojson`, `map-style.json`).
## 2. Why It Matters
This is effectively the product customers see: signal maps, opportunity lists, and the interactive dashboard. Any flaw here directly impacts user trust and the ability to sell data services.
## 3. Critical Dependencies
- Internal: Compiled Next.js bundles (source repo unknown), static JSON/GeoJSON datasets, Mapbox style file.
- External: Mapbox raster tiles, CDN hosting for `_next` chunks, whichever pipeline produces the giant datasets.
## 4. Key Tradeoffs
- Shipping compiled assets without source simplifies deployment but blocks audits and bug fixes.
- Embedding full datasets statically avoids runtime fetches but leaks data publicly and makes refreshes manual/heavy.
## 5. Main Risks
- Reliability: If dataset refresh fails there’s no monitoring; customers see stale data.
- Security/licensing: Datasets expose thousands of projects/signals without gating; unclear if redistribution is allowed.
- Maintainability: Without source, we can’t patch Next.js logic or upgrade dependencies.
- Scalability: Loading massive JSON files in-browser can crash low-end devices.
## 6. Silent Failure Risks
- Data pipelines could stop updating but users still see old data with no timestamps.
- `_next` bundles might reference missing chunks; only 404s in console would hint at it.
## 7. What a CTO Would Ask
1. Where is the source code for this Next.js build?
2. How often are the datasets refreshed, and how do we verify success?
3. Do we have rights to redistribute all permit/global data publicly?
4. How do we handle auth? Right now everything is public.
5. What’s the data volume loaded per user? Any performance budgets?
6. How do we roll back if a bad dataset ships?
7. Are there tests for the map layers and data transformations?
8. How do we keep Mapbox tokens/styles up to date?
9. Is there observability into `_next` errors?
10. What is the plan for multi-region/CDN delivery of these large files?
## 8. Recommended Next Improvements
- Locate or recreate the Next.js source and bring it into version control.
- Instrument dataset refresh pipeline with checksums + timestamps; surface freshness in UI.
- Gate data behind auth/entitlements; remove sensitive records from public repo.
- Add automated smoke tests loading `_next` bundles and primary datasets.
## 9. 60-Second Founder Explanation
“Our platform folder is just compiled Next.js plus huge JSON files. That means we can deploy quickly, but we can’t audit or patch the code, and every customer can download our entire dataset. Before we scale, we need the actual source repo, an authenticated delivery path, and monitoring so we know when the data goes stale.”
## 10. Confidence Level
Low — We only see compiled output and static datasets; we don’t know how they were produced or how fresh they are.
