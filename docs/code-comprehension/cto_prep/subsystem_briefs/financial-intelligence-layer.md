# CTO Subsystem Brief: financial-intelligence-layer
## What This System Does
It’s the `_finance_loader.js` script plus the unseen `/data/financials.json` file. Every Command Center page loads that JSON, formats current MRR/burn/pipeline numbers, and broadcasts a `financialsLoaded` event so dashboards display KPIs.
## Why It Matters To The Business
Leadership, investors, and operators rely on those dashboards to make budget, hiring, and fundraising calls. If the JSON is stale or missing, we’re making decisions on fiction while the UI still looks polished.
## Critical Dependencies
- The static file `/data/financials.json` (not in repo) with keys like `revenue.current_mrr`, `costs.cogs`, and `revenue.pipeline_opportunities`.
- `_finance_loader.js` running in every dashboard, plus any scripts listening for `financialsLoaded`.
- Browser Fetch API and the public CDN that serves the JSON.
## Key Tradeoffs
We chose a manual JSON drop over a secured API. That sped things up but means there’s no validation, no authentication, and no freshness metadata. Anyone can download our P&L, and a missing file just shows `--` silently.
## Main Risks
- Reliance on an undocumented process to generate/upload `financials.json`.
- No schema checks or rollback; a typo can wipe out a metric everywhere.
- No alerting or banners—dashboards appear “live” even when numbers are missing.
## Silent Failure Risks
- Missing JSON => every number becomes `--` with only a console warning.
- Stale JSON => old numbers keep showing forever; there’s no timestamp shown to users.
- Schema drift => we might render `$NaN` without realizing.
## What A CTO Would Ask
1. Who owns producing `/data/financials.json`, and how often is it regenerated?
2. Why isn’t this data secured behind auth or an API?
3. Where are the schema definitions and validation tests?
4. How do we alert the team when the fetch fails or no data arrives?
5. How do we roll back if a bad JSON file ships?
6. Can we log `financialsLoaded` events so we know what numbers were shown when?
## Recommended Next Improvements
- Stand up an authenticated API endpoint (Supabase/Edge Function) that returns validated financial data.
- Add schema validation + CI checks before publishing JSON.
- Display a visible banner/timestamp when data fails to load or hasn’t refreshed.
- Restrict access so only authenticated leaders can fetch the data.
## 60 Second Founder Explanation
“Our dashboards all read from a single JSON file we drop on the CDN. That was fast, but there’s no validation or auth—if the file goes missing, the UI just shows dashes. We need to replace it with a real API, add schema checks, and alert ourselves when the data doesn’t load.”
## Confidence Level
Medium
