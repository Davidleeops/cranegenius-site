# Module Manifest: command-center/financials.html
## 1. Purpose
- Detailed financial statement view (MRR, burn, gross/net margin, pipeline breakdown, cash forecast) derived from the shared `financials.json` data file.
- Serves as de facto P&L and pipeline commit tracker.

## 2. System Role
- Static HTML enhanced entirely via `_finance_loader.js`; also contains bespoke script to render pipeline tables directly from fetched JSON for deeper detail.
- Upstream dependency: `/data/financials.json`. Downstream: DOM tables, summary, risk banners.

## 3. Logic Breakdown
- Layout organizes metrics into cards: overview, pipeline health, cost breakdown, cash runway.
- Additional script (lines 480+) fetches the same JSON separately to build detailed tables for pipeline opportunities and expense ledgers, showing fallback text if fetch fails.
- Includes instructions to creators to modify JSON file to update everything.
- No authentication; page accessible if someone knows URL.

## 4. Inputs / Outputs / Side Effects
### Inputs
- JSON keys: `revenue.current_mrr`, `target_mrr_90d`, `clients`, `pipeline_opportunities`, `costs.cogs`, `costs.opex`, etc.
### Outputs
- Formatted DOM nodes, dynamic tables with opportunity detail.
### Side Effects
- Duplicate fetch to same JSON (one from `_finance_loader`, one inline) doubling network hits.
### External Dependencies
- `_finance_loader.js`, browser fetch APIs.

## 5. Tradeoffs
- **Benefits:** Single source of truth JSON, immediate updates without redeploy when file replaced.
- **Risks:** No schema validation; editing JSON incorrectly can break entire page. Duplicate fetch wasteful. Sensitive revenue/client data committed into repo and exposed publicly.
- **Alternatives:** Move numbers to secured database/API with auth; generate static page during build with real templating.

## 6. Failure Modes
- JSON missing → page shows red banner but still mostly blank.
- `pipeline_opportunities` absent → placeholder text instructs team to update file, but no alert to Slack etc.
- Because file is public, competitors can download P&L data.

## 7. Senior Engineer Challenge Questions
- Where is access control? Shouldn’t P&L numbers be behind auth?
- Why duplicate fetch instead of letting loader share parsed data/event payloads?
- How do we ensure JSON edits go through review (linting, schema)?

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
- add_docs — Publish JSON schema + instructions for updating pipeline arrays.
- refactor — Consolidate fetch logic into shared module; gate behind real auth; consider moving data to Supabase or server-rendered pipeline.
- add_tests — Snapshot tests verifying table renders for sample JSON, preventing regressions.

## 10. Founder Brief
This file is literally your P&L on the open internet. Anyone can see your clients, pipeline, burn. Beyond security, the whole view depends on a manual JSON edit—there’s no guarantee numbers are fresh. Build a proper, authenticated data pipe before relying on this page.
