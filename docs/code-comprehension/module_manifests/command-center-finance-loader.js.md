# Module Manifest: command-center/_finance_loader.js
## 1. Purpose
- **Fact:** Shared script loaded by `dashboard.html`, `financials.html`, `pipeline.html`, `execution-plan.html`, and `launch-kanban.html` to pull `/data/financials.json` and bind values into `data-fin` elements.
- **Fact:** Computes derived metrics (burn, gross/net margins, pipeline weighting) before dispatching a `financialsLoaded` event.
## 2. System Role
- Only ingestion point for financial data across the Command Center; if it fails, every dashboard loses KPI numbers.
## 3. Logic Breakdown
- Fetches `/data/financials.json?v=<timestamp>` with `cache: 'no-store'`.
- `computeTotals()` sums `costs.cogs` and `costs.opex`, calculates burn/margins.
- `pipelineWeighted` falls back to manual calculation if JSON lacks `pipeline_mrr_weighted`.
- Updates DOM nodes via `[data-fin]` selectors and optional `data-fin-prefix/suffix` attributes.
- Dispatches `financialsLoaded` with raw JSON and derived metrics.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** JSON file expected at `/data/financials.json`. This file is absent from repo (unknown owner).
- **Outputs:** DOM text updates; `financialsLoaded` event for other scripts.
- **Side effects:** Console warning if fetch fails; no user-visible error.
## 5. Tradeoffs
- Manual JSON upload avoids backend work but assumes discipline outside code. There’s no schema validation or fallback data beyond `--` placeholders, so a malformed file silently breaks dashboards.
## 6. Silent Failure Risks
- Missing file => every metric displays `--` yet dashboards still load and show static narratives.
- Stale JSON (old timestamp) continues to render with no freshness indicator.
- If JSON shape changes (e.g., rename `revenue.current_mrr`), formatting quietly outputs `$NaN`.
## 7. Senior Engineer/CTO Questions
1. Who generates `/data/financials.json`, what is the schema, and how often is it updated?
2. How do we validate data before publishing (CI, checksum)?
3. Why is there no UI banner when fetch fails or JSON contains NaNs?
4. Should we secure the JSON behind auth to avoid leaking pipeline data?
5. Can we cache or version data for rollback if a bad file ships?
6. How do we prevent race conditions if multiple pages load simultaneously?
7. Are we logging `financialsLoaded` so we can trace what numbers leadership saw?
## 8. Unknowns
- Data source (spreadsheet? CRM?).
- Hosting location—likely static file on same CDN, but not documented.
## 9. Risk Scoring
business_criticality:5, complexity:3, coupling:5, test_coverage:0, observability:1, comprehensibility:4, change_risk:4, dark_code_score:4, refactor_priority:5.
## 10. Recommended Actions
- Define schema + owner for `financials.json`; add schema validation and fail-fast UI messaging; move data behind authenticated API; instrument `financialsLoaded` events.
## 11. Founder Brief
“This loader is the only place we pull revenue/burn numbers. It expects a `/data/financials.json` file that isn’t in the repo. When that file is missing or stale, the dashboards just show dashes but otherwise look fine—no alerts. We need a governed data feed with validation and visible error states.”
