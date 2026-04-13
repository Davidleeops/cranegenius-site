# Module Manifest: .github/workflows/gdelt-healthcheck.yml
## 1. Purpose
- **Fact:** GitHub Actions workflow that schedules the `GDELT Feed Healthcheck` job every hour (`cron: '0 * * * *'`) and on manual dispatch.
## 2. System Role
- Runs `tools/gdelt_healthcheck.py` on `ubuntu-latest`, ensuring upstream Supabase feed is alive.
## 3. Logic Breakdown
- Steps: `actions/checkout@v4`, `actions/setup-python@v5` (python 3.x), pip upgrade placeholder, run script inside `tools/` directory.
- Workflow timeout: 15 minutes.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** Repo contents (includes hard-coded secrets). No environment secrets configured.
- **Outputs:** GitHub Actions log + status; no external notifications defined here.
- **Side effects:** None beyond invoking script.
## 5. Tradeoffs
- Cron-based monitoring leverages GitHub infra but lacks alert routing; failure requires someone watching GitHub UI.
## 6. Silent Failure Risks
- Disabling cron or running into GitHub Actions quota would halt monitoring silently.
- Because secrets live in code, rotating them means editing workflow + script rather than updating secrets UI.
## 7. Senior Engineer/CTO Questions
1. Who is accountable for triaging failed runs? Is there Slack/Email integration?
2. Why are we not using `secrets` in the workflow to inject Supabase keys?
3. Should we add caching or dependency installs if the script grows?
4. Do we need to run from a region closer to Supabase to reduce latency or network egress?
## 8. Unknowns
- Whether GitHub repository settings send failure emails (not visible here).
## 9. Risk Scoring
business_criticality:3, complexity:2, coupling:2, test_coverage:0, observability:1, comprehensibility:5, change_risk:2, dark_code_score:2, refactor_priority:3.
## 10. Recommended Actions
- Move secrets into GitHub Actions secret store, integrate `workflow_run` notifications (Slack, PagerDuty), and document runbook for failures.
## 11. Founder Brief
“The GitHub workflow is just a cron that runs our Python healthcheck. Right now it stores no secrets and sends no alerts, so unless someone checks GitHub we don’t know if the signal feed died.”
