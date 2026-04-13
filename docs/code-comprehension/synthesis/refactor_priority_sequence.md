# Refactor Priority Sequence
1. **Secure financial data pipeline** – replace `/data/financials.json` with authenticated API + schema validation + UI error states.
2. **Regain platform source control** – import the Next.js repo, automate `_next` and `.txt` payload generation, add client telemetry.
3. **Lock down platform datasets** – move `cranegenius_*` feeds behind authenticated, versioned APIs with freshness metadata.
4. **Harden Supabase access** – proxy queries server-side or inject keys via secrets, add status indicators when live data is offline.
5. **Real authentication for Command Center** – replace `dark30` password with proper auth (e.g., Supabase Auth, Netlify password) and gate `/command-center` routes.
6. **Instrument monitoring & secrets** – move GDELT keys into GitHub Secrets, integrate workflow alerts with Slack/PagerDuty, expand validation.
7. **Operator intake overhaul** – move Formspree to first-party endpoint, add consent logging, spam protection, and server-side gating.
8. **Predictive analytics data truth** – connect page to actual run-tracking feed or remove until data exists; add banner + timestamp.
9. **Dataset provenance documentation** – capture licensing, update cadence, and owners for GeoJSON/JSON assets; add checksums.
10. **Marketing/landing instrumentation** – add CTA event tracking, centralized design tokens, and monitoring for broken forms/links.
