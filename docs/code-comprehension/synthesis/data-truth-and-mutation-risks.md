# Data Truth & Mutation Risks
## Highest-Risk Data Flows
1. **Command Center financial pipeline** – `_finance_loader.js` fetches `/data/financials.json`, a file missing from the repo and maintained manually. Every KPI (MRR, burn, pipeline) comes from this unauthenticated JSON drop.
2. **Supabase signal bridge** – `supabase-loader.js` expects `window.__CG_SUPABASE_URL__` and anon key globals that aren’t documented. If keys aren’t injected, dashboards quietly fall back to static content.
3. **Platform data feeds** – `platform/cranegenius_opportunities.json` and `platform/cranegenius_signals.json` ship the entire datasets publicly, with no provenance or freshness metadata.
4. **Predictive analytics status** – `command-center/predictive-analytics.html` looks live but always falls back to `defaultData` because `runs/predictive_analytics/dashboard.json` isn’t present.
5. **GDELT monitoring** – `tools/gdelt_healthcheck.py` uses hard-coded Supabase keys and only reports status via GitHub Actions; if the workflow pauses, upstream ingestion could die unnoticed.
## Silent Failure Risks
- Missing `financials.json` renders `--` values but otherwise “healthy” dashboards.
- Supabase globals absent → live sections show stale copy with no banner.
- Static platform datasets go stale without timestamps; customers still see old data as if real-time.
- Predictive analytics page defaults to canned data, misleading leaders into thinking runs are green.
- GDELT monitoring stops when GitHub cron or secrets fail; no external alert.
## Undocumented Assumptions
- Finance team will keep `/data/financials.json` current and correctly structured.
- Deployment process will inject Supabase URL/key globals securely.
- Platform visitors are allowed to download entire datasets.
- `/platform/_next` bundles and `dashboard.txt` will stay in sync forever without source control.
- `runs/predictive_analytics/dashboard.json` exists somewhere even though it isn’t shipped.
## Immediate Cleanup Priorities
1. Replace the static financial JSON with an authenticated API + schema validation; add UI error states and freshness timestamps.
2. Move Supabase access server-side or at least document/inject keys securely with logging when queries fail.
3. Build a governed pipeline for platform datasets: provenance, versioning, auth, and “last updated” surfaces.
4. Surface truthful status on predictive-analytics page (banner + timestamp) and hook it to a real data source or remove it for now.
5. Move GDELT credentials into GitHub Secrets and route workflow failures to Slack/PagerDuty.
## What a CTO Would Challenge First
- “Where is the source of truth for `/data/financials.json`, and why isn’t it secured or validated?”
- “Why are entire customer datasets downloadable without auth or freshness guarantees?”
- “How do we know when Supabase data isn’t loading—why is there no status indicator?”
- “Why does the predictive analytics dashboard show canned defaults while claiming to be live?”
- “What’s the plan to regain control of the Next.js build and ensure `_next` bundles match the serialized payloads?”
