# Workstream Partition Plan

| Workstream | Scope (Folders / Files) | Primary Concerns | Initial Owner Notes |
| --- | --- | --- | --- |
| 1. Marketing & Lead Capture | `index.html`, `for-gcs.html`, `operator-track-intake.html`, `capexlayer/`, `newsletter/` | Accuracy of messaging, intake form security/PII handling, third-party tracking pixels, Formspree dependency. | Needs product/marketing lead plus security reviewer for intake gating + consent. |
| 2. Command Center Dashboards & Loaders | Entire `command-center/` directory including `_finance_loader.js` and `supabase-loader.js` | Missing `/data/financials.json`, pseudo-auth, Supabase anon key exposure, stale narrative content. | Assign to ops engineering; requires financial data owner for JSON pipeline. |
| 3. Platform App & Data Fabric | `platform/` (Next.js build artifacts, map styles, `cables.geojson`, `cranegenius_*` datasets, `_next/`) | Massive public datasets with no provenance, compiled JS with no source, potential licensing/privacy issues, unknown auth. | Requires platform engineering + data owner; likely separate repo or build system to locate. |
| 4. Datasets & Intelligence Assets | `platform/cranegenius_opportunities.json`, `platform/cranegenius_signals.json`, `platform/cables.geojson`, any future `/data/*.json` | Data freshness, cleansing, redaction of sensitive info, schema versioning. | Data team to define pipelines + version control; may overlap with Workstream 3 but tracked separately to emphasize governance. |
| 5. Monitoring, Feeds, and Automation | `tools/`, `.github/workflows/gdelt-healthcheck.yml` | Hard-coded Supabase/Google keys, reliability of hourly healthcheck, alerting gaps, dependency on public translator endpoint. | DevOps/infra owner needed to move secrets to GitHub secrets and wire alert routing. |
| 6. Infrastructure & Governance Docs | `.github/`, future `/docs` outputs, analytics configurations | Ensure CI, deployment, and documentation stay aligned; maintain comprehension artifacts. | Could be handled by repo maintainer/product ops. |

Each workstream can proceed in parallel once Phase 2 begins, prioritizing Workstreams 2–5 due to their direct impact on runtime paths and data exposure.
