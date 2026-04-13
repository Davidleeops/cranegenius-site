# CTO Subsystem Brief: supabase-signal-bridge
## 1. What This System Does
`command-center/supabase-loader.js` injects a lightweight PostgREST client that dashboard pages use to pull live opportunities and signal events when `window.__CG_SUPABASE_URL__` and `__CG_SUPABASE_ANON_KEY__` are present.
## 2. Why It Matters
It’s the only path to real-time data enrichment. Without it, dashboards fall back to static copy and leadership loses visibility into live pipeline health.
## 3. Critical Dependencies
- Internal: global window variables supplied at runtime (currently undocumented), dashboard scripts that call `cgSupabase.query`.
- External: Supabase project (tables `opportunities`, `signal_events`), PostgREST endpoint, anon key/RLS policies.
## 4. Key Tradeoffs
- Client-side simplicity vs. security: pushing anon keys to browsers is easy but exposes data and relies on Supabase RLS for safety.
- Timeout-based error handling; no retries/logging.
## 5. Main Risks
- Secrets distribution: anon key must be injected somehow; leakage risk is high.
- Reliability: if globals aren’t set, dashboards silently show stale content.
- Maintainability: No typed schema; column renames break UI at runtime.
## 6. Silent Failure Risks
- Query failures resolve to `null` without UI messaging; leadership believes data is “live” when it isn’t.
- Missing globals skip all Supabase fetches with no warning.
## 7. What a CTO Would Ask
1. Where do we define the Supabase URL/key in prod builds?
2. What RLS policies guard the data exposed via anon key?
3. How do we detect when Supabase is down/slow?
4. Are we logging query failures anywhere?
5. Why not proxy through our backend to keep keys private?
6. What volume/latency can PostgREST handle for these dashboards?
7. Do we paginate or limit data to avoid megabyte responses?
8. How do we rotate keys?
9. Is there a test harness for `cgSupabase` queries?
10. Can we share schema definitions so UI doesn’t guess column names?
## 8. Recommended Next Improvements
- Document injection path for globals; move secrets to server-side proxy.
- Add visible status indicators when live data fails.
- Log failures and add simple retries.
- Define typed responses and tests to catch schema drift.
## 9. 60-Second Founder Explanation
“We built a thin Supabase client in the browser so dashboards can show live data. It only works when we manually inject the URL and key, and if it fails the UI just stays static. We need to route those calls through an API so we can protect the key, log failures, and alert the team when the live feed dies.”
## 10. Confidence Level
Low-to-Medium — we understand the loader but still lack visibility into Supabase schema, credentials handling, and deployment path.
