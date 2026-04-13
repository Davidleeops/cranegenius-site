# Top 20 Highest-Risk Modules
1. `command-center/_finance_loader.js` + `/data/financials.json` (missing) – single point of truth for KPIs with no auth, schema validation, or alerting.
2. `platform/dashboard.html` + `_next` bundles – compiled customer UI with no source control or error monitoring.
3. `platform/dashboard.txt` / `index.txt` – serialized payloads impossible to regenerate without a lost build pipeline.
4. `platform/cranegenius_opportunities.json` – entire opportunity dataset exposed publicly with no freshness metadata.
5. `platform/cranegenius_signals.json` – full signal history downloadable by anyone; no provenance or access control.
6. `supabase-loader.js` + `window.__CG_SUPABASE_*` globals – client-side secret handling with silent failure behavior.
7. `command-center/predictive-analytics.html` – always renders fallback data because the expected JSON feed is missing.
8. `tools/gdelt_healthcheck.py` – stores Supabase keys in plaintext; only GitHub workflow signals failures.
9. `.github/workflows/gdelt-healthcheck.yml` – cron-only monitoring with no alert routing; if disabled, ingestion health is unknown.
10. `command-center/index.html` password gate – hard-coded password (“dark30”) that provides no security for internal dashboards.
11. `operator-track-intake.html` – client-side gating and Formspree submission with no audit trail or consent logging.
12. `command-center/dashboard.html` – depends on finance JSON and Supabase without user-visible error states.
13. `command-center/financials.html` – exposes P&L data publicly and duplicates fetch logic that silently fails.
14. `command-center/pipeline.html` – claims live data but fails quietly when Supabase is absent.
15. `platform/map-style.json` + `/fonts` references – depends on external Carto tiles and glyph paths that may not exist on our CDN.
16. `platform/cables.geojson` – undocumented data source/licensing for infrastructure overlays.
17. `docs/code-comprehension` (governance layer) – no automation ensures new changes update these artifacts; risk of drift.
18. Marketing root pages (`index.html`, `for-gcs.html`) – embed GA/Clarity/Calendly without consent management; CTA failures go unseen.
19. `capexlayer/index.html` – duplicate messaging and tracking; risk of stale promises vs. product reality.
20. `newsletter/brief-*.html` – static localized briefs with no subscription or update tracking; potential for outdated or incorrect claims.
