# Module Manifest: tools/gdelt_healthcheck.py
## 1. Purpose
- **Fact:** Python script (169 lines) that fetches the Supabase edge function endpoint `https://qdnaglhailuflynirqtt.supabase.co/functions/v1/live-feeds?feed=gdelt` and the Google Translate API to validate the GDELT signal feed plus translation layer.
## 2. System Role
- Invoked hourly by `.github/workflows/gdelt-healthcheck.yml`. Exit code determines GitHub Actions success/failure.
## 3. Logic Breakdown
- `fetch_json(url, headers, timeout)` uses `urllib.request`.
- `check_feed()` retries once on `TimeoutError`, ensures HTTP 200 and that payload contains `articles` list.
- `check_translation()` hits `https://translate.googleapis.com/translate_a/single` with `client=gtx` and sample text.
- Hard-coded `SUPABASE_HEADERS` include API key and bearer token.
## 4. Inputs / Outputs / Side Effects
- **Inputs:** Supabase URL/key, Google endpoint.
- **Outputs:** Stdout log `[GDELT HEALTHCHECK] OK | articles=...`; exit code 0/1.
- **Side effects:** Secrets exposed in repo; network calls may trigger rate limits.
## 5. Tradeoffs
- Dependencies limited to stdlib for portability, but storing keys in code is high risk. No structured logging or alert routing beyond GitHub status.
## 6. Silent Failure Risks
- If GitHub Actions cron is disabled, healthcheck never runs and we have no other monitor.
- Script only validates “at least one article”; partial feed degradation wouldn’t be detected.
## 7. Senior Engineer/CTO Questions
1. Why are Supabase keys hard-coded instead of pulled from GitHub Secrets?
2. Who receives notifications when the workflow fails?
3. Are we within Google Translate `gtx` usage limits? Should we move to paid API?
4. Should we verify schema (e.g., article fields) rather than just count?
5. Can we log latency metrics to spot slowdowns?
## 8. Unknowns
- Whether workflow failures trigger Slack/PagerDuty (not defined in repo).
- Whether Supabase function returns additional info we should validate.
## 9. Risk Scoring
business_criticality:4, complexity:2, coupling:3, test_coverage:0, observability:2, comprehensibility:5, change_risk:3, dark_code_score:2, refactor_priority:4.
## 10. Recommended Actions
- Move API keys to GitHub Secrets/environment variables, expand validation logic (schema + latency thresholds), integrate workflow status with alerting channel, and consider moving translation check to official API.
## 11. Founder Brief
“Our GDELT watchdog script pings Supabase and Google Translate every hour, but the keys live in the file and only a GitHub failure flag lets us know something broke. We need secrets in GitHub Secrets and a Slack alert when the job fails.”
