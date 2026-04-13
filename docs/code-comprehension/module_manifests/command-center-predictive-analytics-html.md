# Module Manifest: command-center/predictive-analytics.html
## 1. Purpose
- **Fact:** Static dashboard describing predictive-analytics run queue, QA process, and logs by loading `../runs/predictive_analytics/dashboard.json`.
- **Fact:** If fetch fails, script renders the hard-coded `defaultData` object.
## 2. System Role
- Only surface showing ML process health; depends on an external JSON file that is missing from this repo.
## 3. Logic Breakdown
- `dataUrl` points to `../runs/predictive_analytics/dashboard.json` (not present). Fetch uses `.then(updateDom)` with `catch` falling back to `defaultData` and leaving “help” note visible.
- `render()` builds kanban columns, QA copy, and log entries based on JSON arrays.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** Expected JSON with keys `model_runs`, `kanban`, `qa_process`, `logs`.
- **Outputs:** DOM markup summarizing pipeline state.
- **Side effects:** On failure, no alert banner—UI simply shows canned defaults (“Define QA cadence + gates...”).
## 5. Tradeoffs
- Quick to stand up with static fallback, but because the JSON path isn’t shipped, the page effectively shows placeholder data masquerading as live status.
## 6. Silent Failure Risks
- Since `dashboard.json` is missing, page always renders `defaultData` while appearing legitimate—leadership may believe runs are current when they’re not.
- If JSON exists but schema changes, script silently displays partial info without errors surfaced to user.
## 7. Senior Engineer/CTO Questions
1. Where is `runs/predictive_analytics/dashboard.json` produced, and why isn’t it versioned?
2. Can we add a visible timestamp or “data unavailable” banner when fetch fails?
3. Should this be fed from the same system that tracks ML experiments (Weights & Biases, Notion)?
4. Who updates the QA gates/logs, and how do we ensure integrity?
5. Do we log when fallback data is shown so we know the section is dark?
## 8. Unknowns
- Whether the JSON is generated manually or by an automated run.
- Whether any alerting exists when models fail.
## 9. Risk Scoring
business_criticality:3, complexity:3, coupling:2, test_coverage:0, observability:1, comprehensibility:3, change_risk:3, dark_code_score:4, refactor_priority:4.
## 10. Recommended Actions
- Surface explicit error state when JSON missing, add `last_updated` timestamp, and integrate with actual ML pipeline or remove until data exists.
## 11. Founder Brief
“This page is supposed to show our predictive-analytics workflow, but the JSON it needs isn’t in the repo, so it always falls back to canned defaults. It looks alive even though no real data flows through it—that’s dangerous for credibility.”
