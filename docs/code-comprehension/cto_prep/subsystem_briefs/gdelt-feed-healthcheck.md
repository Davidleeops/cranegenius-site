# CTO Subsystem Brief: gdelt-feed-healthcheck
## 1. What This System Does
`tools/gdelt_healthcheck.py` runs hourly via `.github/workflows/gdelt-healthcheck.yml`, fetching a Supabase edge function for the GDELT feed and ensuring Google Translate endpoint works. It exits non-zero on failure to alert via GitHub Actions status.
## 2. Why It Matters
This is the only automated signal that the upstream industrial news feed and translation stack—the backbone for signal data—is alive. If it fails silently, the intelligence platform ships stale or empty signals.
## 3. Critical Dependencies
- Internal: Python script, GitHub Actions schedule.
- External: Supabase function URL + anon bearer token (hard-coded), Google Translate public endpoint, GitHub Actions runners.
## 4. Key Tradeoffs
- Simplicity vs. security: Hard-coded keys make the script portable but expose secrets in repo history.
- CI-based alerting vs. dedicated monitoring: relies on someone watching workflow failures.
## 5. Main Risks
- Secrets exposure in git; rotating them is manual.
- Reliability: GitHub Actions failure notifications might be ignored; no paging.
- Operational: Script assumes translator endpoint response shape; changes could break it.
## 6. Silent Failure Risks
- If workflow disabled or schedule paused, no monitoring occurs.
- Supabase returning partial data (e.g., fewer items) still counts as success.
## 7. What a CTO Would Ask
1. Who watches GitHub Actions failures? Do we integrate with Slack/PagerDuty?
2. Why are Supabase keys in plaintext? Can we move them into GitHub Secrets?
3. Is there rate limiting on Google Translate? Are we violating ToS?
4. Should we verify more than just first article translation?
5. Can we measure latency and log it for trend analysis?
6. Do we have redundancy if GitHub Actions has an outage?
7. How do we rotate keys without code changes?
8. Is there a staging feed to test against?
9. Should we store recent healthcheck results for auditing?
10. How do we alert business stakeholders when the feed is down?
## 8. Recommended Next Improvements
- Move API keys to GitHub Secrets and fetch via env vars.
- Pipe workflow results to Slack/PagerDuty.
- Expand validation (e.g., ensure article count > threshold).
- Consider running the healthcheck within Supabase/cron service closer to data source.
## 9. 60-Second Founder Explanation
“We monitor our GDELT feed with a Python script that GitHub runs every hour. It works, but the keys are hard-coded in git and the only alert is a failed GitHub run. We should move the keys into secrets and wire the job into Slack so we know right away if the signal feed breaks.”
## 10. Confidence Level
High — code and workflow are fully visible; dependencies are clear.
