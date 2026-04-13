# Module Manifest: command-center/launch-kanban.html
## 1. Purpose
- Kanban-style tracker for launch workstreams (product, data, capital, ops) with financial targets embedded via `_finance_loader`.
- Helps cross-functional team see blockers and readiness for investor outreach.

## 2. System Role
- Static HTML page with CSS for kanban cards; uses `_finance_loader.js` to populate top-level metrics and to broadcast the `financialsLoaded` event for optional listeners.
- No other programmatic dependencies.

## 3. Logic Breakdown
- Layout: hero metrics, kanban columns for "Signal Pipeline", "Capital Raise", etc., each containing hard-coded cards with owners/status tags.
- CTA elements referencing `data-fin` display burn/runway numbers; rest is static text.

## 4. Inputs / Outputs / Side Effects
### Inputs
- `data-fin` values (MRR, burn, net, pipeline weighted) from JSON.
### Outputs
- Updated DOM text.
### Side Effects
- None besides DOM updates.
### External Dependencies
- `_finance_loader.js`.

## 5. Tradeoffs
- **Benefits:** Fast to read, no tooling.
- **Risks:** Kanban statuses are static; after a week they’re out of date. Same vulnerability as other pages: exposures of real financials.
- **Alternatives:** Mirror from actual project management tool or embed screenshot from Linear.

## 6. Failure Modes
- Missing JSON → scoreboard blank but columns still claim progress.
- Manual edits cause inconsistent statuses vs actual operations.

## 7. Senior Engineer Challenge Questions
- Why isn’t this tied into a real backlog/board? Who updates these statuses?
- Do investors/customers see this page? If so, we’re leaking internal ops.

## 8. Risk Scoring
- business_criticality: 3
- complexity: 2
- coupling: 3
- test_coverage: 1
- observability: 1
- comprehensibility: 3
- change_risk: 3
- dark_code_score: 3
- refactor_priority: 3
- confidence_level: medium

## 9. Recommended Actions
- add_docs — Document update cadence + owner.
- refactor — Replace static HTML with synced board from tooling (Linear/Jira/Notion) or remove to avoid drift.

## 10. Founder Brief
This kanban is more of a static poster than a real board. Unless someone updates it weekly, it spreads misinformation. Either wire it into the system of record or retire it.
