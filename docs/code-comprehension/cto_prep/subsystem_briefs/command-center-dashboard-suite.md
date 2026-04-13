# CTO Subsystem Brief: command-center-dashboard-suite
## What This System Does
It’s a collection of static HTML dashboards (dashboard, financials, pipeline, execution plan, launch kanban, predictive analytics) that read shared JSON and optional Supabase data to show KPIs, pipeline health, and roadmap state for internal leaders.
## Why It Matters To The Business
Founders and investors rely on these pages to gauge revenue progress, burn, and launch readiness. If they’re wrong or stale, we could make strategic decisions on false data or expose sensitive metrics publicly.
## Critical Dependencies
- Internal: `_finance_loader.js`, `supabase-loader.js`, and the never-checked-in `/data/financials.json` file.
- External: Supabase PostgREST endpoint and credentials, Google Fonts/CDN, browser fetch APIs.
## Key Tradeoffs
- We chose plain HTML + JSON for speed, sacrificing authentication, logging, and schema guarantees. Supabase queries run client-side to avoid building backend APIs, but that puts secrets in browsers.
## Main Risks
- Reliability: Missing `financials.json` blanks the UI with no alert. Supabase errors resolve to `null` silently.
- Security: The “password” gate is a hard-coded string (`dark30`). Anyone can view P&L data.
- Maintainability: Static cards (e.g., kanban) rot quickly because they aren’t tied to a system of record.
## Silent Failure Risks
- Dashboards show `--` or stale numbers when JSON isn’t updated. Supabase content disappears with no banner. Predictive analytics page falls back to canned data if `runs/...` JSON is missing.
## What A CTO Would Ask
1. Who owns generating and uploading `financials.json`, and how often does it refresh?
2. How are Supabase URL/key values injected, and how do we rotate them?
3. Why isn’t the Command Center behind real auth?
4. Can we add alerts or banners when data fetches fail?
5. Where are pipeline probability calculations validated?
6. Do investors/customers have access to these URLs?
7. Can we unify data sources with the CRM/finance stack instead of manual JSON?
8. What’s the plan to migrate from static HTML to a proper app?
## Recommended Next Improvements
- Stand up an authenticated backend endpoint for financial data with schema validation and alerting.
- Replace the client-side password gate with proper auth (e.g., Netlify/Vercel password or Supabase Auth).
- Instrument loaders to display errors when Supabase or JSON fetches fail.
- Tie roadmap/kanban data to a source of truth (Linear/Notion) or remove misleading sections.
## 60 Second Founder Explanation
“Our Command Center pages are just static HTML files that pull one shared JSON file and optional Supabase data. That let us ship dashboards fast, but there’s no real login, the data can silently go stale, and the Supabase key sits in the browser. Before the next fundraising cycle, we need to secure the data feed, add real auth, and make sure the UI tells us whenever the numbers fail to load.”
## Confidence Level
Medium
