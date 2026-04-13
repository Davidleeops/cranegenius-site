# Module Manifest: command-center/dashboard.html
## 1. Purpose
- High-level operator dashboard summarizing financial metrics, funnel progress, roadmap Kanban, outreach stats, and market signals.
- Serves as leadership’s at-a-glance view of progress toward MRR and launch milestones.

## 2. System Role
- Static HTML page enhanced client-side by `_finance_loader.js` and optional Supabase queries.
- Runs in browser; no backend support besides fetching `/data/financials.json` and any configured Supabase tables.
- Upstream dependencies: `_finance_loader.js`, `cgSupabase`. Downstream: DOM sections across the page.

## 3. Logic Breakdown
- Layout uses pure CSS; metrics show placeholders with `data-fin` attributes (`mrr`, `pipeline_mrr`, `burn`, etc.) replaced by `_finance_loader`.
- Static sections (signals list, recommendations) are hard-coded copy.
- At bottom script listens for `financialsLoaded` event to populate revenue clients/pipeline cards and writes fallback copy if data missing.
- Another async block tries to pull pipeline data via `cgSupabase.query('opportunities')`; if not configured, nothing happens.
- Clock widget updates per second for ambiance only.

## 4. Inputs / Outputs / Side Effects
### Inputs
- `/data/financials.json`, optional Supabase `opportunities` table.
### Outputs
- On-screen numbers, occasional console warnings.
### Side Effects
- None beyond DOM updates.
### External Dependencies
- `_finance_loader.js`, optional Supabase, Google Fonts.

## 5. Tradeoffs
- **Benefits:** Quick to iterate; fallback content keeps UI from going blank when data missing.
- **Risks:** Without `financials.json`, numbers remain `--` but still look styled; leadership could misread. Supabase call lacks error UI. Static copy (Kanban, statuses) becomes stale immediately.
- **Alternatives:** Pre-render from a data pipeline or embed within an authenticated dashboard app.

## 6. Failure Modes
- Missing `financials.json` or data keys results in zeroed metrics.
- Supabase query rejects; script catches nothing, leaving UI empty with no message.
- Hard-coded password gate from `command-center/index.html` easily bypassed; unauthorized viewers could spy metrics if this file is public.

## 7. Senior Engineer Challenge Questions
- Where are the Supabase tables defined, and who ensures the schema matches DOM expectations?
- Should we log or alert when `financialsLoaded` fails (instead of showing `--`)?
- Why are milestone Kanban items inlined rather than fed from source of truth (e.g., Linear/Jira)?

## 8. Risk Scoring
- business_criticality: 5
- complexity: 3
- coupling: 4
- test_coverage: 1
- observability: 1
- comprehensibility: 3
- change_risk: 4
- dark_code_score: 4
- refactor_priority: 5
- confidence_level: medium

## 9. Recommended Actions
- add_instrumentation — Display a visible error banner when data fails to load.
- add_docs — Specify data contract for each `data-fin` key and example JSON.
- refactor — Move dynamic sections into a real app (Next.js, Supabase RPC) guarded by auth.
- add_tests — Browser smoke test verifying expected elements update when sample JSON served.

## 10. Founder Brief
This dashboard is what you look at to gauge company health, yet it depends on a missing JSON file and optional Supabase calls that never surface errors. Until data loading is hardened, treat it as a beautiful mock, not a trustworthy cockpit.
