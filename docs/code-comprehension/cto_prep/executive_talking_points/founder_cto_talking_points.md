# Founder & CTO Talking Points
## 10 Signals of Technical Maturity
1. We centralized all Command Center KPIs through `_finance_loader.js`, so one data change updates every dashboard.
2. Supabase access is abstracted via `cgSupabase.query`, letting us pivot tables without rewriting pages.
3. The platform already delivers compiled Next.js bundles, so once we regain source control we can leverage CDN caching globally.
4. Geo/map layers (`map-style.json`, `cables.geojson`) are versioned in Git, enabling reproducible visuals.
5. We instrumented GA4/Clarity across marketing pages, so campaign attribution is already wired in.
6. Predictive analytics dashboard includes hooks for external JSON feeds (`runs/predictive_analytics/dashboard.json`); we just need to wire it up.
7. The new comprehension layer gives us manifests, dependency maps, and ADRs for every critical subsystem.
8. GDELT monitoring already exists via GitHub cron; we just need to move secrets and hook alerts.
9. Operator Track intake gates prospects via Stage 1 logic, aligning leads with program fit.
10. Platform datasets are pre-packaged in JSON, so we can feed APIs or data warehouses quickly once we add governance.
## 10 Honest Limitations / Risks
1. `/data/financials.json` is missing from repo and unauthenticated; dashboards fail silently when it’s gone.
2. Platform source code isn’t here—we only have compiled `_next` artifacts.
3. Supabase keys must be injected into browsers, exposing data and lacking failure indicators.
4. `cranegenius_*` datasets are public downloads with no freshness metadata.
5. Predictive analytics page always displays fallback data, giving a false sense of progress.
6. GDELT healthcheck stores secrets in code and only reports failures via GitHub status.
7. Command Center “auth” is a hard-coded password (`dark30`).
8. Formspree handles intake submissions; we have no server-side log or consent banner.
9. Marketing/Capex pages embed multiple trackers without consent or uptime monitoring.
10. Data provenance (licensing, refresh cadence) for large JSON/GeoJSON assets is undocumented.
## 10 Priority Statements (Engineering)
1. “Secure the financial JSON feed with an authenticated API and schema validation.”
2. “Bring the Next.js platform source into this repo so we can audit and monitor it.”
3. “Gate the `cranegenius_*` datasets behind entitlements and add freshness stamps.”
4. “Proxy Supabase calls server-side to keep anon keys out of the browser.”
5. “Move GDELT secrets into GitHub Secrets and wire workflow failures to Slack.”
6. “Replace the client-side password gate with real authentication for Command Center.”
7. “Rebuild Operator Track intake on our own backend with consent and logging.”
8. “Connect predictive-analytics dashboards to a real data feed or hide them until ready.”
9. “Document dataset provenance and automate checksums before publishing.”
10. “Add CI checks that fail when critical files change without updated manifests.”
## 10 Tradeoff Statements
1. “We shipped static JSON for speed, knowing we’d need to secure it later.”
2. “Keeping compiled `_next` assets in this repo let us deploy instantly, but now we’re prioritizing source control.”
3. “Supabase runs client-side today because it avoided building a backend; we’re moving to a proxy to protect the keys.”
4. “Formspree let us launch Operator Track quickly; now we’re replacing it with a first-party form to capture every lead.”
5. “Public datasets were intentional for demos; as we monetize, we’ll gate them and track freshness.”
6. “The predictive analytics page was a placeholder to show intent; we’re wiring it to real runs so it doesn’t mislead.”
7. “We relied on GitHub cron for monitoring; now we’re extending it with secrets management and alerting.”
8. “Inline GA/Clarity scripts gave us attribution fast, but we need to add consent and uptime monitoring.”
9. “We built the Command Center as static HTML to move fast; now we’ll add auth and schema validation.”
10. “Documentation was manual so far; we’re integrating it into CI so the comprehension layer stays accurate.”
