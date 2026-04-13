# Folder Summary: tools
## Role
Contains operational scripts, primarily the GDELT feed healthcheck used by CI to verify upstream news/translation services.
## Key Files and Modules
- `gdelt_healthcheck.py`: Python script that hits a Supabase function and Google Translate endpoint.
- `README.md`: minimal notes placeholder.
## Main Data Flows
- Script fetches Supabase edge function (`/functions/v1/live-feeds?feed=gdelt`) using hard-coded anon key, checks response for articles, then pings Google Translate with a sample headline.
- Exit code determines GitHub Actions success.
## Dependencies
- Internal: `.github/workflows/gdelt-healthcheck.yml` scheduler.
- External: Supabase project `qdnaglhailuflynirqtt`, Google Translate public API, python3 runtime.
## Top Risks
- Secrets embedded directly in the script and committed to git.
- No alerting beyond GitHub Actions failure; if workflow disabled, monitoring stops.
- Translator endpoint is unofficial and could throttle or change format without warning.
## Darkest Areas
- None—the script is clear, but operational runbooks (alert routing, key rotation) are missing.
## Open Questions
- Do workflow failures notify anyone automatically?
- What’s the SLA for the Supabase function, and how do we handle partial data?
- Should we expand checks beyond “first article translates” to catch subtle data issues?
