# CTO Subsystem Brief: platform-data-feeds
## What This System Does
It ships the entire opportunity and signal datasets as static files (`platform/cranegenius_opportunities.json` and `platform/cranegenius_signals.json`) plus supporting geo layers. The compiled Next.js dashboard downloads these files directly to render customer-facing maps and tables.
## Why It Matters To The Business
Those datasets are the product. They’re what paying customers expect us to deliver securely and accurately. Right now every visitor—customer or not—can grab the full data dump, and we have no signal when the feed goes stale or corrupt.
## Critical Dependencies
- Static JSON files committed to the repo; no generation scripts included.
- CDN hosting under `/platform/` with no auth.
- Whatever upstream ETL produces the JSON (not documented here).
## Key Tradeoffs
We chose static files so we could demo instantly without building APIs or entitlement logic. The tradeoff is zero access control, no freshness metadata, and huge payloads that strain browsers.
## Main Risks
- Anyone (competitors, scrapers) can download the full datasets and reuse them.
- If the upstream export fails or data quality slips, the UI keeps showing stale info with no warning.
- Large files slow down customers on weak connections.
- Compliance/licensing exposure if the data shouldn’t be public.
## Silent Failure Risks
- A stalled export means customers see yesterday’s data while thinking it’s real-time.
- A malformed JSON file makes the platform break silently—only browser console shows an error.
## What A CTO Would Ask
1. Where are these JSON files generated, and who verifies them before deploy?
2. How do we enforce entitlements so non-customers can’t grab everything?
3. Can we add timestamps so users know how fresh the data is?
4. What’s the plan when datasets get too large for static delivery?
5. Are we allowed to redistribute all the underlying permit/signal data publicly?
## Recommended Next Improvements
- Build a governed pipeline with schema validation, versioning, and freshness metadata.
- Gate access via authenticated API endpoints with filtering/pagination.
- Add client-visible “last updated” indicators and alerting on pipeline failures.
- Consider per-customer datasets or query endpoints instead of broadcasting the full dump.
## 60 Second Founder Explanation
“Our platform data plane is two giant JSON files we serve publicly. That was great for demos, but anyone can copy them, and if the export stops the dashboard still looks fine even though it’s stale. We need a real pipeline with auth, freshness tracking, and schema checks.”
## Confidence Level
Low-to-Medium
