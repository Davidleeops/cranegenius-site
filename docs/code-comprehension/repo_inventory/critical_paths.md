# Critical Paths

## 1. Financial Intelligence Surfaces
- **Entry points:** `command-center/_finance_loader.js` embedded in dashboard, pipeline, execution-plan, launch-kanban, and financials HTML pages.
- **Data source expectation:** `/data/financials.json` in repo root (missing), optionally augmented by Supabase queries for contextual cards.
- **Business impact:** Drives every revenue/burn/MRR metric shown to founders; stale or missing JSON blanks entire command center.
- **Risks:** Single JSON file with no schema validation, no caching strategy, and no auth. Failure presents silently as `--` placeholders while leadership believes numbers are live.

## 2. Supabase Signal + Opportunity Queries
- **Entry points:** `command-center/supabase-loader.js` plus inline async sections in `dashboard.html` and `pipeline.html` that call PostgREST tables like `opportunities` or `signal_events`.
- **Credentials:** Expect `window.__CG_SUPABASE_URL__` and anon key to be injected at runtime (yet no documented injection path).
- **Business impact:** Without these env vars, dashboards fall back to stale static copy; with them, secrets leak to browsers.
- **Risks:** Timeout-only error handling, no pagination, no rate limiting, and secrets bundled client-side.

## 3. Platform Map + Dataset Delivery
- **Entry points:** `platform/dashboard.html` (Next.js build) loading `_next` bundles that read `cranegenius_opportunities.json`, `cranegenius_signals.json`, `cables.geojson`, and `map-style.json`.
- **Business impact:** These JSON files *are* the product—corrupt or stale data misguides sales targeting and customer deliverables.
- **Risks:** Massive static JSON committed with no provenance, no incremental refresh plan, and no PII scrub; visitors download everything unauthenticated.

## 4. Operator Intake Workflow
- **Entry points:** `operator-track-intake.html` gating Stage 1/Stage 2 before posting to Formspree.
- **Business impact:** Qualifies or rejects prospects before human review; mistakes send revenue-qualified users away.
- **Risks:** Client-side-only disqualification logic, hard-coded Formspree endpoint, no spam/abuse controls, PII transmitted without encryption assurances.

## 5. GDELT Feed Monitoring + CI Hook
- **Entry points:** `tools/gdelt_healthcheck.py` plus `.github/workflows/gdelt-healthcheck.yml` scheduled hourly.
- **Business impact:** Sole automated check ensuring Supabase edge function and Google Translate endpoints stay healthy—the upstream data engine for platform signals.
- **Risks:** Secrets hard-coded in repo, no alert routing beyond workflow failure, and translator dependency couples to consumer endpoint that can throttle or change format.

## 6. Next.js Dashboard Build Artifacts
- **Entry points:** `platform/_next` bundles referenced by `dashboard.html` along with `index.txt` / `dashboard.txt` React Server Component payloads.
- **Business impact:** Unknown business logic (compiled) drives the interactive experience; only compiled JS exists, no source.
- **Risks:** Impossible to audit authentication, data filtering, or quota logic; any bug requires rebuilding from absent source repo.
