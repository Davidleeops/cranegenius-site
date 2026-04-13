# Folder Summary: command-center
## Role
Internal-facing suite of static dashboards that present signals, pipeline, project boards, prompts, and financial targets to founders/operators. Acts as the "single pane" for revenue execution.

## Key Files and Modules
- `index.html`: password-gated shell providing quick stats and navigation.
- `dashboard.html`, `financials.html`, `pipeline.html`, `execution-plan.html`, `launch-kanban.html`: core performance dashboards that share `_finance_loader.js`.
- `supabase-loader.js`: optional helper to pull live data from Supabase PostgREST tables.
- `predictive-analytics.html`: renders QA/process data from `runs/predictive_analytics/dashboard.json` (not in repo).
- Supporting narrative docs: `architecture.html`, `system-schematic.html`, `prompts.html`, `projects.html`, `signals-kanban.html`.

## Main Data Flows
- `command-center/_finance_loader.js` fetches `/data/financials.json` (missing) with no cache and dispatches `financialsLoaded` events consumed by dashboards.
- `supabase-loader.js` expects `window.__CG_SUPABASE_URL__/__CG_SUPABASE_ANON_KEY__` to be defined globally and exposes `cgSupabase.query()`.
- Several pages (pipeline, dashboard) attempt to call `cgSupabase` to enhance static content; when undefined, they fall back to placeholders silently.
- No backend; everything executes in browser.

## Dependencies
- Internal: shared loader script and assumed `/data/financials.json` file.
- External: Supabase PostgREST endpoint, fetch API, Google Fonts.

## Top Risks
- **Single point of failure:** Without `data/financials.json`, most numbers show `--` yet no alert fires.
- **Secret handling:** Supabase URL + anon key must be injected globally—very easy to leak or misconfigure.
- **Password gate:** Hard-coded password (`dark30`) stored client-side; offers no real protection.
- **Missing data files:** predictive analytics expects `../runs/...` which is absent; page falls back to stale defaults.

## Darkest Areas
- `_finance_loader.js` because it governs financial truth but lacks schema validation.
- `supabase-loader.js` because injection path for credentials is undocumented.
- `command-center/index.html` password gate due to pseudo-security.

## Open Questions
- Where is `/data/financials.json` generated? How is it deployed?
- Are Supabase credentials ever present in prod? If not, why keep the code?
- Should these dashboards be private at all (no auth) or moved behind real auth?
