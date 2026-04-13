# Module Manifest: command-center/_finance_loader.js
## 1. Purpose
- Shared client-side loader that reads `/data/financials.json`, formats core metrics (MRR, burn, pipeline), and updates any element with `data-fin` attributes.
- Provides a single point where financial numbers are computed before being mirrored across multiple dashboards.

## 2. System Role
- Loaded via `<script src="/command-center/_finance_loader.js" defer></script>` in dashboard, financials, pipeline, execution-plan, and launch-kanban pages.
- Upstream dependency: static JSON file `data/financials.json` (not in repo). Downstream: DOM updates and a `financialsLoaded` custom event that other scripts can listen to.

## 3. Logic Breakdown
- Guards against double initialization via `window.__craneFinanceLoaderInitialized` flag.
- Helper functions `fmt()` and `pct()` format dollars/percentages.
- `computeTotals()` sums `cogs` and `opex`, derives burn, gross/net margins, pipeline weighting.
- `updateDom()` builds a `map` of stringified values (e.g., `mrr`, `gross_margin`) and iterates over `[data-fin]` elements to inject formatted text, honoring optional prefixes/suffixes.
- After DOM updates it dispatches `financialsLoaded` containing raw + computed metrics.
- `loadFinancials()` fetches `/data/financials.json?v=timestamp` with `cache: 'no-store'`, throwing console warnings on failure. Called once when DOM ready.

## 4. Inputs / Outputs / Side Effects
### Inputs
- JSON structure with nested `revenue`, `costs`, `period`, `pipeline_opportunities` arrays.
### Outputs
- DOM text nodes replaced; `CustomEvent('financialsLoaded', detail)` emitted.
### Side Effects
- Network request to `/data/financials.json`; console warnings on failure.
### External Dependencies
- Browser Fetch/Promise APIs only.

## 5. Tradeoffs
- **Benefits:** Centralized formatter reduces copy/paste across pages; event allows additional listeners.
- **Risks:** Entire repo depends on single JSON path; no schema validation or error messaging in UI. Weighted pipeline logic assumes optional fields exist; missing keys fall back to `0` without alert.
- **Alternatives:** Build data via API with auth, or pre-render values server-side.

## 6. Failure Modes
- `financials.json` missing/malformed ⇒ all dashboards show `--`; only console warns.
- Large JSON results cause repeated fetches on refresh; no caching/backoff.
- `pipeline_opportunities` weighting logic treats `probability_pct` as optional; if inconsistent, derived probability becomes nonsensical.

## 7. Senior Engineer Challenge Questions
- Where is schema for `financials.json` defined/tested?
- How do we rollback if someone commits sensitive client data into this JSON?
- Should we guard against negative numbers or units mismatches (monthly vs annual)?

## 8. Risk Scoring
- business_criticality: 5
- complexity: 3
- coupling: 4
- test_coverage: 1
- observability: 2
- comprehensibility: 3
- change_risk: 4
- dark_code_score: 4
- refactor_priority: 5
- confidence_level: high

## 9. Recommended Actions
- add_docs — Document schema + owner of `financials.json` with sample file checked in.
- add_tests — Write unit tests (even browserless) verifying derived totals and event payloads.
- add_instrumentation — Surface toast/banner when fetch fails instead of silent console.
- refactor — Move to authenticated API or at least parameterize file path with environment guard.

## 10. Founder Brief
Every KPI on the Command Center comes from this script, yet it depends on an unversioned JSON file and silently fails. If that file is stale or missing, leadership dashboards lie. Treat this as production code with schema validation, alerting, and a secure data source.
