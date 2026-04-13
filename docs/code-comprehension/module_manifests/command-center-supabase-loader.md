# Module Manifest: command-center/supabase-loader.js
## 1. Purpose
- Provides a minimal PostgREST client to query Supabase tables from dashboard pages when runtime config is present.
- Allows replacing static placeholder lists with live data without rewriting each page’s fetch logic.

## 2. System Role
- Expected to be included wherever live Supabase data is needed (`dashboard.html`, `pipeline.html`).
- Relies on two globals injected elsewhere: `window.__CG_SUPABASE_URL__` and `window.__CG_SUPABASE_ANON_KEY__`.
- Exposes `window.cgSupabase` object with `isConfigured()` and `query(table, opts)` methods.

## 3. Logic Breakdown
- Guard against double init using `window.__cgSupabaseLoaderInit` flag.
- Pulls URL/key from window, stores in closure.
- `query()` builds querystring from `select`, `eq`, `order`, `limit` options and executes `fetch` with `apikey` + `Authorization` headers, 5s timeout via `AbortController`.
- On success returns parsed JSON; on failure resolves to `null` so UIs can fallback.

## 4. Inputs / Outputs / Side Effects
### Inputs
- Table name and optional filters.
### Outputs
- Promise resolving to array of rows or `null`.
### Side Effects
- Network requests to Supabase PostgREST endpoint.
### External Dependencies
- Supabase project with anonymous key, PostgREST API.

## 5. Tradeoffs
- **Benefits:** Simple wrapper avoids repeating fetch/timeout boilerplate.
- **Risks:** Requires shipping Supabase anon key to browser; no row-level security beyond Supabase’s policies. No retries/backoff. Timeout is fixed at 5s, and errors are swallowed (`null`).
- **Alternatives:** Proxy through backend, or SSR the data.

## 6. Failure Modes
- Missing globals ⇒ `cgSupabase.isConfigured()` false, calling `query` returns resolved `null`; UI quietly falls back to stale copy.
- Supabase schema changes break clients with no compile-time warning.
- Key rotation requires redeploy of static files that inject window vars (not documented).

## 7. Senior Engineer Challenge Questions
- Where do the global URL/key values live, and how are they injected securely?
- Which Supabase tables/columns are exposed publicly? Are RLS policies in place?
- Should query errors be logged somewhere rather than suppressed?

## 8. Risk Scoring
- business_criticality: 4
- complexity: 2
- coupling: 3
- test_coverage: 1
- observability: 1
- comprehensibility: 3
- change_risk: 3
- dark_code_score: 4
- refactor_priority: 4
- confidence_level: high

## 9. Recommended Actions
- add_docs — Describe how to set `__CG_SUPABASE_*` in each environment.
- add_instrumentation — Emit telemetry/console errors when queries fail to highlight stale data.
- refactor — Move to tokenless server proxy or SSR to avoid exposing keys.

## 10. Founder Brief
This loader is the only bridge to live operational data, and it assumes you’re okay publishing your Supabase credentials to every visitor. Unless that’s deliberate, you need a safer data path before trusting these dashboards.
