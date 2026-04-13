# Module Manifest: command-center/pipeline.html
## 1. Purpose
- Visualizes revenue pipeline by stage, geography, and signal source. Designed to keep sales efforts focused on most likely MRR contributors.

## 2. System Role
- Depends on `_finance_loader.js` for high-level pipeline totals and on `cgSupabase` for deeper signal/pipeline data.
- Upstream: `/data/financials.json`, Supabase tables such as `signal_events`. Downstream: DOM lists and tables across the page.

## 3. Logic Breakdown
- Hero section shows key totals using `data-fin` attributes.
- JS section near bottom fetches Supabase `signal_events` aggregated by `signal_source` to render pipeline breakdown; fallback copy instructs team to update JSON when Supabase unavailable.
- Additional script listens for `financialsLoaded` to highlight primary pipeline opportunity (name, probability) and update CTA text.
- Contains static HTML for pipeline cards if live data missing.

## 4. Inputs / Outputs / Side Effects
### Inputs
- Financial JSON for totals, Supabase `signal_events` table for source distribution.
### Outputs
- DOM tables for pipeline stage depth, `pipelinePrimary` CTA.
### Side Effects
- Network requests to Supabase with anon key.
### External Dependencies
- `_finance_loader.js`, `cgSupabase`, Google Fonts.

## 5. Tradeoffs
- **Benefits:** Single page organizes multiple views (stages, sources) with thin JS.
- **Risks:** Without Supabase, entire "Live Sources" section disappears silently. Sensitive pipeline info is public. Hard-coded fallback text becomes stale quickly.
- **Alternatives:** Use server-rendered data or export to spreadsheet/CRM.

## 6. Failure Modes
- Supabase query fails → `renderSourceBreakdown` never runs, leaving blank area.
- Financial JSON missing → top metrics `--` even though page suggests data is “live”.
- No pagination / limit on Supabase query; request can explode if table grows.

## 7. Senior Engineer Challenge Questions
- Where does Supabase data originate, and how is it authenticated/filtered before hitting this page?
- Should we be surfacing project/clients publicly without NDAs?
- How do we test that computed probability messaging stays aligned with pipeline weighting logic in `_finance_loader.js`?

## 8. Risk Scoring
- business_criticality: 4
- complexity: 3
- coupling: 4
- test_coverage: 1
- observability: 1
- comprehensibility: 3
- change_risk: 4
- dark_code_score: 4
- refactor_priority: 4
- confidence_level: medium

## 9. Recommended Actions
- add_instrumentation — Display user-visible status (e.g., "Live Supabase feed offline") when query fails.
- refactor — Move Supabase access server-side or behind authenticated portal.
- add_docs — Document required Supabase schema/columns.

## 10. Founder Brief
This view should tell you where revenue will come from, but it collapses without Supabase credentials and exposes pipeline details to anyone with the URL. Decide whether to invest in a secure CRM integration or accept that this is an aspirational mock.
