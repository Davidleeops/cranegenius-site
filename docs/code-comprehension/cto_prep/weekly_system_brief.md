# Weekly System Brief
## System Overview
CraneGenius is deployed as static assets: marketing pages, an internal Command Center, and the compiled customer platform. Data flows through manual JSON drops (`/data/financials.json`, `cranegenius_*` files) and optional Supabase queries injected client-side. One GitHub cron monitors the upstream GDELT feed.
## Critical Paths
- `_finance_loader.js` pulling `/data/financials.json` for every KPI.
- Supabase loader and anon-key globals powering “live” sections of the Command Center.
- Platform Next.js bundles + public datasets delivering customer-facing maps.
- Operator Track intake funnel with client-side gating + Formspree.
- GDELT healthcheck workflow validating the news/translation feed.
## Top Risks
- Financial and customer data delivered as public static JSON with no validation or auth.
- Platform source/build pipeline missing from repo—compiled assets can’t be audited or patched.
- Supabase secrets shipped to browsers, and failures are invisible to users.
- Predictive analytics page always shows fallback data; marketing pages embed GA/Clarity without consent or link monitoring.
- Monitoring secrets live in code; GitHub Actions cron is the only alert path.
## Recent Findings
- Marketing/CapexLayer pages have hidden dependencies (GA4, Clarity, RB2B) with no consent handling.
- Operator intake relies solely on `checkEligibility()`; disqualified leads are never logged.
- Large datasets (`cranegenius_*`, `cables.geojson`) have no provenance or update cadence documented.
- New ADRs capture brittle assumptions around static financial JSON and public datasets.
## Immediate Priorities
1. Build a secure, validated API replacement for `/data/financials.json` and add UI error states.
2. Import the Next.js source/build into version control; instrument client error logging.
3. Gate platform datasets behind authenticated, versioned APIs with freshness indicators.
4. Proxy Supabase access (or at least secure key injection) and expose status when live data is offline.
5. Move GDELT secrets into GitHub Secrets and route failures to Slack/PagerDuty.
## Executive Summary
We’re running the company on static files and client-side secrets. Financial dashboards, customer datasets, and even intake forms can fail silently while looking healthy. The immediate focus is securing data truth (financial + platform), regaining control of the compiled dashboard, locking down Supabase access, and ensuring our only monitoring job actually alerts humans when it fails.
