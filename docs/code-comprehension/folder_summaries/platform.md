# Folder Summary: platform
## Role
Hosts the customer-facing CraneGenius platform experience: compiled Next.js dashboard shell, marketing landing page, map style assets, and the massive JSON datasets that power opportunity and signal maps.
## Key Files and Modules
- `index.html`: marketing landing for the platform bundle.
- `dashboard.html`: pre-rendered Next.js dashboard page referencing `_next` assets.
- `_next/`: hashed Next.js build artifacts and static chunks.
- `index.txt`, `dashboard.txt`: React Server Component payloads tied to the build hash.
- `cranegenius_opportunities.json`, `cranegenius_signals.json`: primary data feeds with thousands of records.
- `cables.geojson`, `map-style.json`: supporting geospatial layers.
## Main Data Flows
- Browser loads `dashboard.html`, which pulls `_next/static/...` chunks plus `index.txt`/`dashboard.txt` payloads to hydrate the dashboard.
- Map components fetch the bundled JSON datasets directly from the static site—no API gateway or auth.
## Dependencies
- Internal: Build hash `2eNlC0pNXEsxXu4sdsWsy` directories, static JSON assets.
- External: Mapbox raster tiles, whatever upstream process produces the JSON exports (not present), CDN hosting for Next.js chunks.
## Top Risks
- No source code in this repo: we can’t audit or modify Next.js logic.
- Data exports expose sensitive, possibly licensed information with zero access control.
- JSON files have no freshness metadata or schema validation; customers may see stale/incomplete data silently.
- Large payloads can choke client devices; there’s no pagination or streaming.
## Darkest Areas
- `_next/` compiled assets and RSC payloads—opaque without the original Next.js source.
- `cranegenius_opportunities.json` and `cranegenius_signals.json`—huge unversioned datasets with unknown provenance.
## Open Questions
- Where is the Next.js source stored and how do we rebuild?
- How often are the datasets regenerated and by what pipeline?
- Do we have legal clearance to publish raw permit/global data publicly?
- How are Mapbox tokens/config managed across environments?
