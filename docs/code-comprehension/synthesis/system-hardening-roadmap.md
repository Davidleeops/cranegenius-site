# System Hardening Roadmap
## Now (0-2 weeks)
- **Secure financial data feed:** Build an authenticated API endpoint (or Supabase RPC) that replaces `/data/financials.json`, enforce schema validation, add UI banners/timestamps, and restrict access to authenticated users.
- **Regain platform source control:** Import the Next.js repo, automate `_next`/`.txt` generation in CI, and add client error telemetry (e.g., Sentry) to detect hydration failures.
- **Lock down datasets:** Gate `cranegenius_*` JSON behind auth, add freshness metadata, and log downloads for auditing.
- **Fix Supabase secret handling:** Move URL/key injection to server-side proxy or environment secrets, and expose a status indicator when live data isn’t loading.
- **Move GDELT secrets to GitHub Secrets + alerting:** Ensure workflow failures page Slack/PagerDuty.
- **Anti-dark-code process:** Require every data feed to document owner, schema, and refresh cadence in `docs/code-comprehension` before deploy.
## Next (2-6 weeks)
- **Command Center auth overhaul:** Replace `dark30` password with real auth (Supabase Auth, Netlify password, or SSO) and centralize access control.
- **Operator Track intake revamp:** Host form server-side, store submissions securely, log disqualified attempts, add consent text, and integrate with CRM.
- **Predictive analytics truthfulness:** Wire page to actual run-tracking JSON with timestamps and failure banners, or remove until ready.
- **Dataset provenance & licensing:** Capture source/licensing notes for `cranegenius_*`, `cables.geojson`, and map tiles; automate verification scripts.
- **Code comprehension governance:** Add CI check that fails when critical files change without updating relevant manifests/briefs.
- **Founder-visible reporting:** Build a short weekly data-health report (can be automated from validation scripts) summarizing freshness, auth status, and monitoring results.
## Later (6+ weeks)
- **API-first data platform:** Provide filtered/paginated endpoints for opportunities/signals with rate limiting and per-customer entitlements.
- **Infrastructure observability:** Add synthetic tests and monitoring for Supabase, datasets, and dashboards; log `financialsLoaded` + Supabase query metrics.
- **Dark-code prevention tooling:** Integrate schema validation + contract tests for all JSON feeds and enforce runbook links in repo.
- **CTO conversation readiness:** Maintain an automated digest that summarizes key risks, recent fixes, and outstanding dark areas for leadership calls.
- **Documentation automation:** Generate subsystem briefs and risk reports via script each release to avoid drift.
