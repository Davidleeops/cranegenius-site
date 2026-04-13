# Anti-Dark-Code Operating Model
## Ongoing Process
1. **Before Coding (Comprehension Gate):** Every change must answer the comprehension gate checklist—business purpose, data truth, dependencies, tradeoffs, failure modes, and manifest updates.
2. **During PR Review:** Reviewers use the PR template to confirm data inputs/outputs, secret handling, and documentation updates. High-risk areas require senior engineer sign-off.
3. **After Merge:** Updated manifests, dependency maps, or ADRs are merged alongside code. CI should fail if critical files change without metadata updates.

## Roles & Responsibilities
- **Feature Owner:** Fills comprehension gate, updates manifests/briefs, and marks unknowns explicitly.
- **Reviewer (Engineering Lead):** Checks PR template, ensures dependency/failure mode coverage, and enforces escalation criteria.
- **Data Steward:** Owns `/data/financials.json` and `cranegenius_*` pipelines; provides freshness timestamps weekly.
- **Founder/CTO:** Review weekly report, approve escalations, and lead monthly deep-dive.

## Manifest Update Triggers
Update or create manifests when:
- Schema/data contracts change.
- New external dependencies or secrets are introduced.
- Confidence level drops below “High.”
- Module affects financial data, customer datasets, auth, or monitoring.

## Pre-Merge Checks
- Comprehension gate answered and attached to PR.
- Module manifests/briefs updated (CI check ensures diffs).
- Tests/validation scripts run (schema checks, linting, etc.).
- High-risk changes escalated for senior design review.

## Weekly Reviews
- Founder weekly template filled every Friday covering critical paths, freshness, incidents, and next fixes.
- CTO prep template updated before investor/customer meetings.
- Data Steward reports timestamps for `/data/financials.json`, `cranegenius_*`, Supabase feeds.

## Monthly Escalations
- Senior engineer + founder do a deep-dive on the highest-risk modules (per `top_20` list).
- Review ADRs; close resolved items, create new ones for emerging assumptions.
- Audit compliance of manifests and governance documents.

## Keeping Founder Visibility High, Low Overhead
- Use concise templates (weekly + CTO prep) that summarize risks and actions in one page.
- Automate reminders via CI or calendar to fill reports.
- Share weekly report and roadmap updates in founder meeting so decisions stay grounded in current risk.
